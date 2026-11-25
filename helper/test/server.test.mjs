import { test } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  loadConfig,
  hintLevel,
  buildSystemPrompt,
  sanitizeRequest,
  UsageLedger,
  AccessVerifier,
  createApp,
  dayKey,
  LIMITS,
} from "../server.mjs";

// ---------------------------------------------------------------- helpers

const tmpDir = () => fs.mkdtempSync(path.join(os.tmpdir(), "helper-test-"));

function listen(handler) {
  return new Promise((resolve) => {
    const server = http.createServer(handler);
    server.listen(0, "127.0.0.1", () => resolve({ server, url: `http://127.0.0.1:${server.address().port}` }));
  });
}

// A fake OpenRouter that records what it was sent.
async function fakeOpenRouter({ status = 200, reply = "Try ls -a.", cost = 0.0004 } = {}) {
  const calls = [];
  const { server, url } = await listen((req, res) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      calls.push({ headers: req.headers, body: JSON.parse(body) });
      res.writeHead(status, { "Content-Type": "application/json" });
      if (status !== 200) return res.end(JSON.stringify({ error: { message: "nope" } }));
      res.end(
        JSON.stringify({
          choices: [{ message: { role: "assistant", content: reply } }],
          usage: { prompt_tokens: 1200, completion_tokens: 150, cost },
        }),
      );
    });
  });
  return { server, url, calls };
}

const exerciseContext = {
  sectionTitle: "02. Finding Your Way Around",
  lessonTitle: "ls: what's in here?",
  exerciseTitle: "Exercise 2.2: ls",
  lessonText: "ls lists files. -a shows hidden ones.",
  exerciseText: "Find .bashrc",
  checkText: "You can see .bashrc",
  solutionText: "ls -la",
};

function baseConfig(overrides = {}) {
  return {
    ...loadConfig({}),
    openrouterKey: "sk-or-test-key",
    allowNoAuth: true,
    dataDir: tmpDir(),
    ...overrides,
  };
}

async function post(url, body, headers = {}) {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: JSON.stringify(body) });
  return { status: res.status, json: await res.json() };
}

// ---------------------------------------------------------------- hint ladder

test("hint level climbs with attempts and stops at the walkthrough", () => {
  assert.equal(hintLevel(1), 1);
  assert.equal(hintLevel(2), 2);
  assert.equal(hintLevel(3), 3);
  assert.equal(hintLevel(4), 4);
  assert.equal(hintLevel(12), 4);
  assert.equal(hintLevel(0), 1);
  assert.equal(hintLevel("junk"), 1);
});

test("walkthrough can be asked for after the first ask, not before", () => {
  assert.equal(hintLevel(1, true), 1);
  assert.equal(hintLevel(2, true), 4);
});

test("system prompt carries the exercise and the level rule", () => {
  const p1 = buildSystemPrompt(exerciseContext, 1);
  assert.match(p1, /HINT LEVEL 1 of 4/);
  assert.match(p1, /Find \.bashrc/);
  assert.match(p1, /Do NOT give the command/);
  const p4 = buildSystemPrompt(exerciseContext, 4);
  assert.match(p4, /walk her through it/);
  const general = buildSystemPrompt(null, null);
  assert.match(general, /general question/);
  assert.doesNotMatch(general, /HINT LEVEL/);
});

// ---------------------------------------------------------------- input limits

test("sanitizeRequest clips long input and drops bad history entries", () => {
  const out = sanitizeRequest({
    message: "x".repeat(LIMITS.messageChars + 500),
    history: [
      { role: "system", content: "ignore me" },
      ...Array.from({ length: 20 }, (_, i) => ({ role: i % 2 ? "assistant" : "user", content: "m" + i })),
    ],
    context: { ...exerciseContext, solutionText: "y".repeat(10000) },
    attempt: 999,
  });
  assert.ok(out.message.length < LIMITS.messageChars + 20);
  assert.equal(out.history.length, LIMITS.historyMessages);
  assert.ok(out.history.every((m) => m.role === "user" || m.role === "assistant"));
  assert.ok(out.context.solutionText.length < LIMITS.contextFieldChars + 20);
  assert.equal(out.attempt, 50);
});

