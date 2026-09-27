# Influencer ROI Intelligence — Your Analytics Dashboard

## What This Is
Your private influencer marketing analytics dashboard. Shows campaign ROI rates,
influencer tier rankings, platform performance, AI-generated insights, and lets you
predict whether a campaign will deliver high ROI before you spend the budget.

## Open Locally (Testing)
1. Install Node.js: https://nodejs.org
2. Open terminal in this folder (react_frontend/)
3. Run: npm install
4. Run: npm run dev
5. Open http://localhost:5173

## Deploy Live (Cloudflare)
1. Run: npm install -g wrangler
2. Run: wrangler login
3. Run: bash deploy.sh
4. Dashboard live at: https://influencer-roi-dashboard.pages.dev

## Add or Remove Users
1. Log into dash.cloudflare.com
2. Go to Zero Trust → Access → Applications
3. Find "influencer-roi-dashboard" → Edit → add/remove emails
No code changes needed.

## What Each Tab Shows
- **ROI Overview** — key campaign numbers at a glance
- **Platform Analysis** — which platforms (Instagram, TikTok, etc.) deliver ROI
- **Influencer Tiers** — Gold/Silver/Bronze tier profiles of your influencer roster
- **Campaign Insights** — AI-generated findings with severity levels and action steps
- **ROI Forecaster** — enter an influencer profile, get predicted ROI outcome
- **Anomalies** — campaigns with unusual spend or revenue patterns to review

## Deployment Checklist
- [ ] npm install run locally (package-lock.json exists)
- [ ] wrangler.toml has [site] bucket = "./dist" (NOT [[pages]])
- [ ] Cloudflare root directory: react_frontend/
- [ ] Cloudflare build command: npm run build
- [ ] Cloudflare deploy command: npx wrangler deploy
- [ ] .env file exists locally with VITE_DEV_AUTH=true (never commit this)
- [ ] wrangler secret put FORECAST_LOOKUP (after pipeline generates data)

## If Something Looks Wrong
1. python main.py                  ← re-run the pipeline
2. python export_for_frontend.py   ← re-export JSON data files
3. Copy new JSON to react_frontend/public/data/
4. bash deploy.sh                  ← redeploy

## Built With
React 18 · Vite 5 · Chart.js 4 · Cloudflare Workers Sites · Cloudflare Access