# Vibe Coding Course Project

## Overview
This site hosts two courses, styled with Tailwind CSS via CDN:
- "Vibe Coding on Metal" at `/` (`public/index.html`, a single self-contained page).
- "Terminal Basecamp" at `/terminal/` (`public/terminal/`: page, `lessons.js` content,
  `starter/` files). It has a help bot backed by `helper/` (Node 22, no deps). See
  `docs/TERMINAL_COURSE.md`.

## Architecture
- **Host:** Raspberry Pi (Dockerized)
- **Containers:** `web` (Nginx Alpine, `nginx.conf`) and `helper` (Node 22 Alpine).
  Only nginx publishes a port; it proxies `/api/` to the helper.
- **Port:** 2256 maps to Container Port 80
- **Secrets:** `.env` (never committed; template in `.env.example`) holds the OpenRouter key
  and Cloudflare Access settings for the helper.
- **Workflow:** Edit Local -> Push GitHub -> Pull Pi -> Deploy

## Rules
- Do not add complex build steps (npm/webpack) unless necessary.
- Keep the first course's HTML file self-contained. The second course keeps its content in
  `lessons.js`; keep each lesson's `solution` accurate (the help bot uses it).
- The helper must never log or return the OpenRouter key, must refuse requests without a valid
  Cloudflare Access token (unless `HELP_BOT_ALLOW_NO_AUTH=1` for local tests), and keeps its
  per-request token cap and daily request/spend caps.
- Test the helper with `cd helper && npm test`.
- Verify Docker Compose syntax before suggesting changes.
