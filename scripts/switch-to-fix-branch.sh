#!/bin/bash
set -e

cd /vercel/share/v0-project

echo "Fetching latest from remote..."
git fetch origin

echo "Checking out fix-system-website branch..."
git checkout fix-system-website

echo "Pulling latest changes..."
git pull origin fix-system-website

echo "Branch switched successfully!"
git branch -v
