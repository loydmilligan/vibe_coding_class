# Vibe Coding Course Project

## Overview
This is a static website hosting a curriculum for "Vibe Coding" on Raspberry Pi.
The site is a single-page HTML file styled with Tailwind CSS via CDN.

## Architecture
- **Host:** Raspberry Pi (Dockerized)
- **Container:** Nginx Alpine
- **Port:** 2256 maps to Container Port 80
- **Workflow:** Edit Local -> Push GitHub -> Pull Pi -> Deploy

## Rules
- Do not add complex build steps (npm/webpack) unless necessary.
- Keep the HTML file self-contained.
- Verify Docker Compose syntax before suggesting changes.
