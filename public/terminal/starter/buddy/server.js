// terminal-buddy: a tiny chat server. Node 22, built-in modules only.
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const KEY = process.env.OPENROUTER_API_KEY;
const MODEL = process.env.BUDDY_MODEL || "anthropic/claude-haiku-5.5";
const PROMPT = fs.readFileSync(path.join(__dirname, "prompt.md"), "utf8");
const PAGE = fs.readFileSync(path.join(__dirname, "public", "index.html"));

if (!KEY) console.warn("OPENROUTER_API_KEY is missing: check your .env file");

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 50000) req.destroy();
    });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

function sendJson(res, status, obj) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(obj));
}

http
  .createServer(async (req, res) => {
    if (req.method === "GET" && (req.url === "/" || req.url === "/index.html")) {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      return res.end(PAGE);
    }
    if (req.method === "POST" && req.url === "/api/chat") {
      try {
        const body = JSON.parse((await readBody(req)) || "{}");
        const history = Array.isArray(body.messages) ? body.messages.slice(-10) : [];
        const reply = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: "Bearer " + KEY, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: MODEL,
            max_tokens: 600,
            messages: [{ role: "system", content: PROMPT }, ...history],
          }),
        });
        const json = await reply.json();
        if (!reply.ok) {
          console.error("OpenRouter error:", reply.status, json.error && json.error.message);
          return sendJson(res, 502, { error: "The model service said: " + ((json.error && json.error.message) || reply.status) });
        }
        return sendJson(res, 200, { reply: json.choices[0].message.content });
      } catch (err) {
        console.error(err);
        return sendJson(res, 500, { error: "Something went wrong. Check: docker compose logs" });
      }
    }
    res.writeHead(404);
    res.end("Not found");
  })
  .listen(3000, () => console.log("terminal-buddy on port 3000, model " + MODEL));
