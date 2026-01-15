# Quick Start Guide

## 1. Setup (Local)
1. Drop your `index.html` file into the `public/` folder.
2. Commit and push:
   ```bash
   git add .
   git commit -m "Initial launch"
   git branch -M main
   git remote add origin <YOUR_REPO_URL>
   git push -u origin main
   ```

## 2. Setup (Raspberry Pi)
1. SSH into the Pi.
2. Clone the repo:
   ```bash
   git clone <YOUR_REPO_URL>
   cd vibe-coding-course
   ```

## 3. Deploy
Run the included script:
```bash
./scripts/deploy.sh
```

## Access
Open browser to: `http://<PI_IP_ADDRESS>:2256`
