// Help bot backend for the Terminal Basecamp course.
//
// One job: take a learner's question plus the exercise she is on, and ask a
// model on OpenRouter for an answer that climbs a hint ladder (nudge, hint,
// bigger hint, full walkthrough) as she asks more about the same exercise.
//
// Zero dependencies: Node 22 built-ins only. The OpenRouter key comes from the
// environment and is never logged or returned.

import http from "node:http";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// ---------------------------------------------------------------- config

export function loadConfig(env = process.env) {
  const num = (v, d) => (v === undefined || v === "" || Number.isNaN(Number(v)) ? d : Number(v));
  return {
    port: num(env.PORT, 8787),
    openrouterKey: env.OPENROUTER_API_KEY || "",
    openrouterBaseUrl: (env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1").replace(/\/$/, ""),
    model: env.HELP_BOT_MODEL || "anthropic/claude-haiku-5.5",
    maxOutputTokens: num(env.HELP_BOT_MAX_OUTPUT_TOKENS, 700),
    dailyRequestLimit: num(env.HELP_BOT_DAILY_REQUESTS, 150),
    dailySpendLimitUsd: num(env.HELP_BOT_DAILY_SPEND_USD, 1.0),
    // Used only when OpenRouter does not report the cost of a call.
    priceInputPerM: num(env.HELP_BOT_PRICE_INPUT_PER_M, 1.0),
    priceOutputPerM: num(env.HELP_BOT_PRICE_OUTPUT_PER_M, 5.0),
    timeZone: env.HELP_BOT_TIME_ZONE || "America/Los_Angeles",
    dataDir: env.HELP_BOT_DATA_DIR || "/data",
    accessTeamDomain: (env.CF_ACCESS_TEAM_DOMAIN || "").replace(/^https?:\/\//, "").replace(/\/$/, ""),
    accessAud: env.CF_ACCESS_AUD || "",
    allowedEmails: (env.HELP_BOT_ALLOWED_EMAILS || "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
    allowNoAuth: env.HELP_BOT_ALLOW_NO_AUTH === "1",
    requestTimeoutMs: num(env.HELP_BOT_TIMEOUT_MS, 45000),
  };
}

// ---------------------------------------------------------------- limits on input

export const LIMITS = {
  messageChars: 2000,
  historyMessages: 10,
  historyChars: 2000,
  contextFieldChars: 2500,
  bodyBytes: 64 * 1024,
};

const clip = (s, n) => {
  if (typeof s !== "string") return "";
  return s.length > n ? s.slice(0, n) + " …[cut]" : s;
};

// ---------------------------------------------------------------- hint ladder

// attempt = how many times she has asked about this exercise, counting this one.
export function hintLevel(attempt, wantsWalkthrough = false) {
  const a = Math.max(1, Math.floor(Number(attempt) || 1));
  if (wantsWalkthrough && a >= 2) return 4;
  return Math.min(a, 4);
}

const LEVEL_RULES = {
  1: `HINT LEVEL 1 of 4 (a nudge). Do NOT give the command or the answer. Ask one guiding question or point at the idea she needs (for example "which command shows you where you are?"). Two to four sentences.`,
  2: `HINT LEVEL 2 of 4 (a hint). Name the command or the key idea she needs, and what it does, but do NOT write out the full command line for this exercise. Short.`,
  3: `HINT LEVEL 3 of 4 (a bigger hint). Show the shape of the command with the important parts filled in and one part left for her (for example: mkdir -p ~/projects/____). Explain the blank. Still let her type the final version.`,
  4: `HINT LEVEL 4 of 4 (walk her through it). She has asked enough; now just help her finish. Give numbered steps, one command per step in its own code block, saying what each does and what she should see after it. End with how she can check it worked.`,
};

export function buildSystemPrompt(ctx, level) {
  const base = `You are the friendly help bot inside "Terminal Basecamp", a beginner course that teaches Sarah to use a terminal by setting up a dev environment on her Windows PC, then using OpenAI's Codex CLI.

About Sarah: she uses Windows and is new to the terminal. She runs Ubuntu inside WSL2 (Windows Subsystem for Linux), opened from Windows Terminal. Some steps happen in PowerShell on Windows, most in the Ubuntu (bash) terminal.

How to answer:
- Be warm, short and plain. No jargon without a one-line explanation. Never make her feel slow.
- Put every command in a fenced code block, and say where to run it: "In Ubuntu" or "In PowerShell".
- If she pastes an error, explain what it means in one sentence before the fix.
- Before any command that deletes, overwrites or uses sudo, say so in one line.
- Never ask for or repeat a password, key or token. If she pastes one, tell her to treat it as exposed.
- If you are not sure (for example about her exact Windows username or a menu name), say so and tell her how to check.
- Stay on this course: terminals, Linux, WSL, Windows Terminal, the shell, Codex and the setup in this lesson. Politely decline anything unrelated.`;

  if (!ctx || !ctx.exerciseTitle) {
    return `${base}

She is asking a general question, not about a specific exercise. Answer it directly and briefly.`;
  }

  return `${base}

She is working on this exercise. Use the material below; do not contradict the lesson unless it is wrong for her situation.

Section: ${ctx.sectionTitle}
Lesson: ${ctx.lessonTitle}
What the lesson taught:
${ctx.lessonText}

The exercise:
${ctx.exerciseText}

How she can tell it worked:
${ctx.checkText}

Teacher's solution (never paste this whole before hint level 4):
${ctx.solutionText}

${LEVEL_RULES[level]}
If her message is a side question (what a word means, what an error means) rather than "how do I do the exercise", answer that question fully and plainly whatever the hint level, and keep the exercise's answer to the hint level.`;
}

export function sanitizeRequest(body) {
  if (!body || typeof body !== "object") throw new HttpError(400, "Expected a JSON body.");
  const message = clip(String(body.message || "").trim(), LIMITS.messageChars);
  if (!message) throw new HttpError(400, "Type a question first.");

  const history = Array.isArray(body.history) ? body.history : [];
  const cleanHistory = history
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-LIMITS.historyMessages)
    .map((m) => ({ role: m.role, content: clip(m.content, LIMITS.historyChars) }));

  const c = body.context && typeof body.context === "object" ? body.context : null;
  const ctx = c && c.exerciseTitle
    ? {
        sectionTitle: clip(String(c.sectionTitle || ""), 200),
        lessonTitle: clip(String(c.lessonTitle || ""), 200),
        exerciseTitle: clip(String(c.exerciseTitle || ""), 200),
        lessonText: clip(String(c.lessonText || ""), LIMITS.contextFieldChars),
        exerciseText: clip(String(c.exerciseText || ""), LIMITS.contextFieldChars),
        checkText: clip(String(c.checkText || ""), 800),
        solutionText: clip(String(c.solutionText || ""), LIMITS.contextFieldChars),
      }
    : null;

  return {
    message,
    history: cleanHistory,
    context: ctx,
    attempt: Math.max(1, Math.min(50, Math.floor(Number(body.attempt) || 1))),
    wantsWalkthrough: body.walkthrough === true,
  };
}

// ---------------------------------------------------------------- daily usage

export function dayKey(date, timeZone) {
  // en-CA formats as YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

export class UsageLedger {
  constructor({ file, timeZone, now = () => new Date() }) {
    this.file = file;
    this.timeZone = timeZone;
    this.now = now;
    this.state = { day: dayKey(now(), timeZone), requests: 0, costUsd: 0 };
    if (file) {
      try {
        const saved = JSON.parse(fs.readFileSync(file, "utf8"));
        if (saved && typeof saved.day === "string") this.state = { ...this.state, ...saved };
      } catch {
        /* first run, or unreadable: start at zero */
      }
    }
  }
  roll() {
    const today = dayKey(this.now(), this.timeZone);
    if (this.state.day !== today) this.state = { day: today, requests: 0, costUsd: 0 };
  }
  snapshot() {
    this.roll();
    return { ...this.state, costUsd: Math.round(this.state.costUsd * 1e6) / 1e6 };
  }
  // Returns null if allowed (and counts the request), or a reason string.
  tryStart(limits) {
    this.roll();
    if (this.state.requests >= limits.dailyRequestLimit) return "requests";
    if (this.state.costUsd >= limits.dailySpendLimitUsd) return "spend";
    this.state.requests += 1;
    this.save();
    return null;
  }
  addCost(usd) {
    this.roll();
    if (Number.isFinite(usd) && usd > 0) this.state.costUsd += usd;
    this.save();
  }
  save() {
    if (!this.file) return;
    try {
      fs.mkdirSync(path.dirname(this.file), { recursive: true });
      const tmp = this.file + ".tmp";
      fs.writeFileSync(tmp, JSON.stringify(this.state));
      fs.renameSync(tmp, this.file);
    } catch (err) {
      console.error("usage ledger: could not save:", err.message);
    }
  }
}

// ---------------------------------------------------------------- Cloudflare Access

const b64urlToBuf = (s) => Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64");

export class AccessVerifier {
  constructor({ teamDomain, aud, fetchImpl = fetch, now = () => Date.now() }) {
    this.teamDomain = teamDomain;
    this.aud = aud;
    this.fetch = fetchImpl;
    this.now = now;
    this.keys = null;
    this.keysAt = 0;
  }
  get issuer() {
    return `https://${this.teamDomain}`;
  }
  async getKeys(force = false) {
    if (!force && this.keys && this.now() - this.keysAt < 60 * 60 * 1000) return this.keys;
    const res = await this.fetch(`${this.issuer}/cdn-cgi/access/certs`);
    if (!res.ok) throw new Error(`certs fetch failed: ${res.status}`);
    const json = await res.json();
    this.keys = Array.isArray(json.keys) ? json.keys : [];
    this.keysAt = this.now();
    return this.keys;
  }
  // Returns the verified claims, or throws.
  async verify(token) {
    if (!token || typeof token !== "string") throw new Error("missing token");
    const parts = token.split(".");
    if (parts.length !== 3) throw new Error("malformed token");
    const header = JSON.parse(b64urlToBuf(parts[0]).toString("utf8"));
    const claims = JSON.parse(b64urlToBuf(parts[1]).toString("utf8"));
    if (header.alg !== "RS256") throw new Error("unexpected alg");

    let keys = await this.getKeys();
    let jwk = keys.find((k) => k.kid === header.kid);
    if (!jwk) {
      keys = await this.getKeys(true); // keys rotate; refetch once
      jwk = keys.find((k) => k.kid === header.kid);
    }
    if (!jwk) throw new Error("unknown key");

    const key = crypto.createPublicKey({ key: jwk, format: "jwk" });
    const ok = crypto.verify("RSA-SHA256", Buffer.from(`${parts[0]}.${parts[1]}`), key, b64urlToBuf(parts[2]));
    if (!ok) throw new Error("bad signature");

    const nowSec = Math.floor(this.now() / 1000);
    if (typeof claims.exp !== "number" || claims.exp < nowSec - 30) throw new Error("expired");
    if (typeof claims.nbf === "number" && claims.nbf > nowSec + 30) throw new Error("not yet valid");
    const auds = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
    if (!auds.includes(this.aud)) throw new Error("wrong audience");
    if (claims.iss !== this.issuer) throw new Error("wrong issuer");
    return claims;
  }
}

// ---------------------------------------------------------------- OpenRouter

export async function askModel({ config, fetchImpl, system, history, message }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.requestTimeoutMs);
  try {
    const res = await fetchImpl(`${config.openrouterBaseUrl}/chat/completions`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${config.openrouterKey}`,
        "Content-Type": "application/json",
        "X-Title": "Terminal Basecamp help bot",
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: config.maxOutputTokens,
        temperature: 0.3,
        usage: { include: true },
        messages: [{ role: "system", content: system }, ...history, { role: "user", content: message }],
      }),
    });
    const text = await res.text();
    let json = null;
    try {
      json = JSON.parse(text);
    } catch {
      /* non-JSON error page */
    }
    if (!res.ok) {
      const detail = json?.error?.message ? String(json.error.message).slice(0, 200) : `status ${res.status}`;
      throw new HttpError(502, `The AI service said no (${detail}).`);
    }
    const reply = json?.choices?.[0]?.message?.content;
    if (typeof reply !== "string" || !reply.trim()) throw new HttpError(502, "The AI service sent an empty answer. Try again.");
    const usage = json.usage || {};
    let cost = Number(usage.cost);
    if (!Number.isFinite(cost)) {
      cost =
        ((Number(usage.prompt_tokens) || 0) * config.priceInputPerM +
          (Number(usage.completion_tokens) || 0) * config.priceOutputPerM) /
        1e6;
    }
    return { reply: reply.trim(), cost, usage };
  } catch (err) {
    if (err.name === "AbortError") throw new HttpError(504, "The AI service took too long. Try again in a moment.");
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------- HTTP

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function send(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Content-Length": Buffer.byteLength(body),
  });
  res.end(body);
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (c) => {
      size += c.length;
      if (size > LIMITS.bodyBytes) {
        reject(new HttpError(413, "That message is too long."));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}"));
      } catch {
        reject(new HttpError(400, "Expected a JSON body."));
      }
    });
    req.on("error", reject);
  });
}

export function createApp({ config, fetchImpl = fetch, ledger, verifier } = {}) {
  const led =
    ledger || new UsageLedger({ file: path.join(config.dataDir, "usage.json"), timeZone: config.timeZone });
  const ver =
    verifier ||
    (config.accessTeamDomain && config.accessAud
      ? new AccessVerifier({ teamDomain: config.accessTeamDomain, aud: config.accessAud, fetchImpl })
      : null);

  async function authenticate(req) {
    if (ver) {
      const token = req.headers["cf-access-jwt-assertion"];
      let claims;
      try {
        claims = await ver.verify(Array.isArray(token) ? token[0] : token);
      } catch {
        throw new HttpError(401, "Sign in through the course's login page first.");
      }
      const email = String(claims.email || "").toLowerCase();
      if (config.allowedEmails.length && !config.allowedEmails.includes(email)) {
        throw new HttpError(403, "This account isn't on the list for the help bot.");
      }
      return email || "access-user";
    }
    if (config.allowNoAuth) return "local";
    throw new HttpError(503, "The help bot isn't set up yet (no login configured).");
  }

  async function handle(req, res) {
    const url = new URL(req.url, "http://x");
    const route = url.pathname.replace(/^\/api/, "") || "/";

    if (req.method === "GET" && route === "/health") {
      return send(res, 200, { ok: true });
    }

    if (req.method === "GET" && route === "/status") {
      await authenticate(req);
      const u = led.snapshot();
      return send(res, 200, {
        ok: true,
        model: config.model,
        configured: Boolean(config.openrouterKey),
        today: { requests: u.requests, requestLimit: config.dailyRequestLimit },
      });
    }

    if (req.method === "POST" && route === "/help") {
      const who = await authenticate(req);
      if (!config.openrouterKey) throw new HttpError(503, "The help bot isn't set up yet (no AI key).");
      const body = sanitizeRequest(await readJson(req));

      const blocked = led.tryStart(config);
      if (blocked === "requests") throw new HttpError(429, "The help bot has answered all it can for today. It resets tomorrow morning.");
      if (blocked === "spend") throw new HttpError(429, "The help bot hit today's budget. It resets tomorrow morning.");

      const level = body.context ? hintLevel(body.attempt, body.wantsWalkthrough) : null;
      const system = buildSystemPrompt(body.context, level);
      const out = await askModel({ config, fetchImpl, system, history: body.history, message: body.message });
      led.addCost(out.cost);
      console.log(
        `help: user=${who} level=${level ?? "general"} in=${out.usage.prompt_tokens ?? "?"} out=${out.usage.completion_tokens ?? "?"} cost=$${out.cost.toFixed(5)}`,
      );
      return send(res, 200, { reply: out.reply, level });
    }

    throw new HttpError(404, "Not found.");
  }

  return async (req, res) => {
    try {
      await handle(req, res);
    } catch (err) {
      const status = err instanceof HttpError ? err.status : 500;
      if (status === 500) console.error("help bot error:", err);
      send(res, status, { error: err instanceof HttpError ? err.message : "Something went wrong on the server." });
    }
  };
}

// ---------------------------------------------------------------- main

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  const config = loadConfig();
  if (!config.openrouterKey) console.warn("OPENROUTER_API_KEY is not set; /api/help will refuse.");
  if (!(config.accessTeamDomain && config.accessAud) && !config.allowNoAuth)
    console.warn("Cloudflare Access is not configured and HELP_BOT_ALLOW_NO_AUTH is off; /api/help will refuse.");
  if (config.allowNoAuth) console.warn("HELP_BOT_ALLOW_NO_AUTH=1: anyone who can reach this server can spend the key.");
  http.createServer(createApp({ config })).listen(config.port, () => {
    console.log(`help bot on :${config.port}, model ${config.model}, ${config.dailyRequestLimit} requests/day, $${config.dailySpendLimitUsd}/day`);
  });
}