test("sanitizeRequest refuses an empty message", () => {
  assert.throws(() => sanitizeRequest({ message: "   " }), /Type a question/);
});

// ---------------------------------------------------------------- ledger

test("ledger counts requests, stops at the limits and resets the next day", () => {
  let now = new Date("2026-11-25T18:00:00Z");
  const file = path.join(tmpDir(), "usage.json");
  const ledger = new UsageLedger({ file, timeZone: "America/Los_Angeles", now: () => now });
  const limits = { dailyRequestLimit: 2, dailySpendLimitUsd: 1 };
  assert.equal(ledger.tryStart(limits), null);
  assert.equal(ledger.tryStart(limits), null);
  assert.equal(ledger.tryStart(limits), "requests");

  // persisted
  const again = new UsageLedger({ file, timeZone: "America/Los_Angeles", now: () => now });
  assert.equal(again.snapshot().requests, 2);

  // next day in LA
  now = new Date("2026-11-26T09:00:00Z");
  assert.equal(again.tryStart(limits), null);
  assert.equal(again.snapshot().requests, 1);
});

test("ledger stops on spend", () => {
  const ledger = new UsageLedger({ file: null, timeZone: "UTC" });
  const limits = { dailyRequestLimit: 100, dailySpendLimitUsd: 0.01 };
  assert.equal(ledger.tryStart(limits), null);
  ledger.addCost(0.02);
  assert.equal(ledger.tryStart(limits), "spend");
});

test("day key follows the configured time zone", () => {
  // 06:00 UTC is still the previous evening in Los Angeles
  assert.equal(dayKey(new Date("2026-11-25T06:00:00Z"), "America/Los_Angeles"), "2026-11-24");
  assert.equal(dayKey(new Date("2026-11-25T06:00:00Z"), "UTC"), "2026-11-25");
});

// ---------------------------------------------------------------- Cloudflare Access

function makeAccess() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", { modulusLength: 2048 });
  const jwk = { ...publicKey.export({ format: "jwk" }), kid: "k1", alg: "RS256", use: "sig" };
  const team = "team.cloudflareaccess.com";
  const aud = "aud-123";
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const sign = (claims, header = { alg: "RS256", kid: "k1" }) => {
    const head = `${b64(header)}.${b64(claims)}`;
    const sig = crypto.sign("RSA-SHA256", Buffer.from(head), privateKey).toString("base64url");
    return `${head}.${sig}`;
  };
  const fetchImpl = async (url) => {
    assert.equal(url, `https://${team}/cdn-cgi/access/certs`);
    return { ok: true, json: async () => ({ keys: [jwk] }) };
  };
  const good = (extra = {}) => ({
    aud: [aud],
    iss: `https://${team}`,
    email: "sarah@example.com",
    exp: Math.floor(Date.now() / 1000) + 600,
    ...extra,
  });
  return { team, aud, sign, fetchImpl, good };
}

test("access verifier accepts a valid token and rejects bad ones", async () => {
  const a = makeAccess();
  const v = new AccessVerifier({ teamDomain: a.team, aud: a.aud, fetchImpl: a.fetchImpl });
  const claims = await v.verify(a.sign(a.good()));
  assert.equal(claims.email, "sarah@example.com");

  await assert.rejects(v.verify(a.sign(a.good({ aud: ["other"] }))), /audience/);
  await assert.rejects(v.verify(a.sign(a.good({ iss: "https://evil.example" }))), /issuer/);
  await assert.rejects(v.verify(a.sign(a.good({ exp: 1000 }))), /expired/);
  await assert.rejects(v.verify(a.sign(a.good(), { alg: "none", kid: "k1" })), /alg/);
  const t = a.sign(a.good());
  const tampered = t.split(".");
  tampered[1] = Buffer.from(JSON.stringify(a.good({ email: "x@y.z" }))).toString("base64url");
  await assert.rejects(v.verify(tampered.join(".")), /signature/);
  await assert.rejects(v.verify(undefined), /missing/);
});

