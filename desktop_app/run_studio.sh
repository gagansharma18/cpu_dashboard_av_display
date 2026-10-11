#!/usr/bin/env bash
# Launch script for macOS & Linux

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "========================================================="
echo "   AERO-SYNC PRO DISPLAY STUDIO - HYBRID DESKTOP APP"
echo "========================================================="

if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed. Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "[INFO] Installing dependencies..."
    npm install
fi

echo "[INFO] Starting dev server..."
npm run dev -- --open
