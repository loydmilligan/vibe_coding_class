# terminal-buddy

A small web chatbot that helps me (Sarah) learn the Linux terminal. It runs in Docker on my PC and uses my OpenRouter key.

## About me
- I'm a beginner. Explain what you do in plain words and keep things simple.

## How it's built
- Node.js, no extra npm packages unless really needed.
- One Docker container, started with docker compose.
- The web page and the server are in this folder; the page is plain HTML and JavaScript.

## Rules
- Never read, print, copy or edit .env. The key lives only there.
- The key must only come from the OPENROUTER_API_KEY environment variable. Never write a key in a file.
- The app must only be reachable from my own PC: bind the port to 127.0.0.1.
- Keep each answer from the bot short (cap max_tokens).
- Ask before running docker commands. Don't use git commit or push.