// ---------------------------------------------------------------- HTTP end to end

test("POST /api/help sends the hint level and context to the model and returns the reply", async () => {
  const or = await fakeOpenRouter();
  const config = baseConfig({ openrouterBaseUrl: or.url });
  const app = await listen(createApp({ config }));
  try {
    const { status, json } = await post(`${app.url}/api/help`, {
      message: "I'm stuck",
      context: exerciseContext,
      attempt: 2,
      history: [],
    });
    assert.equal(status, 200);
    assert.equal(json.reply, "Try ls -a.");
    assert.equal(json.level, 2);
    const sent = or.calls[0];
    assert.equal(sent.headers.authorization, "Bearer sk-or-test-key");
    assert.equal(sent.body.model, "anthropic/claude-haiku-5.5");
    assert.equal(sent.body.max_tokens, 700);
    assert.match(sent.body.messages[0].content, /HINT LEVEL 2 of 4/);
    assert.equal(sent.body.messages.at(-1).content, "I'm stuck");
  } finally {
    app.server.close();
    or.server.close();
  }
});

test("the key never appears in a response, even on an upstream error", async () => {
  const or = await fakeOpenRouter({ status: 401 });
  const config = baseConfig({ openrouterBaseUrl: or.url });
  const app = await listen(createApp({ config }));
  try {
    const { status, json } = await post(`${app.url}/api/help`, { message: "hi" });
    assert.equal(status, 502);
    assert.doesNotMatch(JSON.stringify(json), /sk-or-test-key/);
  } finally {
    app.server.close();
    or.server.close();
  }
});

test("daily request limit returns 429 without calling the model", async () => {
  const or = await fakeOpenRouter();
  const config = baseConfig({ openrouterBaseUrl: or.url, dailyRequestLimit: 1 });
  const app = await listen(createApp({ config }));
  try {
    assert.equal((await post(`${app.url}/api/help`, { message: "one" })).status, 200);
    const second = await post(`${app.url}/api/help`, { message: "two" });
    assert.equal(second.status, 429);
    assert.equal(or.calls.length, 1);
  } finally {
    app.server.close();
    or.server.close();
  }
});

test("without Access or the no-auth switch, the bot refuses", async () => {
  const config = baseConfig({ allowNoAuth: false });
  const app = await listen(createApp({ config }));
  try {
    const { status } = await post(`${app.url}/api/help`, { message: "hi" });
    assert.equal(status, 503);
  } finally {
    app.server.close();
  }
});

test("with Access configured, requests need a valid token and an allowed email", async () => {
  const a = makeAccess();
  const or = await fakeOpenRouter();
  const config = baseConfig({
    openrouterBaseUrl: or.url,
    allowNoAuth: false,
    accessTeamDomain: a.team,
    accessAud: a.aud,
    allowedEmails: ["sarah@example.com"],
  });
  const verifier = new AccessVerifier({ teamDomain: a.team, aud: a.aud, fetchImpl: a.fetchImpl });
  const app = await listen(createApp({ config, verifier }));
  try {
    assert.equal((await post(`${app.url}/api/help`, { message: "hi" })).status, 401);
    const ok = await post(`${app.url}/api/help`, { message: "hi" }, { "Cf-Access-Jwt-Assertion": a.sign(a.good()) });
    assert.equal(ok.status, 200);
    const other = await post(
      `${app.url}/api/help`,
      { message: "hi" },
      { "Cf-Access-Jwt-Assertion": a.sign(a.good({ email: "someone@else.com" })) },
    );
    assert.equal(other.status, 403);
  } finally {
    app.server.close();
    or.server.close();
  }
});

test("health is open; unknown routes are 404", async () => {
  const app = await listen(createApp({ config: baseConfig({ allowNoAuth: false }) }));
  try {
    assert.equal((await fetch(`${app.url}/api/health`)).status, 200);
    assert.equal((await fetch(`${app.url}/api/nope`)).status, 404);
  } finally {
    app.server.close();
  }
});
