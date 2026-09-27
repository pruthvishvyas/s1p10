#!/bin/bash
set -e
if ! command -v node &> /dev/null; then
  echo 'Node.js not found. Install from https://nodejs.org'
  exit 1
fi
if ! command -v wrangler &> /dev/null; then
  echo 'wrangler not found. Run: npm install -g wrangler'
  exit 1
fi
if [ ! -f 'package-lock.json' ]; then
  echo 'package-lock.json not found. Run: npm install'
  exit 1
fi
echo 'Building React app...'
npm run build
echo 'Deploying to Cloudflare Workers Sites...'
npx wrangler deploy
echo ''
echo '✓ Dashboard live: https://influencer-roi-dashboard.pages.dev'
echo ''
echo 'Next: Add users in Cloudflare → Zero Trust → Access → Applications'
echo 'Next: Run: wrangler secret put FORECAST_LOOKUP'