# Terminal Basecamp (second course)

A beginner course for Sarah: from a Windows PC to WSL, the bash shell, Codex, Docker and her own OpenRouter chatbot. It lives at `/terminal/` on the same site as "Vibe Coding on Metal", in the same look.

## Files

```
public/terminal/index.html     the page: rendering, progress, help panel (vanilla JS, Tailwind CDN)
public/terminal/lessons.js     all course content (sections, lessons, exercises, capstones)
public/terminal/starter/       files the lessons show and copy (AGENTS.md templates, Codex prompt,
                               a working reference version of her terminal-buddy bot)
helper/server.mjs              help bot backend (Node 22, no dependencies)
helper/test/                   node --test suite (cd helper && npm test)
nginx.conf                     static files, plus /api/ proxied to the helper container
```

Each lesson has an explanation, copyable code blocks labelled with where to type them (PowerShell, Ubuntu, File Explorer, browser, Codex, or file contents for nano), and an exercise with "You'll know it worked when". Each section ends with a bigger task; marking it done unlocks the next section. Progress is kept in the browser (localStorage).

## Outline

| # | Section | Commands / skills | Section task |
|---|---|---|---|
| 01 | Linux inside Windows (WSL) | PowerShell as admin, `whoami`, `wsl --install`, Linux account, `wsl -l -v` | Windows Terminal as home base, Ubuntu as default profile |
| 02 | Finding your way around | `pwd`, `ls -la`, `cd` (`~ .. -`), `mkdir -p` | Lay out `~/projects/{sysops-agent,playground/{notes,scratch}}` |
| 03 | Files | `touch`, `cat`, `cp -r`, `mv`, `rm -i/-r` | Tidy the playground to a target tree |
| 04 | Windows ↔ Linux bridge | `explorer.exe .`, `\\wsl.localhost\Ubuntu`, `/mnt/c`, `cp` across | Round trip a picture and a file both ways |
| 05 | Admin powers | `sudo`, `apt update`, `apt upgrade`, `apt install`, `nano` | Start a setup log, install jq |
| 06 | Make the shell yours | `echo` + `>`/`>>`, variables/`export`, `alias`, `.bashrc` + `source` | Personalised `.bashrc` with `PROJECTS`, aliases, greeting |
| 07 | Install Codex | `curl \| sh`, `codex --version`/`which`, `codex login` (+ `--device-auth`, `status`), first chat, `codex doctor`/`update` | Codex reviews her setup, suggests an alias |
| 08 | First agent: sysops-agent | `git init` only, `AGENTS.md`, `/permissions`, system questions, `codex exec` | Codex writes `scripts/health-check.sh`; `health` alias |
| 09 | Docker | install `docker.io` + `docker-compose-v2`, docker group, `hello-world`, `ps`/`images`, `compose up/logs/down` | Her own page served by nginx in a container |
| 10 | OpenRouter on her own key | account, credits, key with a credit limit (her browser steps), `.env` + `chmod 600`, `set -a; source`, `curl` + `jq` | Compare two models; Codex writes `ask.sh`; check Activity |
| 11 | Build her own terminal helper | `git init` + `.gitignore`, `AGENTS.md`, Codex builds it, review with `tree`/`cat`/`grep`, `compose up --build`/`logs -f` | Make it hers: prompt, model, `buddy` alias |
| 12 | Git, properly | coming next (separate course) | |

From section 07 on, Codex is the working tool in every section.

## The help bot

The help panel is always one click away. Asking about an exercise sends that exercise's lesson, task, check and a teacher's solution to `POST /api/help` with how many times she has asked about it. The backend turns that count into a hint level:

1. a nudge (no command), 2. a hint (names the command), 3. a bigger hint (command with a blank), 4+. a full walkthrough.

After two asks a "Just walk me through it" button jumps to level 4. Side questions ("what does ~ mean?") are answered in full at any level. There's also a general-question mode with no exercise.

### Backend safeguards

- The OpenRouter key comes only from `OPENROUTER_API_KEY` in `.env`; it is never logged or returned.
- Every request needs a valid Cloudflare Access login (`Cf-Access-Jwt-Assertion`, verified against your team's certs, audience and issuer). Optional email allow-list. Without Access settings it refuses, unless `HELP_BOT_ALLOW_NO_AUTH=1` (local testing only).
- `max_tokens` 700 per answer; input and history are clipped (last 10 messages).
- Daily caps: 150 requests and $1.00 (Los Angeles day), stored in a Docker volume so restarts don't reset them. Cost comes from OpenRouter's `usage.cost`.
- The helper container publishes no port; only nginx reaches it, at `/api/`.

### Model and cost

Default `anthropic/claude-haiku-5.5` (change with `HELP_BOT_MODEL`). A request is roughly 2,000 to 3,500 input tokens and 200 to 500 output tokens. A lesson with five asks is about 15k in and 2k out: around a cent at Haiku-class prices ($1/$5 per million would make it about 2.5 cents; one third-party price list from Nov 4 shows $0.10/$0.50, which would make it a fraction of a cent). Check the model's OpenRouter page for the live price. The $1/day cap holds either way.

## Putting it live

1. On the Pi: `cp .env.example .env`, then fill in `OPENROUTER_API_KEY` (make a dedicated key with a credit limit), `CF_ACCESS_TEAM_DOMAIN` and `CF_ACCESS_AUD`. Optionally `HELP_BOT_ALLOWED_EMAILS`.
2. Cloudflare: a tunnel hostname pointing at `http://localhost:2256` (or the Pi's address), and an Access application on that hostname whose policy includes Sarah's email. The AUD tag is on the application's overview page.
3. `./scripts/deploy.sh` (it now builds both containers).
4. Send Sarah `https://<hostname>/terminal/`.

Port 2256 is still published on all interfaces, as before. The static pages are reachable on your LAN without a login; the help bot is not, because it checks the Access token.
