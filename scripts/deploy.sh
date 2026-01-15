#!/bin/bash

# Stop on errors
set -e

echo "Starting deployment..."

# Pull latest changes
echo "1. Pulling from Git..."
git pull origin main

# Rebuild and restart container
echo "2. Rebuilding Container..."
docker compose down
docker compose up -d --build

echo "3. Pruning unused images..."
docker image prune -f

echo "Deployment Success."
echo "Site is live at: http://localhost:2256"
