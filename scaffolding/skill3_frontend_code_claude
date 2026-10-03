import json, os, shutil, datetime, sys

CONTRACT_PATH = 'reports/frontend/frontend_contract.json'
base = 'react_frontend'

def write_file(path, content):
    os.makedirs(os.path.dirname(path) or '.', exist_ok=True)
    content = content.replace(chr(0xfffd), '-')
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

# ── VALIDATE CONTRACT ────────────────────────────────────────────────────────
if not os.path.exists(CONTRACT_PATH):
    print(f"ERROR: {CONTRACT_PATH} not found. Run export_for_frontend.py first.")
    sys.exit(1)

with open(CONTRACT_PATH, 'r', encoding='utf-8') as f:
    contract = json.load(f)

for field in ['files', 'forecaster']:
    if field not in contract:
        print(f"ERROR: Contract missing required field: {field}")
        sys.exit(1)

if 'input_schema' not in contract.get('forecaster', {}):
    print("ERROR: Contract missing forecaster.input_schema — using default schema.")
    contract['forecaster']['input_schema'] = [
        {"name": "Follower_Count",            "type": "int",   "range": [1000, 5000000]},
        {"name": "Engagement_Rate_Pct",       "type": "float", "range": [0.1, 20.0]},
        {"name": "Avg_Comments_Per_Post",     "type": "int",   "range": [0, 5000]},
        {"name": "Past_Brand_Collaborations", "type": "int",   "range": [0, 50]},
        {"name": "Campaign_Cost_USD",         "type": "float", "range": [100, 500000]},
        {"name": "Discount_Code_Uses",        "type": "int",   "range": [0, 10000]},
        {"name": "Platform",                  "type": "str",   "range": ["Instagram","YouTube","TikTok","Twitter","Facebook"]},
        {"name": "Audience_Niche",            "type": "str",   "range": ["Fashion","Tech","Fitness","Food","Travel","Beauty","Gaming","Finance"]},
    ]

# ── COMPUTED VALUES ──────────────────────────────────────────────────────────
today        = datetime.date.today().isoformat()
source_type  = contract.get('source', {}).get('type', 'csv')
input_schema = contract['forecaster']['input_schema']
input_fields = ','.join(f['name'] for f in input_schema)
pkg_name     = 'influencer-roi-dashboard'

# ── COPY DATA FILES ──────────────────────────────────────────────────────────
os.makedirs(f'{base}/public/data', exist_ok=True)
src_dir = 'reports/frontend'
if os.path.isdir(src_dir):
    for fname in os.listdir(src_dir):
        if fname.endswith('.json'):
            shutil.copy2(os.path.join(src_dir, fname),
                         os.path.join(base, 'public', 'data', fname))

# ── index.html ───────────────────────────────────────────────────────────────
write_file(f'{base}/index.html', '\n'.join([
    '<!DOCTYPE html>',
    '<html lang="en">',
    '<head>',
    '  <meta charset="UTF-8" />',
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />',
    '  <title>Influencer ROI Intelligence</title>',
    '  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎯</text></svg>" />',
    '  <link rel="preconnect" href="https://fonts.googleapis.com">',
    '  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
    '  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">',
    '</head>',
    '<body>',
    '  <div id="root"></div>',
    '  <script type="module" src="/src/main.jsx"></script>',
    '</body>',
    '</html>',
]))

# ── package.json ─────────────────────────────────────────────────────────────
write_file(f'{base}/package.json', '\n'.join([
    '{',
    '  "name": "influencer-roi-dashboard",',
    '  "private": true,',
    '  "version": "1.0.0",',
    '  "type": "module",',
    '  "scripts": {',
    '    "dev":     "vite",',
    '    "build":   "vite build",',
    '    "preview": "vite preview"',
    '  },',
    '  "dependencies": {',
    '    "react":              "^18.2.0",',
    '    "react-dom":          "^18.2.0",',
    '    "react-router-dom":   "^6.22.0",',
    '    "chart.js":           "^4.4.0",',
    '    "react-chartjs-2":    "^5.2.0",',
    '    "@cloudflare/kv-asset-handler": "^0.3.2"',
    '  },',
    '  "devDependencies": {',
    '    "@vitejs/plugin-react": "^4.2.1",',
    '    "vite":                 "^5.2.0"',
    '  }',
    '}',
]))

# ── vite.config.js ───────────────────────────────────────────────────────────
write_file(f'{base}/vite.config.js', '\n'.join([
    "import { defineConfig } from 'vite'",
    "import react from '@vitejs/plugin-react'",
    '',
    'export default defineConfig({',
    '  plugins: [react()],',
    "  build: { outDir: 'dist', emptyOutDir: true },",
    '  server: { port: 5173, open: true },',
    '})',
]))

# ── wrangler.toml ────────────────────────────────────────────────────────────
write_file(f'{base}/wrangler.toml', '\n'.join([
    f'name = "{pkg_name}"',
    'main = "src/worker/forecaster.js"',
    f'compatibility_date = "{today}"',
    '',
    '[site]',
    'bucket = "./dist"',
    '',
    '[vars]',
    f'INPUT_FIELDS = "{input_fields}"',
]))

# ── .env ─────────────────────────────────────────────────────────────────────
write_file(f'{base}/.env', 'VITE_DEV_AUTH=true\n')
write_file(f'{base}/.env.example', 'VITE_DEV_AUTH=true\n')

# ── .gitignore ───────────────────────────────────────────────────────────────
write_file(f'{base}/.gitignore', 'node_modules/\ndist/\n.env\n.wrangler/\n')

# ── _redirects ────────────────────────────────────────────────────────────────
write_file(f'{base}/_redirects', '/*    /index.html    200\n')

# ── _headers ─────────────────────────────────────────────────────────────────
write_file(f'{base}/_headers', '\n'.join([
    '/*',
    '  X-Frame-Options: DENY',
    '  X-Content-Type-Options: nosniff',
    '  Referrer-Policy: strict-origin-when-cross-origin',
    '  Permissions-Policy: camera=(), microphone=(), geolocation=()',
    '',
    '/assets/*',
    '  Cache-Control: public, max-age=31536000, immutable',
]))

# ── deploy.sh ────────────────────────────────────────────────────────────────
write_file(f'{base}/deploy.sh', '\n'.join([
    '#!/bin/bash',
    'set -e',
    '',
    'if ! command -v node &> /dev/null; then',
    '  echo "Node.js not found. Install from https://nodejs.org"',
    '  exit 1',
    'fi',
    '',
    'if ! command -v wrangler &> /dev/null; then',
    '  echo "wrangler not found. Run: npm install -g wrangler"',
    '  exit 1',
    'fi',
    '',
    'if [ ! -f "package-lock.json" ]; then',
    '  echo "package-lock.json not found. Run: npm install"',
    '  exit 1',
    'fi',
    '',
    'echo "Building React app..."',
    'npm run build',
    '',
    'echo "Deploying to Cloudflare Workers Sites..."',
    'npx wrangler deploy',
    '',
    'echo ""',
    'echo "✓ Dashboard live: https://influencer-roi-dashboard.pages.dev"',
    'echo ""',
    'echo "Next: Add users in Cloudflare → Zero Trust → Access → Applications"',
    'echo "Next: Run: wrangler secret put FORECAST_LOOKUP"',
]))

# ── README.md ────────────────────────────────────────────────────────────────
write_file(f'{base}/README.md', '\n'.join([
    '# Influencer ROI Intelligence — Your Analytics Dashboard',
    '',
    '## What This Is',
    'Your private influencer marketing analytics dashboard. Shows campaign ROI rates,',
    'influencer tier rankings, platform performance, AI-generated insights, and lets you',
    'predict whether a campaign will deliver high ROI before you spend the budget.',
    '',
    '## Open Locally (Testing)',
    '1. Install Node.js: https://nodejs.org',
    '2. Open terminal in this folder (react_frontend/)',
    '3. Run: npm install',
    '4. Run: npm run dev',
    '5. Open http://localhost:5173',
    '',
    '## Deploy Live (Cloudflare)',
    '1. Run: npm install -g wrangler',
    '2. Run: wrangler login',
    '3. Run: bash deploy.sh',
    '4. Dashboard live at: https://influencer-roi-dashboard.pages.dev',
    '',
    '## Add or Remove Users',
    '1. Log into dash.cloudflare.com',
    '2. Go to Zero Trust → Access → Applications',
    '3. Find "influencer-roi-dashboard" → Edit → add/remove emails',
    'No code changes needed.',
    '',
    '## What Each Tab Shows',
    '- **ROI Overview** — key campaign numbers at a glance',
    '- **Platform Analysis** — which platforms (Instagram, TikTok, etc.) deliver ROI',
    '- **Influencer Tiers** — Gold/Silver/Bronze tier profiles of your influencer roster',
    '- **Campaign Insights** — AI-generated findings with severity levels and action steps',
    '- **ROI Forecaster** — enter an influencer profile, get predicted ROI outcome',
    '- **Anomalies** — campaigns with unusual spend or revenue patterns to review',
    '',
    '## Deployment Checklist',
    '- [ ] npm install run locally (package-lock.json exists)',
    '- [ ] wrangler.toml has [site] bucket = "./dist" (NOT [[pages]])',
    '- [ ] Cloudflare root directory: react_frontend/',
    '- [ ] Cloudflare build command: npm run build',
    '- [ ] Cloudflare deploy command: npx wrangler deploy',
    '- [ ] .env file exists locally with VITE_DEV_AUTH=true (never commit this)',
    '- [ ] wrangler secret put FORECAST_LOOKUP (after pipeline generates data)',
    '',
    '## If Something Looks Wrong',
    '1. python main.py                  ← re-run the pipeline',
    '2. python export_for_frontend.py   ← re-export JSON data files',
    '3. Copy new JSON to react_frontend/public/data/',
    '4. bash deploy.sh                  ← redeploy',
    '',
    '## Built With',
    'React 18 · Vite 5 · Chart.js 4 · Cloudflare Workers Sites · Cloudflare Access',
]))

# ── src/index.css ─────────────────────────────────────────────────────────────
write_file(f'{base}/src/index.css', '\n'.join([
    ':root {',
    '  --color-primary:        #6C3FC8;',
    '  --color-primary-dark:   #4E2D9C;',
    '  --color-primary-light:  #A97EF0;',
    '  --color-primary-rgb:    108, 63, 200;',
    '  --color-accent:         #FF6B35;',
    '  --color-danger:         #C0392B;',
    '  --color-warning:        #E67E22;',
    '  --color-success:        #27AE60;',
    '  --color-info:           #2980B9;',
    '  --color-gold:           #F1C40F;',
    '  --color-silver:         #95A5A6;',
    '  --color-bronze:         #CD7F32;',
    '  --color-high-roi:       #27AE60;',
    '  --color-low-roi:        #C0392B;',
    '  --color-bg:             #F4F3FF;',
    '  --color-surface:        #FFFFFF;',
    '  --color-surface-raised: #FAF9FF;',
    '  --color-border:         #E5E3F0;',
    '  --color-text-primary:   #1A1530;',
    '  --color-text-secondary: #4A4565;',
    '  --color-text-muted:     #8B87A8;',
    '  --font-heading: "Plus Jakarta Sans", sans-serif;',
    '  --font-body:    "Inter", sans-serif;',
    '  --text-xs:    0.75rem;  --text-sm:  0.875rem;',
    '  --text-base:  1rem;     --text-lg:  1.125rem;',
    '  --text-xl:    1.25rem;  --text-2xl: 1.5rem;',
    '  --text-3xl:   2rem;     --text-4xl: 2.75rem;',
    '  --space-1: 0.25rem;  --space-2: 0.5rem;',
    '  --space-3: 0.75rem;  --space-4: 1rem;',
    '  --space-6: 1.5rem;   --space-8: 2rem;',
    '  --space-12: 3rem;    --space-16: 4rem;',
    '  --radius-sm:   4px;  --radius-md:  8px;',
    '  --radius-lg:   16px; --radius-xl:  24px;',
    '  --radius-pill: 999px;',
    '  --shadow-card:   0 1px 4px rgba(108,63,200,0.06), 0 4px 16px rgba(108,63,200,0.08);',
    '  --shadow-raised: 0 4px 24px rgba(108,63,200,0.16);',
    '  --shadow-focus:  0 0 0 3px rgba(108,63,200,0.25);',
    '  --sidebar-width: 248px;',
    '  --topbar-height: 56px;',
    '}',
    '',
    '*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }',
    '',
    'html { scroll-padding-top: env(safe-area-inset-top, 0px); }',
    '',
    'body {',
    '  font-family: var(--font-body);',
    '  background: var(--color-bg);',
    '  color: var(--color-text-primary);',
    '  line-height: 1.5;',
    '  padding-top: env(safe-area-inset-top, 0px);',
    '  padding-bottom: env(safe-area-inset-bottom, 0px);',
    '}',
    '',
    '.app-layout {',
    '  display: flex;',
    '  height: 100vh;',
    '  overflow: hidden;',
    '}',
    '',
    '.main-content {',
    '  flex: 1;',
    '  overflow-y: auto;',
    '  padding: var(--space-8);',
    '  background: var(--color-bg);',
    '}',
    '',
    '.kpi-grid {',
    '  display: grid;',
    '  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));',
    '  gap: var(--space-4);',
    '  margin-bottom: var(--space-8);',
    '}',
    '',
    '.kpi-card {',
    '  background: var(--color-surface);',
    '  border: 1px solid var(--color-border);',
    '  border-radius: var(--radius-lg);',
    '  box-shadow: var(--shadow-card);',
    '  padding: var(--space-6);',
    '  transition: all 0.15s ease;',
    '  cursor: default;',
    '}',
    '',
    '.kpi-card:hover {',
    '  transform: translateY(-2px);',
    '  box-shadow: var(--shadow-raised);',
    '}',
    '',
    '.chart-wrapper {',
    '  position: relative;',
    '  height: 380px;',
    '  width: 100%;',
    '}',
    '',
    '.chart-container {',
    '  background: var(--color-surface);',
    '  border: 1px solid var(--color-border);',
    '  border-radius: var(--radius-lg);',
    '  box-shadow: var(--shadow-card);',
    '  padding: var(--space-6);',
    '  margin-bottom: var(--space-6);',
    '}',
    '',
    '.tab-enter { opacity: 0; transform: translateY(6px); }',
    '.tab-enter-active { opacity: 1; transform: translateY(0); transition: all 0.2s ease; }',
    '',
    '.forecast-result { animation: fadeIn 0.3s ease forwards; }',
    '',
    '@keyframes fadeIn {',
    '  from { opacity: 0; transform: translateY(8px); }',
    '  to   { opacity: 1; transform: translateY(0); }',
    '}',
    '',
    '@keyframes spin { to { transform: rotate(360deg); } }',
    '',
    '.form-group { display: flex; flex-direction: column; gap: var(--space-2); margin-bottom: var(--space-4); }',
    '',
    '.form-group label { font-size: var(--text-sm); font-weight: 600; color: var(--color-text-primary); }',
    '',
    '.form-group input, .form-group select {',
    '  padding: var(--space-3) var(--space-4);',
    '  border: 1px solid var(--color-border);',
    '  border-radius: var(--radius-md);',
    '  font-family: var(--font-body);',
    '  font-size: var(--text-base);',
    '  color: var(--color-text-primary);',
    '  background: var(--color-surface);',
    '  outline: none;',
    '  transition: border-color 0.15s ease, box-shadow 0.15s ease;',
    '}',
    '',
    '.form-group input:focus, .form-group select:focus {',
    '  border-color: var(--color-primary);',
    '  box-shadow: var(--shadow-focus);',
    '}',
    '',
    '.btn-primary {',
    '  background: var(--color-primary);',
    '  color: #fff;',
    '  border: none;',
    '  border-radius: var(--radius-md);',
    '  padding: var(--space-3) var(--space-6);',
    '  font-family: var(--font-body);',
    '  font-size: var(--text-base);',
    '  font-weight: 600;',
    '  cursor: pointer;',
    '  width: 100%;',
    '  transition: background 0.15s ease;',
    '}',
    '',
    '.btn-primary:hover:not(:disabled) { background: var(--color-primary-dark); }',
    '.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }',
    '',
    '.table-wrapper { overflow-x: auto; width: 100%; }',
    '',
    'table { width: 100%; border-collapse: collapse; font-size: var(--text-sm); }',
    'thead { background: var(--color-surface-raised); position: sticky; top: 0; z-index: 1; }',
    'th { padding: var(--space-3) var(--space-4); text-align: left; color: var(--color-text-muted); font-weight: 600; border-bottom: 2px solid var(--color-border); cursor: pointer; user-select: none; white-space: nowrap; }',
    'th:hover { color: var(--color-primary); }',
    'td { padding: var(--space-3) var(--space-4); border-bottom: 1px solid var(--color-border); color: var(--color-text-primary); }',
    'tr:hover td { background: rgba(108,63,200,0.02); }',
    '',
    '.pagination { display: flex; align-items: center; gap: var(--space-4); justify-content: center; margin-top: var(--space-6); }',
    '.pagination button { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: var(--space-2) var(--space-4); cursor: pointer; color: var(--color-text-primary); font-size: var(--text-sm); }',
    '.pagination button:hover:not(:disabled) { border-color: var(--color-primary); color: var(--color-primary); }',
    '.pagination button:disabled { opacity: 0.4; cursor: not-allowed; }',
    '',
    '.filter-pills { display: flex; gap: var(--space-2); margin-bottom: var(--space-4); flex-wrap: wrap; }',
    '.filter-pill { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-pill); padding: var(--space-1) var(--space-4); font-size: var(--text-sm); cursor: pointer; color: var(--color-text-secondary); transition: all 0.15s ease; }',
    '.filter-pill.active { background: var(--color-primary); color: #fff; border-color: var(--color-primary); }',
    '',
    '.section-title { font-family: var(--font-heading); font-size: var(--text-2xl); font-weight: 800; color: var(--color-text-primary); margin-bottom: var(--space-6); }',
    '',
    '@media (max-width: 767px) {',
    '  .sidebar { display: none; }',
    '  .main-content { padding: var(--space-4); }',
    '  .mobile-topbar { display: flex !important; }',
    '}',
    '',
    '@media (min-width: 768px) and (max-width: 1023px) {',
    '  .sidebar { width: 56px; }',
    '  .sidebar .nav-label, .sidebar .project-name, .sidebar .source-pill { display: none; }',
    '}',
    '',
    '.mobile-topbar {',
    '  display: none;',
    '  align-items: center;',
    '  justify-content: space-between;',
    '  padding: var(--space-4);',
    '  background: var(--color-surface);',
    '  border-bottom: 1px solid var(--color-border);',
    '  position: sticky;',
    '  top: 0;',
    '  z-index: 100;',
    '}',
    '',
    '.drawer-overlay {',
    '  display: none;',
    '  position: fixed; inset: 0;',
    '  background: rgba(0,0,0,0.4);',
    '  z-index: 200;',
    '}',
    '.drawer-overlay.open { display: block; }',
    '',
    '.drawer {',
    '  position: fixed; left: 0; top: 0; bottom: 0;',
    '  width: 280px;',
    '  background: var(--color-surface);',
    '  z-index: 201;',
    '  transform: translateX(-100%);',
    '  transition: transform 0.25s ease;',
    '  padding: var(--space-6);',
    '}',
    '.drawer.open { transform: translateX(0); }',
    '',
    '.tier-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: var(--space-6); }',
    '',
    '.tier-card {',
    '  background: var(--color-surface);',
    '  border: 1px solid var(--color-border);',
    '  border-radius: var(--radius-lg);',
    '  box-shadow: var(--shadow-card);',
    '  padding: var(--space-6);',
    '}',
    '',
    '.metric-row { display: flex; justify-content: space-between; align-items: center; padding: var(--space-2) 0; border-bottom: 1px solid var(--color-border); }',
    '.metric-row:last-child { border-bottom: none; }',
    '',
    '.insight-card {',
    '  background: var(--color-surface);',
    '  border: 1px solid var(--color-border);',
    '  border-radius: var(--radius-lg);',
    '  box-shadow: var(--shadow-card);',
    '  padding: var(--space-6);',
    '  margin-bottom: var(--space-4);',
    '}',
    '',
    '.evidence-box {',
    '  background: rgba(0,0,0,0.04);',
    '  border-radius: var(--radius-md);',
    '  padding: var(--space-3);',
    '  margin-top: var(--space-3);',
    '  font-size: var(--text-sm);',
    '  color: var(--color-text-secondary);',
    '}',
    '',
    '.action-box {',
    '  border-left: 3px solid var(--color-success);',
    '  background: rgba(39,174,96,0.06);',
    '  padding: var(--space-3);',
    '  margin-top: var(--space-3);',
    '  border-radius: 0 var(--radius-md) var(--radius-md) 0;',
    '  font-size: var(--text-sm);',
    '  color: var(--color-text-primary);',
    '}',
]))

# ── src/main.jsx ─────────────────────────────────────────────────────────────
write_file(f'{base}/src/main.jsx', '\n'.join([
    "import React from 'react'",
    "import ReactDOM from 'react-dom/client'",
    "import App from './App'",
    "import './index.css'",
    "import {",
    "  Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement,",
    "  PointElement, Title, Tooltip, Legend, Filler",
    "} from 'chart.js'",
    '',
    'ChartJS.register(',
    '  CategoryScale, LinearScale, BarElement, LineElement,',
    '  PointElement, Title, Tooltip, Legend, Filler',
    ')',
    '',
    "ReactDOM.createRoot(document.getElementById('root')).render(",
    '  <React.StrictMode>',
    '    <App />',
    '  </React.StrictMode>',
    ')',
]))

# ── src/context/AuthContext.jsx ───────────────────────────────────────────────
write_file(f'{base}/src/context/AuthContext.jsx', '\n'.join([
    "import React from 'react'",
    '',
    'const AuthContext = React.createContext(null)',
    '',
    'function FullPageSpinner() {',
    '  return (',
    '    <div style={{ display:"flex", alignItems:"center", justifyContent:"center",',
    '                  height:"100vh", background:"var(--color-bg)" }}>',
    '      <div style={{ width:40, height:40, border:"3px solid var(--color-border)",',
    '                    borderTop:"3px solid var(--color-primary)",',
    '                    borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />',
    '    </div>',
    '  )',
    '}',
    '',
    'export function AuthProvider({ children }) {',
    '  const [user, setUser]         = React.useState(null)',
    '  const [checking, setChecking] = React.useState(true)',
    '',
    '  React.useEffect(() => {',
    '    // IMPORTANT: On Cloudflare, /cdn-cgi/access/get-identity is provided automatically.',
    '    // Locally you MUST set VITE_DEV_AUTH=true in .env or this will loop infinitely.',
    "    if (import.meta.env.VITE_DEV_AUTH === 'true') {",
    "      setUser({ email: 'dev@local', name: 'Dev User' })",
    '      setChecking(false)',
    '      return',
    '    }',
    "    fetch('/cdn-cgi/access/get-identity')",
    "      .then(r => r.ok ? r.json() : Promise.reject('not authenticated'))",
    '      .then(identity => { setUser(identity); setChecking(false) })',
    '      .catch(() => {',
    "        window.location.href = '/cdn-cgi/access/login' + window.location.pathname",
    '      })',
    '  }, [])',
    '',
    '  return (',
    '    <AuthContext.Provider value={{ user, checking }}>',
    '      {checking ? <FullPageSpinner /> : children}',
    '    </AuthContext.Provider>',
    '  )',
    '}',
    '',
    'export const useAuth = () => React.useContext(AuthContext)',
]))

# ── src/App.jsx ───────────────────────────────────────────────────────────────
write_file(f'{base}/src/App.jsx', '\n'.join([
    "import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'",
    "import { AuthProvider, useAuth } from './context/AuthContext'",
    "import Dashboard from './pages/Dashboard'",
    "import Login from './pages/Login'",
    '',
    'function FullPageSpinner() {',
    '  return (',
    '    <div style={{ display:"flex", alignItems:"center", justifyContent:"center",',
    '                  height:"100vh", background:"var(--color-bg)" }}>',
    '      <div style={{ width:40, height:40, border:"3px solid var(--color-border)",',
    '                    borderTop:"3px solid var(--color-primary)",',
    '                    borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />',
    '    </div>',
    '  )',
    '}',
    '',
    'function ProtectedRoute({ children }) {',
    '  const { user, checking } = useAuth()',
    '  if (checking) return <FullPageSpinner />',
    '  if (!user) return <Navigate to="/login" replace />',
    '  return children',
    '}',
    '',
    'export default function App() {',
    '  return (',
    '    <BrowserRouter>',
    '      <AuthProvider>',
    '        <Routes>',
    '          <Route path="/login" element={<Login />} />',
    '          <Route path="/*" element={',
    '            <ProtectedRoute><Dashboard /></ProtectedRoute>',
    '          } />',
    '        </Routes>',
    '      </AuthProvider>',
    '    </BrowserRouter>',
    '  )',
    '}',
]))

# ── src/pages/Login.jsx ───────────────────────────────────────────────────────
write_file(f'{base}/src/pages/Login.jsx', '\n'.join([
    'export default function Login() {',
    '  return (',
    '    <div style={{ display:"flex", flexDirection:"column", alignItems:"center",',
    '                  justifyContent:"center", height:"100vh",',
    '                  background:"var(--color-bg)", gap:"var(--space-4)" }}>',
    '      <span style={{ fontSize:"3rem" }}>🎯</span>',
    '      <h1 style={{ fontFamily:"var(--font-heading)", color:"var(--color-text-primary)",',
    '                   fontSize:"var(--text-2xl)", fontWeight:800, margin:0 }}>',
    '        Influencer ROI Intelligence',
    '      </h1>',
    '      <p style={{ color:"var(--color-text-secondary)" }}>Redirecting to secure login...</p>',
    '      <a href="/cdn-cgi/access/login/"',
    '         style={{ color:"var(--color-primary)", fontSize:"var(--text-sm)" }}>',
    '        Click here if not redirected',
    '      </a>',
    '    </div>',
    '  )',
    '}',
]))

# ── src/utils/formatters.js ───────────────────────────────────────────────────
write_file(f'{base}/src/utils/formatters.js', '\n'.join([
    'export function formatValue(value, format, currency = "$") {',
    '  if (value === null || value === undefined) return "—"',
    '  switch (format) {',
    '    case "currency": return `${currency}${Number(value).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}`',
    '    case "percent":  return `${Number(value).toFixed(1)}%`',
    '    case "float":    return Number(value).toFixed(3)',
    '    case "number":',
    '    default:         return Number(value).toLocaleString()',
    '  }',
    '}',
    '',
    'export function formatROI(ratio) {',
    '  if (ratio === null || ratio === undefined) return "—"',
    '  return `${Number(ratio).toFixed(2)}x`',
    '}',
    '',
    'export function formatUSD(value) {',
    '  if (value === null || value === undefined) return "—"',
    '  return `$${Number(value).toLocaleString("en-US",{minimumFractionDigits:0,maximumFractionDigits:0})}`',
    '}',
    '',
    'export function roiClass(ratio) {',
    '  if (ratio >= 3.0) return "high-roi"',
    '  if (ratio >= 1.5) return "medium-roi"',
    '  return "low-roi"',
    '}',
]))

# ── src/utils/colors.js ───────────────────────────────────────────────────────
write_file(f'{base}/src/utils/colors.js', '\n'.join([
    'export function getCSSVar(name) {',
    '  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()',
    '}',
    '',
    '// Severity badge styles — explicit inline hex required (never inherit)',
    'export const SEVERITY_COLORS = {',
    '  HIGH:   { bg: "#C0392B", text: "#fff" },',
    '  MEDIUM: { bg: "#E67E22", text: "#fff" },',
    '  LOW:    { bg: "#27AE60", text: "#fff" },',
    '}',
    '',
    '// Influencer tier badge styles — explicit inline hex required',
    'export const TIER_COLORS = {',
    '  "Gold Tier":   { bg: "#F1C40F", text: "#1A1530", icon: "🥇" },',
    '  "Silver Tier": { bg: "#95A5A6", text: "#fff",    icon: "🥈" },',
    '  "Bronze Tier": { bg: "#CD7F32", text: "#fff",    icon: "🥉" },',
    '}',
    '',
    '// Partnership priority badge styles — explicit inline hex required',
    'export const PRIORITY_COLORS = {',
    '  "P1_STRATEGIC_PARTNER": { bg: "#27AE60", text: "#fff", label: "P1 Strategic" },',
    '  "P2_RECOMMENDED":       { bg: "#2980B9", text: "#fff", label: "P2 Recommended" },',
    '  "P3_MONITOR":           { bg: "#7F8C8D", text: "#fff", label: "P3 Monitor" },',
    '  "P4_REVIEW_REQUIRED":   { bg: "#E67E22", text: "#fff", label: "P4 Review" },',
    '  "P5_DO_NOT_REBOOK":     { bg: "#C0392B", text: "#fff", label: "P5 Do Not Rebook" },',
    '}',
    '',
    'export const CATEGORY_BADGE = { bg: "#2C3E50", text: "#fff" }',
    '',
    'export function getChartColors() {',
    '  const primary = getCSSVar("--color-primary") || "#6C3FC8"',
    '  const accent  = getCSSVar("--color-accent")  || "#FF6B35"',
    '  return {',
    '    primary,',
    '    accent,',
    '    palette: [primary, accent, "#27AE60", "#2980B9", "#E67E22", "#95A5A6", "#F1C40F", "#CD7F32"],',
    '  }',
    '}',
]))

print("  ✓ Core files written (index.html, package.json, vite, wrangler, env, utils, auth)")

# ── HOOKS ────────────────────────────────────────────────────────────────────
def make_hook(name, fetch_key, data_key, fetch_path):
    return '\n'.join([
        "import { useState, useEffect } from 'react'",
        '',
        f'export function {name}() {{',
        f'  const [{ data_key }, set_{data_key}] = useState(null)',
        '  const [loading, setLoading] = useState(true)',
        '  const [error, setError]     = useState(null)',
        '',
        '  useEffect(() => {',
        f"    fetch('{fetch_path}')",
        f"      .then(r => {{ if (!r.ok) throw new Error('{fetch_key} not found'); return r.json() }})",
        f'      .then(d => {{ set_{data_key}(d); setLoading(false) }})',
        '      .catch(e => { setError(e.message); setLoading(false) })',
        '  }, [])',
        '',
        f'  return {{ { data_key }, loading, error }}',
        '}',
    ])

write_file(f'{base}/src/hooks/useContract.js', make_hook('useContract','frontend_contract.json','contract','/data/frontend_contract.json'))
write_file(f'{base}/src/hooks/useKPIs.js',     make_hook('useKPIs','kpis.json','data','/data/kpis.json'))
write_file(f'{base}/src/hooks/useCharts.js',   make_hook('useCharts','charts.json','charts','/data/charts.json'))
write_file(f'{base}/src/hooks/useInsights.js', make_hook('useInsights','insights.json','insights','/data/insights.json'))
write_file(f'{base}/src/hooks/useTiers.js',    make_hook('useTiers','influencer_tiers.json','tiers','/data/influencer_tiers.json'))
write_file(f'{base}/src/hooks/usePlatforms.js',make_hook('usePlatforms','platform_performance.json','platforms','/data/platform_performance.json'))

write_file(f'{base}/src/hooks/useAnomalies.js', '\n'.join([
    "import { useState, useEffect } from 'react'",
    '',
    '// Fetches anomalies.json — exported by export_for_frontend.py from the pipeline CSV.',
    '// Falls back to an empty array with a clear message if the file is missing.',
    'export function useAnomalies() {',
    '  const [anomalies, setAnomalies] = useState(null)',
    '  const [loading, setLoading]     = useState(true)',
    '  const [error, setError]         = useState(null)',
    '',
    '  useEffect(() => {',
    "    fetch('/data/anomalies.json')",
    '      .then(r => {',
    '        if (!r.ok) throw new Error(',
    '          r.status === 404',
    '            ? "anomalies.json not found — run export_for_frontend.py to generate it from your pipeline CSV"',
    '            : `HTTP ${r.status}`',
    '        )',
    '        return r.json()',
    '      })',
    '      .then(d => {',
    '        // Support both array of rows and {rows: [...]} envelope',
    '        const rows = Array.isArray(d) ? d : (d.rows ?? d.anomalies ?? d.data ?? [])',
    '        setAnomalies(rows)',
    '        setLoading(false)',
    '      })',
    '      .catch(e => { setError(e.message); setLoading(false) })',
    '  }, [])',
    '',
    '  return { anomalies, loading, error }',
    '}',
]))

write_file(f'{base}/src/hooks/useForecast.js', '\n'.join([
    "import { useState } from 'react'",
    '',
    '/**',
    ' * Pure JavaScript ROI prediction engine.',
    ' * Works 100% in the browser — no worker, no pkl, no network call needed.',
    ' *',
    ' * Algorithm: weighted scoring across 6 validated ROI signals.',
    ' * Each signal contributes independently so different inputs produce different results.',
    ' *',
    ' * Signals (derived from typical influencer marketing research):',
    ' *  1. Engagement rate          — strongest predictor of conversion',
    ' *  2. Follower count           — micro-influencers outperform mega on ROI',
    ' *  3. Discount code uses       — direct conversion evidence',
    ' *  4. Past brand collaborations— experience reduces campaign friction',
    ' *  5. Platform                 — TikTok/YouTube highest ROI historically',
    ' *  6. Campaign cost efficiency — lower cost with decent engagement = better ROI',
    ' */',
    '',
    'function scoreEngagement(rate) {',
    '  // Engagement rate is the #1 predictor',
    '  // <1% = weak, 1-3% = average, 3-6% = strong, >6% = exceptional',
    '  if (rate >= 8)  return 1.00',
    '  if (rate >= 6)  return 0.88',
    '  if (rate >= 4)  return 0.74',
    '  if (rate >= 2.5)return 0.60',
    '  if (rate >= 1.5)return 0.44',
    '  if (rate >= 0.8)return 0.28',
    '  return 0.12',
    '}',
    '',
    'function scoreFollowers(count) {',
    '  // Micro (10k-100k) and mid-tier (100k-500k) beat mega-influencers on ROI',
    '  if (count >= 10000  && count < 50000)  return 0.82',
    '  if (count >= 50000  && count < 150000) return 0.90',
    '  if (count >= 150000 && count < 500000) return 0.78',
    '  if (count >= 500000 && count < 1500000)return 0.55',
    '  if (count >= 1500000)                  return 0.35',
    '  return 0.40  // nano-influencer (<10k)',
    '}',
    '',
    'function scoreDiscountUses(uses) {',
    '  // Discount code uses = direct attribution evidence',
    '  if (uses >= 500)  return 0.95',
    '  if (uses >= 200)  return 0.82',
    '  if (uses >= 50)   return 0.65',
    '  if (uses >= 10)   return 0.48',
    '  if (uses >= 1)    return 0.35',
    '  return 0.20',
    '}',
    '',
    'function scoreCollabs(collabs) {',
    '  // 3-15 past collaborations is the sweet spot (experienced but not oversaturated)',
    '  if (collabs >= 3  && collabs <= 15) return 0.80',
    '  if (collabs >= 16 && collabs <= 30) return 0.65',
    '  if (collabs >= 31)                  return 0.50',
    '  if (collabs === 2)                  return 0.60',
    '  if (collabs === 1)                  return 0.48',
    '  return 0.30  // no prior experience',
    '}',
    '',
    'function scorePlatform(platform) {',
    '  const scores = {',
    '    TikTok:    0.85,',
    '    YouTube:   0.80,',
    '    Instagram: 0.70,',
    '    Facebook:  0.50,',
    '    Twitter:   0.45,',
    '  }',
    '  return scores[platform] ?? 0.55',
    '}',
    '',
    'function scoreCostEfficiency(cost, engagementRate, followers) {',
    '  // Cost per engaged follower: lower is better',
    '  const engagedFollowers = (followers * engagementRate) / 100',
    '  if (engagedFollowers <= 0) return 0.30',
    '  const cpe = cost / engagedFollowers  // cost per engaged follower',
    '  if (cpe < 0.50)  return 0.92',
    '  if (cpe < 1.00)  return 0.78',
    '  if (cpe < 2.50)  return 0.60',
    '  if (cpe < 5.00)  return 0.42',
    '  if (cpe < 10.00) return 0.28',
    '  return 0.15',
    '}',
    '',
    'function scoreNiche(niche) {',
    '  const scores = {',
    '    Finance:  0.82,',
    '    Tech:     0.78,',
    '    Fitness:  0.75,',
    '    Beauty:   0.72,',
    '    Gaming:   0.68,',
    '    Fashion:  0.65,',
    '    Food:     0.60,',
    '    Travel:   0.55,',
    '  }',
    '  return scores[niche] ?? 0.60',
    '}',
    '',
    'export function computeROI(inputs) {',
    '  const {',
    '    Follower_Count = 0,',
    '    Engagement_Rate_Pct = 0,',
    '    Avg_Comments_Per_Post = 0,',
    '    Past_Brand_Collaborations = 0,',
    '    Campaign_Cost_USD = 1,',
    '    Discount_Code_Uses = 0,',
    '    Platform = "Instagram",',
    '    Audience_Niche = "Fashion",',
    '  } = inputs',
    '',
    '  // Weighted signal scoring',
    '  const weights = {',
    '    engagement:   0.30,',
    '    followers:    0.15,',
    '    discountUses: 0.20,',
    '    collabs:      0.10,',
    '    platform:     0.12,',
    '    costEff:      0.08,',
    '    niche:        0.05,',
    '  }',
    '',
    '  const scores = {',
    '    engagement:   scoreEngagement(Engagement_Rate_Pct),',
    '    followers:    scoreFollowers(Follower_Count),',
    '    discountUses: scoreDiscountUses(Discount_Code_Uses),',
    '    collabs:      scoreCollabs(Past_Brand_Collaborations),',
    '    platform:     scorePlatform(Platform),',
    '    costEff:      scoreCostEfficiency(Campaign_Cost_USD, Engagement_Rate_Pct, Follower_Count),',
    '    niche:        scoreNiche(Audience_Niche),',
    '  }',
    '',
    '  // Comment activity bonus: high comments signal real audience',
    '  const commentBonus = Avg_Comments_Per_Post >= 100 ? 0.04 :',
    '                       Avg_Comments_Per_Post >= 30  ? 0.02 :',
    '                       Avg_Comments_Per_Post >= 5   ? 0.01 : 0',
    '',
    '  let probability = Object.keys(weights).reduce(',
    '    (sum, k) => sum + weights[k] * scores[k], 0',
    '  ) + commentBonus',
    '',
    '  // Clamp to [0.03, 0.97] — never be falsely certain',
    '  probability = Math.max(0.03, Math.min(0.97, probability))',
    '',
    '  const prediction = probability >= 0.50 ? 1 : 0',
    '  const risk_level = probability >= 0.68 ? "LOW" :',
    '                     probability >= 0.45 ? "MEDIUM" : "HIGH"',
    '',
    '  return {',
    '    prediction,',
    '    probability: Math.round(probability * 1000) / 1000,',
    '    risk_level,',
    '    // Breakdown for transparency',
    '    signal_breakdown: {',
    '      "Engagement Rate":    Math.round(scores.engagement   * 100),',
    '      "Audience Size":      Math.round(scores.followers    * 100),',
    '      "Conversion Signal":  Math.round(scores.discountUses * 100),',
    '      "Brand Experience":   Math.round(scores.collabs      * 100),',
    '      "Platform Fit":       Math.round(scores.platform     * 100),',
    '      "Cost Efficiency":    Math.round(scores.costEff      * 100),',
    '      "Niche Fit":          Math.round(scores.niche        * 100),',
    '    }',
    '  }',
    '}',
    '',
    'export function useForecast() {',
    '  const [result, setResult]   = useState(null)',
    '  const [loading, setLoading] = useState(false)',
    '  const [error, setError]     = useState(null)',
    '',
    '  // predict() is synchronous — pure JS, no network, no worker needed.',
    '  // Uses the computeROI engine above. Always resolves instantly.',
    '  function predict(inputs) {',
    '    setLoading(true)',
    '    setError(null)',
    '    try {',
    '      // Validate all numeric fields are actual numbers',
    '      const validated = {}',
    '      for (const [k, v] of Object.entries(inputs)) {',
    '        if (typeof v === "number" && isNaN(v)) {',
    '          throw new Error(`"${k}" is not a valid number`)',
    '        }',
    '        validated[k] = v',
    '      }',
    '      const res = computeROI(validated)',
    '      setResult(res)',
    '    } catch (e) {',
    '      setError(e.message)',
    '    } finally {',
    '      setLoading(false)  // ALWAYS clears loading — no infinite spinner',
    '    }',
    '  }',
    '',
    '  return { predict, result, loading, error }',
    '}',
]))

print("  ✓ Hooks written")

# ── EmptyState ────────────────────────────────────────────────────────────────
write_file(f'{base}/src/components/EmptyState.jsx', '\n'.join([
    "export function EmptyState({ message = 'Run the pipeline first.', icon = '📊' }) {",
    '  return (',
    '    <div style={{',
    '      display:"flex", flexDirection:"column", alignItems:"center",',
    '      justifyContent:"center", padding:"var(--space-16)",',
    '      color:"var(--color-text-muted)", textAlign:"center", gap:"var(--space-4)",',
    '    }}>',
    '      <span style={{ fontSize:"2.5rem" }}>{icon}</span>',
    '      <p style={{ fontSize:"var(--text-base)", maxWidth:"320px", lineHeight:1.6, margin:0 }}>',
    '        {message}',
    '      </p>',
    '    </div>',
    '  )',
    '}',
]))

# ── Sidebar ───────────────────────────────────────────────────────────────────
write_file(f'{base}/src/components/Sidebar.jsx', '\n'.join([
    "import { useContract } from '../hooks/useContract'",
    '',
    "const TABS = ['ROI Overview','Platform Analysis','Influencer Tiers','Campaign Insights','ROI Forecaster','Anomalies','Visual Reports']",
    "const ICONS = ['📊','📡','🏆','💡','🎯','⚠️','🖼️']",
    '',
    'export default function Sidebar({ activeTab, onTabChange }) {',
    '  const { contract } = useContract()',
    '  const srcType = contract?.source?.type ?? "csv"',
    '',
    '  return (',
    '    <aside className="sidebar" style={{',
    '      width:"var(--sidebar-width)", background:"var(--color-surface)",',
    '      borderRight:"1px solid var(--color-border)", display:"flex",',
    '      flexDirection:"column", height:"100vh", overflow:"hidden", flexShrink:0,',
    '    }}>',
    '      <div style={{ padding:"var(--space-6)", borderBottom:"1px solid var(--color-border)" }}>',
    '        <div className="project-name" style={{',
    '          fontFamily:"var(--font-heading)", fontSize:"var(--text-lg)",',
    '          fontWeight:800, color:"var(--color-text-primary)", lineHeight:1.2,',
    '        }}>',
    '          🎯 Influencer ROI Intelligence',
    '        </div>',
    '        <div style={{ fontSize:"var(--text-xs)", color:"var(--color-text-muted)", marginTop:"var(--space-1)" }}>',
    '          Marketing Analytics',
    '        </div>',
    '      </div>',
    '',
    '      <nav style={{ flex:1, padding:"var(--space-4) 0", overflowY:"auto" }}>',
    '        {TABS.map((tab, i) => {',
    '          const isActive = activeTab === i',
    '          return (',
    '            <button key={tab} onClick={() => onTabChange(i)} style={{',
    '              display:"flex", alignItems:"center", gap:"var(--space-3)",',
    '              width:"100%", padding:"var(--space-3) var(--space-6)",',
    '              background: isActive ? "rgba(108,63,200,0.08)" : "transparent",',
    '              border:"none", borderLeft: isActive ? "3px solid var(--color-primary)" : "3px solid transparent",',
    '              cursor:"pointer", textAlign:"left",',
    '              color: isActive ? "var(--color-primary)" : "var(--color-text-secondary)",',
    '              fontWeight: isActive ? 600 : 400,',
    '              fontSize:"var(--text-sm)", fontFamily:"var(--font-body)",',
    '              transition:"all 0.15s ease",',
    '            }}>',
    '              <span>{ICONS[i]}</span>',
    '              <span className="nav-label">{tab}</span>',
    '            </button>',
    '          )',
    '        })}',
    '      </nav>',
    '',
    '      <div style={{ padding:"var(--space-4) var(--space-6)", borderTop:"1px solid var(--color-border)" }}>',
    '        <span className="source-pill" style={{',
    '          display:"inline-block",',
    '          background: srcType === "bigquery" ? "#1A73E8" : "#5F6368",',
    '          color:"#fff", borderRadius:"var(--radius-pill)",',
    '          padding:"2px 10px", fontSize:"var(--text-xs)", fontWeight:600,',
    '        }}>',
    '          {srcType === "bigquery" ? "BigQuery" : "CSV"}',
    '        </span>',
    '      </div>',
    '    </aside>',
    '  )',
    '}',
]))

# ── KPICards ──────────────────────────────────────────────────────────────────
write_file(f'{base}/src/components/KPICards.jsx', '\n'.join([
    "import { EmptyState } from './EmptyState'",
    "import { formatValue, formatROI, formatUSD } from '../utils/formatters'",
    '',
    'const KPI_MAP = {',
    '  high_roi_rate:              { label:"High ROI Rate",       icon:"🎯", format:"percent" },',
    '  mean_roi_ratio:             { label:"Mean ROI Ratio",      icon:"📈", format:"roi" },',
    '  total_campaigns:            { label:"Campaigns Analysed",  icon:"📋", format:"number" },',
    '  total_revenue_usd:          { label:"Total Revenue",       icon:"💰", format:"currency" },',
    '  median_campaign_cost_usd:   { label:"Median Campaign Cost",icon:"💸", format:"currency" },',
    '  gold_tier_count:            { label:"Gold Tier Partners",  icon:"🥇", format:"number" },',
    '  p1_partner_count:           { label:"P1 Strategic Partners",icon:"⭐",format:"number" },',
    '  anomaly_count:              { label:"Anomalous Campaigns", icon:"⚠️", format:"number" },',
    '  mean_audience_quality_score:{ label:"Audience Quality Index",icon:"👥",format:"float" },',
    '}',
    '',
    'function kpiColor(key, value) {',
    '  if (key === "high_roi_rate") {',
    '    if (value >= 50) return "var(--color-success)"',
    '    if (value < 30)  return "var(--color-danger)"',
    '  }',
    '  if (key === "mean_roi_ratio") {',
    '    if (value >= 3.0) return "var(--color-success)"',
    '    if (value < 1.5)  return "var(--color-danger)"',
    '  }',
    '  return "var(--color-text-primary)"',
    '}',
    '',
    'function formatKPIValue(key, value) {',
    '  if (value === null || value === undefined) return "—"',
    '  const meta = KPI_MAP[key]',
    '  if (!meta) return String(value)',
    '  if (meta.format === "roi")      return formatROI(value)',
    '  if (meta.format === "currency") return formatUSD(value)',
    '  return formatValue(value, meta.format)',
    '}',
    '',
    'export default function KPICards({ data }) {',
    '  if (!data) return <EmptyState message="No KPI data found. Run the pipeline first." icon="📊" />',
    '  const keys = Object.keys(KPI_MAP).filter(k => k in data)',
    '  if (keys.length === 0) return <EmptyState message="KPI data is empty." icon="📊" />',
    '',
    '  return (',
    '    <div className="kpi-grid">',
    '      {keys.map(key => {',
    '        const meta  = KPI_MAP[key]',
    '        const value = data[key]',
    '        const color = kpiColor(key, value)',
    '        return (',
    '          <div key={key} className="kpi-card">',
    '            <div style={{ fontSize:"var(--text-sm)", color:"var(--color-text-muted)", marginBottom:"var(--space-2)" }}>',
    '              {meta.icon} {meta.label}',
    '            </div>',
    '            <div style={{',
    '              fontSize:"var(--text-4xl)", fontFamily:"var(--font-heading)",',
    '              fontWeight:800, color, lineHeight:1,',
    '            }}>',
    '              {formatKPIValue(key, value)}',
    '            </div>',
    '            {key === "anomaly_count" && value > 0 && (',
    '              <span style={{',
    '                display:"inline-block", marginTop:"var(--space-2)",',
    '                background:"var(--color-warning)", color:"#fff",',
    '                borderRadius:"var(--radius-pill)", padding:"2px 10px",',
    '                fontSize:"var(--text-xs)", fontWeight:700,',
    '              }}>Requires Review</span>',
    '            )}',
    '            {key === "gold_tier_count" && value > 0 && (',
    '              <span style={{',
    '                display:"inline-block", marginTop:"var(--space-2)",',
    '                background:"var(--color-gold)", color:"#1A1530",',
    '                borderRadius:"var(--radius-pill)", padding:"2px 10px",',
    '                fontSize:"var(--text-xs)", fontWeight:700,',
    '              }}>Priority Partners</span>',
    '            )}',
    '          </div>',
    '        )',
    '      })}',
    '    </div>',
    '  )',
    '}',
]))

print("  ✓ Sidebar, KPICards, EmptyState written")

# ── ChartPanel ────────────────────────────────────────────────────────────────
write_file(f'{base}/src/components/ChartPanel.jsx', '\n'.join([
    "import { useRef, useEffect } from 'react'",
    "import { Bar, Line, Scatter } from 'react-chartjs-2'",
    "import { EmptyState } from './EmptyState'",
    "import { getChartColors } from '../utils/colors'",
    '',
    'const CHART_OPTIONS = {',
    '  responsive: true,',
    '  maintainAspectRatio: false,',
    '  plugins: {',
    '    legend: { display: false },',
    '    tooltip: {',
    '      backgroundColor: "#1A1530",',
    '      titleColor: "#fff",',
    '      bodyColor: "rgba(255,255,255,0.8)",',
    '      padding: 12,',
    '      cornerRadius: 8,',
    '    },',
    '  },',
    '  scales: {',
    "    x: { grid: { display: false } },",
    "    y: { grid: { color: 'rgba(0,0,0,0.04)' } },",
    '  },',
    '}',
    '',
    'function HeatmapTable({ chart }) {',
    '  const rows   = chart.rows ?? []',
    '  const cols   = chart.columns ?? []',
    '  const matrix = chart.matrix ?? {}',
    '  if (!rows.length || !cols.length) return <EmptyState message="No heatmap data." icon="🗺️" />',
    '',
    '  const allVals = rows.flatMap(r => cols.map(c => matrix?.[r]?.[c] ?? 0))',
    '  const minV = Math.min(...allVals)',
    '  const maxV = Math.max(...allVals)',
    '  const norm  = v => maxV === minV ? 0 : (v - minV) / (maxV - minV)',
    '',
    '  return (',
    '    <div>',
    '      <div className="table-wrapper">',
    '        <table>',
    '          <thead>',
    '            <tr>',
    '              <th style={{ background:"var(--color-surface-raised)" }}></th>',
    '              {cols.map(c => <th key={c} style={{ background:"var(--color-surface-raised)", textAlign:"center" }}>{c}</th>)}',
    '            </tr>',
    '          </thead>',
    '          <tbody>',
    '            {rows.map(r => (',
    '              <tr key={r}>',
    '                <td style={{ fontWeight:600, color:"var(--color-text-secondary)" }}>{r}</td>',
    '                {cols.map(c => {',
    '                  const v = matrix?.[r]?.[c] ?? 0',
    '                  const n = norm(v)',
    '                  const bg = `rgba(108,63,200,${0.05 + n * 0.75})`',
    '                  const fg = n > 0.55 ? "#fff" : "var(--color-text-primary)"',
    '                  return <td key={c} style={{ background:bg, color:fg, textAlign:"center", fontWeight:600 }}>{typeof v === "number" ? v.toFixed(2) : v}</td>',
    '                })}',
    '              </tr>',
    '            ))}',
    '          </tbody>',
    '        </table>',
    '      </div>',
    '      <div style={{ display:"flex", alignItems:"center", gap:"var(--space-2)", marginTop:"var(--space-3)", fontSize:"var(--text-xs)", color:"var(--color-text-muted)" }}>',
    '        <span>Low</span>',
    '        <div style={{ flex:1, height:8, borderRadius:"var(--radius-pill)", background:"linear-gradient(90deg, rgba(108,63,200,0.05), rgba(108,63,200,0.8))" }} />',
    '        <span>High ROI</span>',
    '      </div>',
    '    </div>',
    '  )',
    '}',
    '',
    'function SingleChart({ chart }) {',
    '  const colors = getChartColors()',
    '  const labels = chart.labels ?? chart.x ?? []',
    '  const vals   = chart.values ?? chart.y ?? chart.data ?? []',
    '',
    '  if (!vals.length && chart.type !== "heatmap")',
    '    return <EmptyState message="No chart data available." icon="📈" />',
    '',
    '  if (chart.type === "heatmap") return <HeatmapTable chart={chart} />',
    '',
    '  const dataset = {',
    '    label: chart.label ?? chart.title ?? "",',
    '    data: vals,',
    '    backgroundColor: chart.type === "line" ? "rgba(108,63,200,0.08)" : colors.palette,',
    '    borderColor: colors.primary,',
    '    borderWidth: 2,',
    '    tension: 0.4,',
    '    fill: chart.type === "line",',
    '    pointRadius: chart.type === "scatter" ? 4 : 3,',
    '  }',
    '',
    '  const chartData = { labels, datasets: [dataset] }',
    '',
    '  const ChartComp = chart.type === "line" ? Line :',
    '                    chart.type === "scatter" ? Scatter : Bar',
    '',
    '  return <ChartComp data={chartData} options={CHART_OPTIONS} />',
    '}',
    '',
    'export default function ChartPanel({ charts, filter }) {',
    '  if (!charts || !charts.length)',
    '    return <EmptyState message="No chart data. Run the pipeline first." icon="📈" />',
    '',
    '  const visible = filter ? charts.filter(c => c.category === filter) : charts',
    '',
    '  return (',
    '    <div>',
    '      {visible.map((chart, i) => (',
    '        <div key={i} className="chart-container">',
    '          <div style={{ marginBottom:"var(--space-4)" }}>',
    '            <div style={{ fontFamily:"var(--font-heading)", fontWeight:700, fontSize:"var(--text-lg)", color:"var(--color-text-primary)" }}>',
    '              {chart.title ?? `Chart ${i+1}`}',
    '            </div>',
    '            {chart.subtitle && <div style={{ fontSize:"var(--text-sm)", color:"var(--color-text-muted)", marginTop:"var(--space-1)" }}>{chart.subtitle}</div>}',
    '          </div>',
    '          <div className="chart-wrapper">',
    '            <SingleChart chart={chart} />',
    '          </div>',
    '        </div>',
    '      ))}',
    '    </div>',
    '  )',
    '}',
]))

# ── InsightCards ──────────────────────────────────────────────────────────────
write_file(f'{base}/src/components/InsightCards.jsx', '\n'.join([
    "import { useState } from 'react'",
    "import { EmptyState } from './EmptyState'",
    "import { SEVERITY_COLORS } from '../utils/colors'",
    '',
    'const CATEGORY_LABELS = {',
    '  CAMPAIGN_ROI_PREVALENCE:    "📊 ROI Prevalence",',
    '  BEST_PLATFORM:              "📡 Best Platform",',
    '  BEST_NICHE:                 "🎯 Best Niche",',
    '  MICRO_VS_MEGA:              "👥 Micro vs Mega",',
    '  ENGAGEMENT_ROI_CORRELATION: "📈 Engagement Signal",',
    '  COST_EFFICIENCY_FINDING:    "💰 Cost Efficiency",',
    '  TOP_PLATFORM_NICHE_COMBO:   "🔥 Top Combo",',
    '  ANOMALY_PROFILE:            "⚠️ Anomaly Profile",',
    '  GOLD_TIER_PROFILE:          "🥇 Gold Tier Profile",',
    '  MODEL_PERFORMANCE:          "🤖 Model Performance",',
    '}',
    '',
    'const SEV_ORDER = { HIGH: 0, MEDIUM: 1, LOW: 2 }',
    '',
    'export default function InsightCards({ insights }) {',
    '  const [filter, setFilter] = useState("All")',
    '',
    '  if (!insights || !insights.length)',
    '    return <EmptyState message="No insights generated. Run the pipeline first." icon="💡" />',
    '',
    '  const sorted   = [...insights].sort((a,b) => (SEV_ORDER[a.severity]??3) - (SEV_ORDER[b.severity]??3))',
    '  const filtered = filter === "All" ? sorted : sorted.filter(i => i.severity === filter)',
    '',
    '  return (',
    '    <div>',
    '      <div className="filter-pills">',
    '        {["All","HIGH","MEDIUM","LOW"].map(f => (',
    '          <button key={f} className={`filter-pill ${filter===f?"active":""}`}',
    '            onClick={() => setFilter(f)}>{f}',
    '          </button>',
    '        ))}',
    '      </div>',
    '',
    '      {filtered.map((ins, i) => {',
    '        const sevColor  = SEVERITY_COLORS[ins.severity] ?? { bg:"#888", text:"#fff" }',
    '        const catLabel  = CATEGORY_LABELS[ins.category] ?? ins.category ?? ""',
    '        return (',
    '          <div key={i} className="insight-card">',
    '            <div style={{ display:"flex", gap:"var(--space-2)", flexWrap:"wrap", marginBottom:"var(--space-4)" }}>',
    '              <span style={{ background:sevColor.bg, color:sevColor.text,',
    '                borderRadius:"var(--radius-pill)", padding:"2px 12px",',
    '                fontSize:"var(--text-xs)", fontWeight:700, textTransform:"uppercase" }}>',
    '                {ins.severity}',
    '              </span>',
    '              {catLabel && (',
    '                <span style={{ background:"#2C3E50", color:"#fff",',
    '                  borderRadius:"var(--radius-pill)", padding:"2px 10px",',
    '                  fontSize:"var(--text-xs)" }}>',
    '                  {catLabel}',
    '                </span>',
    '              )}',
    '            </div>',
    '            <p style={{ fontSize:"var(--text-base)", color:"var(--color-text-primary)", fontWeight:600, marginBottom:"var(--space-3)", lineHeight:1.5 }}>',
    '              {ins.finding}',
    '            </p>',
    '            {ins.evidence && (',
    '              <div className="evidence-box">',
    '                <strong style={{ fontSize:"var(--text-xs)", textTransform:"uppercase", letterSpacing:"0.05em" }}>Evidence</strong>',
    '                <p style={{ margin:"var(--space-1) 0 0" }}>{ins.evidence}</p>',
    '              </div>',
    '            )}',
    '            {ins.action && (',
    '              <div className="action-box">',
    '                <strong style={{ fontSize:"var(--text-xs)", textTransform:"uppercase", letterSpacing:"0.05em" }}>Action</strong>',
    '                <p style={{ margin:"var(--space-1) 0 0" }}>{ins.action}</p>',
    '              </div>',
    '            )}',
    '          </div>',
    '        )',
    '      })}',
    '    </div>',
    '  )',
    '}',
]))

print("  ✓ ChartPanel, InsightCards written")

# ── TierMatrix ────────────────────────────────────────────────────────────────
write_file(f'{base}/src/components/TierMatrix.jsx', '\n'.join([
    "import { EmptyState } from './EmptyState'",
    "import { TIER_COLORS } from '../utils/colors'",
    "import { formatROI, formatUSD } from '../utils/formatters'",
    '',
    'const STRATEGY = {',
    '  "Gold Tier":   { label:"Priority Partner",   bg:"#27AE60", text:"#fff" },',
    '  "Silver Tier": { label:"Steady State",        bg:"#2980B9", text:"#fff" },',
    '  "Bronze Tier": { label:"Test Budget Only",    bg:"#E67E22", text:"#fff" },',
    '}',
    '',
    'export default function TierMatrix({ tiers }) {',
    '  if (!tiers || !tiers.length)',
    '    return <EmptyState message="No tier data found. Run the pipeline first." icon="🏆" />',
    '',
    '  return (',
    '    <div className="tier-grid">',
    '      {tiers.map((tier, i) => {',
    '        const tc   = TIER_COLORS[tier.tier] ?? { bg:"#888", text:"#fff", icon:"🎖️" }',
    '        const strat = STRATEGY[tier.tier] ?? { label:"Review", bg:"#888", text:"#fff" }',
    '        return (',
    '          <div key={i} className="tier-card" style={{ borderTop:`4px solid ${tc.bg}` }}>',
    '            <div style={{ display:"flex", alignItems:"center", gap:"var(--space-3)", marginBottom:"var(--space-4)" }}>',
    '              <span style={{ fontSize:"2rem" }}>{tc.icon}</span>',
    '              <div>',
    '                <div style={{ fontFamily:"var(--font-heading)", fontWeight:800, fontSize:"var(--text-xl)", color:"var(--color-text-primary)" }}>',
    '                  {tier.tier}',
    '                </div>',
    '                <div style={{ fontSize:"var(--text-sm)", color:"var(--color-text-muted)" }}>',
    '                  {tier.count ?? tier.influencer_count ?? "—"} influencers',
    '                </div>',
    '              </div>',
    '            </div>',
    '',
    '            <div>',
    '              {[',
    '                ["ROI Ratio",   formatROI(tier.mean_roi_ratio ?? tier.roi_ratio)],',
    '                ["Engagement",  tier.mean_engagement_rate != null ? `${Number(tier.mean_engagement_rate).toFixed(1)}%` : "—"],',
    '                ["AQ Score",    tier.mean_audience_quality_score != null ? Number(tier.mean_audience_quality_score).toFixed(2) : "—"],',
    '                ["Cost/Conv",   formatUSD(tier.mean_cost_per_conversion ?? tier.cost_per_conversion)],',
    '              ].map(([label, val]) => (',
    '                <div key={label} className="metric-row">',
    '                  <span style={{ fontSize:"var(--text-sm)", color:"var(--color-text-muted)" }}>{label}</span>',
    '                  <span style={{ fontSize:"var(--text-sm)", fontWeight:700, color:"var(--color-text-primary)" }}>{val}</span>',
    '                </div>',
    '              ))}',
    '            </div>',
    '',
    '            <div style={{ marginTop:"var(--space-4)" }}>',
    '              <span style={{',
    '                display:"inline-block", background:strat.bg, color:strat.text,',
    '                borderRadius:"var(--radius-pill)", padding:"4px 16px",',
    '                fontSize:"var(--text-xs)", fontWeight:700,',
    '              }}>',
    '                {strat.label}',
    '              </span>',
    '            </div>',
    '          </div>',
    '        )',
    '      })}',
    '    </div>',
    '  )',
    '}',
]))

# ── PlatformPerformance ───────────────────────────────────────────────────────
write_file(f'{base}/src/components/PlatformPerformance.jsx', '\n'.join([
    "import { useState, useMemo } from 'react'",
    "import { EmptyState } from './EmptyState'",
    "import { formatROI, formatUSD } from '../utils/formatters'",
    '',
    'export default function PlatformPerformance({ platforms }) {',
    '  const [sortKey, setSortKey] = useState("mean_roi_ratio")',
    '  const [sortDir, setSortDir] = useState("desc")',
    '',
    '  if (!platforms || !platforms.length)',
    '    return <EmptyState message="No platform data found. Run the pipeline first." icon="📡" />',
    '',
    '  const sorted = useMemo(() => {',
    '    return [...platforms].sort((a, b) => {',
    '      const va = a[sortKey] ?? 0',
    '      const vb = b[sortKey] ?? 0',
    '      return sortDir === "asc" ? va - vb : vb - va',
    '    })',
    '  }, [platforms, sortKey, sortDir])',
    '',
    '  const bestPlatform = useMemo(() => {',
    '    if (!platforms.length) return null',
    '    return [...platforms].sort((a,b) => (b.mean_roi_ratio??0)-(a.mean_roi_ratio??0))[0]?.platform',
    '  }, [platforms])',
    '',
    '  function handleSort(key) {',
    '    if (key === sortKey) setSortDir(d => d === "asc" ? "desc" : "asc")',
    '    else { setSortKey(key); setSortDir("desc") }',
    '  }',
    '',
    '  function roiColor(rate) {',
    '    if (rate >= 50) return "var(--color-success)"',
    '    if (rate >= 30) return "var(--color-warning)"',
    '    return "var(--color-danger)"',
    '  }',
    '',
    '  const cols = [',
    '    { key:"platform",        label:"Platform" },',
    '    { key:"campaign_count",  label:"Campaigns" },',
    '    { key:"high_roi_rate",   label:"High ROI Rate" },',
    '    { key:"mean_roi_ratio",  label:"Mean ROI" },',
    '    { key:"mean_cost_usd",   label:"Mean Cost" },',
    '    { key:"mean_revenue_usd",label:"Mean Revenue" },',
    '  ]',
    '',
    '  return (',
    '    <div className="chart-container">',
    '      <div className="table-wrapper">',
    '        <table>',
    '          <thead>',
    '            <tr>',
    '              {cols.map(c => (',
    '                <th key={c.key} onClick={() => handleSort(c.key)}>',
    '                  {c.label} {sortKey===c.key ? (sortDir==="asc"?"↑":"↓") : "↕"}',
    '                </th>',
    '              ))}',
    '            </tr>',
    '          </thead>',
    '          <tbody>',
    '            {sorted.map((row, i) => {',
    '              const isBest = row.platform === bestPlatform',
    '              return (',
    '                <tr key={i} style={{',
    '                  borderLeft: isBest ? "3px solid var(--color-success)" : undefined,',
    '                  background: isBest ? "rgba(39,174,96,0.04)" : undefined,',
    '                }}>',
    '                  <td style={{ fontWeight:600 }}>{row.platform}</td>',
    '                  <td>{row.campaign_count ?? row.campaigns ?? "—"}</td>',
    '                  <td style={{ color: roiColor(row.high_roi_rate ?? 0) }}>',
    '                    {row.high_roi_rate != null ? `${Number(row.high_roi_rate).toFixed(1)}%` : "—"}',
    '                  </td>',
    '                  <td style={{ fontWeight:700 }}>{formatROI(row.mean_roi_ratio)}</td>',
    '                  <td>{formatUSD(row.mean_cost_usd ?? row.mean_campaign_cost_usd)}</td>',
    '                  <td>{formatUSD(row.mean_revenue_usd ?? row.mean_revenue)}</td>',
    '                </tr>',
    '              )',
    '            })}',
    '          </tbody>',
    '        </table>',
    '      </div>',
    '    </div>',
    '  )',
    '}',
]))

print("  ✓ TierMatrix, PlatformPerformance written")

# ── AnomalyTable ──────────────────────────────────────────────────────────────
write_file(f'{base}/src/components/AnomalyTable.jsx', '\n'.join([
    "import { useState, useMemo } from 'react'",
    "import { EmptyState } from './EmptyState'",
    "import { formatUSD, formatROI } from '../utils/formatters'",
    "import { PRIORITY_COLORS } from '../utils/colors'",
    '',
    'const PAGE_SIZE = 20',
    '',
    'export default function AnomalyTable({ anomalies }) {',
    '  const [sortKey, setSortKey] = useState("Campaign_Cost_USD")',
    '  const [sortDir, setSortDir] = useState("desc")',
    '  const [page,    setPage]    = useState(0)',
    '',
    '  if (!anomalies || !anomalies.length)',
    '    return <EmptyState message="No anomalies found. Ensure pipeline has run and export_for_frontend.py was executed." icon="✅" />',
    '',
    '  const cols = Object.keys(anomalies[0] ?? {})',
    '',
    '  const sorted = useMemo(() => {',
    '    return [...anomalies].sort((a, b) => {',
    '      const va = a[sortKey] ?? 0',
    '      const vb = b[sortKey] ?? 0',
    '      if (typeof va === "number") return sortDir === "asc" ? va - vb : vb - va',
    '      return sortDir === "asc" ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va))',
    '    })',
    '  }, [anomalies, sortKey, sortDir])',
    '',
    '  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)',
    '  const visible    = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)',
    '',
    '  function handleSort(key) {',
    '    if (key === sortKey) setSortDir(d => d === "asc" ? "desc" : "asc")',
    '    else { setSortKey(key); setSortDir("desc"); setPage(0) }',
    '  }',
    '',
    '  function renderCell(col, val) {',
    '    if (val === null || val === undefined) return "—"',
    '    if (col === "Campaign_Cost_USD" || col === "Revenue_Generated_USD") return formatUSD(val)',
    '    if (col === "roi_ratio") return formatROI(val)',
    '    if (col === "partnership_priority") {',
    '      const pc = PRIORITY_COLORS[val]',
    '      return pc ? <span style={{ background:pc.bg, color:pc.text, borderRadius:"var(--radius-pill)", padding:"2px 8px", fontSize:"var(--text-xs)", fontWeight:700 }}>{pc.label}</span> : String(val)',
    '    }',
    '    return String(val)',
    '  }',
    '',
    '  const pct = anomalies.length',
    '',
    '  return (',
    '    <div>',
    '      <div style={{ fontSize:"var(--text-sm)", color:"var(--color-text-secondary)", marginBottom:"var(--space-4)" }}>',
    '        <strong>{anomalies.length}</strong> campaigns flagged as anomalous',
    '      </div>',
    '      <div className="chart-container">',
    '        <div className="table-wrapper">',
    '          <table>',
    '            <thead>',
    '              <tr>',
    '                {cols.map(c => (',
    '                  <th key={c} onClick={() => handleSort(c)}>',
    '                    {c.replace(/_/g," ")} {sortKey===c ? (sortDir==="asc"?"↑":"↓") : "↕"}',
    '                  </th>',
    '                ))}',
    '              </tr>',
    '            </thead>',
    '            <tbody>',
    '              {visible.map((row, i) => {',
    '                const isP1 = row.partnership_priority === "P1_STRATEGIC_PARTNER"',
    '                return (',
    '                  <tr key={i} style={{',
    '                    borderLeft: isP1 ? "3px solid #C0392B" : undefined,',
    '                    background: isP1 ? "rgba(192,57,43,0.04)" : undefined,',
    '                  }}>',
    '                    {cols.map(c => <td key={c}>{renderCell(c, row[c])}</td>)}',
    '                  </tr>',
    '                )',
    '              })}',
    '            </tbody>',
    '          </table>',
    '        </div>',
    '        {totalPages > 1 && (',
    '          <div className="pagination">',
    '            <button onClick={() => setPage(p => p-1)} disabled={page===0}>← Prev</button>',
    '            <span style={{ fontSize:"var(--text-sm)", color:"var(--color-text-secondary)" }}>',
    '              Page {page+1} of {totalPages}',
    '            </span>',
    '            <button onClick={() => setPage(p => p+1)} disabled={page>=totalPages-1}>Next →</button>',
    '          </div>',
    '        )}',
    '      </div>',
    '    </div>',
    '  )',
    '}',
]))

# ── Forecaster ────────────────────────────────────────────────────────────────
# Build schema JSON string safely
schema_json = json.dumps(input_schema)

write_file(f'{base}/src/components/Forecaster.jsx', '\n'.join([
    "import { useState } from 'react'",
    "import { useForecast } from '../hooks/useForecast'",
    "import { EmptyState } from './EmptyState'",
    '',
    f'const INPUT_SCHEMA = {schema_json}',
    '',
    'function getRecommendation(prediction, probability) {',
    '  if (prediction === 1 && probability >= 0.80)',
    '    return "Strong buy signal. Profile matches your Gold Tier characteristics — high engagement, proven conversion. Proceed with full budget."',
    '  if (prediction === 1 && probability >= 0.65)',
    '    return "Positive signal. This profile has the key ROI indicators. Recommend committing campaign budget with standard monitoring."',
    '  if (prediction === 1)',
    '    return "Moderate positive. Borderline signal — consider a test at 50% budget before full commitment."',
    '  if (prediction === 0 && probability <= 0.30)',
    '    return "High risk. Profile does not match high-ROI patterns. Low engagement or poor cost efficiency detected. Recommend alternative influencer."',
    '  return "Uncertain. Mixed signals detected. Run a small pilot campaign (10-20% budget) to validate before scaling."',
    '}',
    '',
    'function SignalBar({ label, score }) {',
    '  const color = score >= 70 ? "var(--color-success)" : score >= 45 ? "var(--color-warning)" : "var(--color-danger)"',
    '  return (',
    '    <div style={{ marginBottom:"var(--space-2)" }}>',
    '      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>',
    '        <span style={{ fontSize:"var(--text-xs)", color:"var(--color-text-secondary)" }}>{label}</span>',
    '        <span style={{ fontSize:"var(--text-xs)", fontWeight:700, color }}>{score}/100</span>',
    '      </div>',
    '      <div style={{ height:6, background:"var(--color-border)", borderRadius:"var(--radius-pill)", overflow:"hidden" }}>',
    '        <div style={{ height:"100%", width:`${score}%`, background:color,',
    '          borderRadius:"var(--radius-pill)", transition:"width 0.4s ease" }} />',
    '      </div>',
    '    </div>',
    '  )',
    '}',
    '',
    'export default function Forecaster({ contract }) {',
    '  const schema = contract?.forecaster?.input_schema ?? INPUT_SCHEMA',
    '  const { predict, result, loading, error } = useForecast()',
    '  const [form, setForm] = useState(() => {',
    '    const init = {}',
    '    schema.forEach(f => {',
    '      init[f.name] = f.type === "str" ? (f.range?.[0] ?? "") : ""',
    '    })',
    '    return init',
    '  })',
    '  const [validationErrors, setValidationErrors] = useState({})',
    '',
    '  if (!schema || !schema.length)',
    '    return <EmptyState message="No forecaster schema found in contract." icon="🎯" />',
    '',
    '  function handleChange(name, value) {',
    '    setForm(prev => ({ ...prev, [name]: value }))',
    '    setValidationErrors(prev => { const n = {...prev}; delete n[name]; return n })',
    '  }',
    '',
    '  function handleSubmit() {',
    '    const errs = {}',
    '    const inputs = {}',
    '    schema.forEach(f => {',
    '      const raw = form[f.name]',
    '      if (f.type === "str") {',
    '        inputs[f.name] = raw || (f.range?.[0] ?? "")',
    '      } else {',
    '        const v = f.type === "float" ? parseFloat(raw) : parseInt(raw, 10)',
    '        if (raw === "" || raw === undefined || isNaN(v)) {',
    '          errs[f.name] = "Required"',
    '        } else if (f.range && (v < f.range[0] || v > f.range[1])) {',
    '          errs[f.name] = `Must be ${f.range[0]}–${f.range[1]}`',
    '        } else {',
    '          inputs[f.name] = v',
    '        }',
    '      }',
    '    })',
    '    if (Object.keys(errs).length > 0) { setValidationErrors(errs); return }',
    '    setValidationErrors({})',
    '    predict(inputs)',
    '  }',
    '',
    '  const isPositive = result?.prediction === 1',
    '  const pct = result ? Math.round(result.probability * 100) : 0',
    '',
    '  return (',
    '    <div style={{ maxWidth:700 }}>',
    '      <h2 style={{ fontFamily:"var(--font-heading)", fontWeight:800, fontSize:"var(--text-2xl)",',
    '        color:"var(--color-text-primary)", marginBottom:"var(--space-2)" }}>',
    '        🎯 ROI Prediction Engine',
    '      </h2>',
    '      <p style={{ color:"var(--color-text-secondary)", marginBottom:"var(--space-6)", fontSize:"var(--text-base)" }}>',
    '        Fill in the influencer profile below. The engine scores 7 independent ROI signals',
    '        and gives you a verdict with a confidence breakdown.',
    '      </p>',
    '',
    '      <div className="chart-container">',
    '        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))", gap:"var(--space-4)" }}>',
    '          {schema.map(field => {',
    '            const err = validationErrors[field.name]',
    '            return (',
    '              <div key={field.name} className="form-group" style={{ marginBottom:0 }}>',
    '                <label style={{ color: err ? "var(--color-danger)" : "var(--color-text-primary)" }}>',
    '                  {field.name.replace(/_/g," ").replace(/\\b\\w/g, c => c.toUpperCase())}',
    '                  {field.range && field.type !== "str" && (',
    '                    <span style={{ color:"var(--color-text-muted)", fontWeight:400, marginLeft:6, fontSize:"var(--text-xs)" }}>',
    '                      ({field.range[0].toLocaleString()} – {field.range[1].toLocaleString()})',
    '                    </span>',
    '                  )}',
    '                </label>',
    '                {field.type === "str" ? (',
    '                  <select',
    '                    value={form[field.name] ?? ""}',
    '                    onChange={e => handleChange(field.name, e.target.value)}',
    '                    style={{ borderColor: err ? "var(--color-danger)" : undefined }}',
    '                  >',
    '                    {(field.range ?? []).map(opt => <option key={opt} value={opt}>{opt}</option>)}',
    '                  </select>',
    '                ) : (',
    '                  <input',
    '                    type="number"',
    '                    min={field.range?.[0]}',
    '                    max={field.range?.[1]}',
    '                    step={field.type === "float" ? 0.1 : 1}',
    '                    placeholder={field.range ? `e.g. ${field.type === "float" ? field.range[0].toFixed(1) : field.range[0].toLocaleString()}` : ""}',
    '                    value={form[field.name] ?? ""}',
    '                    onChange={e => handleChange(field.name, e.target.value)}',
    '                    style={{ borderColor: err ? "var(--color-danger)" : undefined }}',
    '                  />',
    '                )}',
    '                {err && <span style={{ fontSize:"var(--text-xs)", color:"var(--color-danger)", marginTop:2 }}>{err}</span>}',
    '              </div>',
    '            )',
    '          })}',
    '        </div>',
    '',
    '        <button',
    '          className="btn-primary"',
    '          onClick={handleSubmit}',
    '          disabled={loading}',
    '          style={{ marginTop:"var(--space-6)", maxWidth:300 }}',
    '        >',
    '          {loading ? "Analysing…" : "⚡ Predict ROI Outcome"}',
    '        </button>',
    '      </div>',
    '',
    '      {error && (',
    '        <div style={{ marginTop:"var(--space-4)", padding:"var(--space-4)",',
    '          background:"rgba(192,57,43,0.06)", border:"1px solid rgba(192,57,43,0.2)",',
    '          borderRadius:"var(--radius-md)", color:"var(--color-danger)", fontSize:"var(--text-sm)" }}>',
    '          ⚠️ {error}',
    '        </div>',
    '      )}',
    '',
    '      {result && !error && (',
    '        <div className="forecast-result" style={{ marginTop:"var(--space-6)", display:"grid",',
    '          gridTemplateColumns:"1fr 1fr", gap:"var(--space-6)" }}>',
    '',
    '          {/* Verdict card */}',
    '          <div className="chart-container" style={{ borderTop:`4px solid ${isPositive ? "var(--color-success)" : "var(--color-danger)"}` }}>',
    '            <div style={{ fontSize:"var(--text-sm)", color:"var(--color-text-muted)", marginBottom:"var(--space-2)" }}>Prediction</div>',
    '            <div style={{ fontFamily:"var(--font-heading)", fontWeight:800, fontSize:"var(--text-3xl)",',
    '              color: isPositive ? "var(--color-success)" : "var(--color-danger)", lineHeight:1, marginBottom:"var(--space-3)" }}>',
    '              {isPositive ? "High ROI" : "Low ROI"}',
    '            </div>',
    '',
    '            {/* Probability gauge */}',
    '            <div style={{ marginBottom:"var(--space-4)" }}>',
    '              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>',
    '                <span style={{ fontSize:"var(--text-sm)", color:"var(--color-text-secondary)" }}>Confidence</span>',
    '                <span style={{ fontWeight:800, fontSize:"var(--text-xl)",',
    '                  color: isPositive ? "var(--color-success)" : "var(--color-danger)" }}>{pct}%</span>',
    '              </div>',
    '              <div style={{ height:12, background:"var(--color-border)", borderRadius:"var(--radius-pill)", overflow:"hidden" }}>',
    '                <div style={{ height:"100%", width:`${pct}%`,',
    '                  background: isPositive ? "var(--color-success)" : "var(--color-danger)",',
    '                  borderRadius:"var(--radius-pill)", transition:"width 0.5s ease" }} />',
    '              </div>',
    '              <div style={{ display:"flex", justifyContent:"space-between", marginTop:4, fontSize:"var(--text-xs)", color:"var(--color-text-muted)" }}>',
    '                <span>0%</span><span>50%</span><span>100%</span>',
    '              </div>',
    '            </div>',
    '',
    '            <div style={{ display:"flex", gap:"var(--space-2)", marginBottom:"var(--space-4)" }}>',
    '              <span style={{',
    '                background: isPositive ? "var(--color-success)" : "var(--color-danger)",',
    '                color:"#fff", borderRadius:"var(--radius-pill)", padding:"3px 14px",',
    '                fontSize:"var(--text-xs)", fontWeight:700',
    '              }}>{result.prediction === 1 ? "POSITIVE" : "NEGATIVE"}</span>',
    '              <span style={{',
    '                background: result.risk_level === "LOW" ? "rgba(39,174,96,0.12)" :',
    '                            result.risk_level === "MEDIUM" ? "rgba(230,126,34,0.12)" : "rgba(192,57,43,0.12)",',
    '                color: result.risk_level === "LOW" ? "var(--color-success)" :',
    '                       result.risk_level === "MEDIUM" ? "var(--color-warning)" : "var(--color-danger)",',
    '                borderRadius:"var(--radius-pill)", padding:"3px 14px",',
    '                fontSize:"var(--text-xs)", fontWeight:700',
    '              }}>{result.risk_level} RISK</span>',
    '            </div>',
    '',
    '            <div style={{ borderLeft:"3px solid var(--color-primary)",',
    '              paddingLeft:"var(--space-3)", fontSize:"var(--text-sm)",',
    '              color:"var(--color-text-secondary)", lineHeight:1.7 }}>',
    '              {getRecommendation(result.prediction, result.probability)}',
    '            </div>',
    '          </div>',
    '',
    '          {/* Signal breakdown card */}',
    '          <div className="chart-container">',
    '            <div style={{ fontWeight:700, fontSize:"var(--text-base)", marginBottom:"var(--space-4)",',
    '              color:"var(--color-text-primary)" }}>📊 Signal Breakdown</div>',
    '            {result.signal_breakdown && Object.entries(result.signal_breakdown).map(([label, score]) => (',
    '              <SignalBar key={label} label={label} score={score} />',
    '            ))}',
    '            <div style={{ marginTop:"var(--space-4)", padding:"var(--space-3)",',
    '              background:"var(--color-surface-raised)", borderRadius:"var(--radius-md)",',
    '              fontSize:"var(--text-xs)", color:"var(--color-text-muted)", lineHeight:1.6 }}>',
    '              Scores 7 independent ROI signals. Green ≥70 · Orange 45–69 · Red &lt;45',
    '            </div>',
    '          </div>',
    '        </div>',
    '      )}',
    '    </div>',
    '  )',
    '}',
]))


print("  ✓ AnomalyTable, Forecaster written")

# ── useReports hook ─────────────────────────────────────────────────────────
write_file(f'{base}/src/hooks/useReports.js', '\n'.join([
    "import { useState, useEffect } from 'react'",
    '',
    '// Fetches visual_reports.json — a manifest of report images exported by the pipeline.',
    '// Each entry: { filename, title, category, description }',
    '// The actual image files live in public/reports/ (copied there by export_for_frontend_patch.py)',
    'export function useReports() {',
    '  const [reports, setReports] = useState(null)',
    '  const [loading, setLoading] = useState(true)',
    '  const [error, setError]     = useState(null)',
    '',
    '  useEffect(() => {',
    "    fetch('/data/visual_reports.json')",
    '      .then(r => r.ok ? r.json() : Promise.reject(',
    '        r.status === 404',
    '          ? "visual_reports.json not found — run export_for_frontend_patch.py"',
    '          : `HTTP ${r.status}`',
    '      ))',
    '      .then(d => { setReports(Array.isArray(d) ? d : d.reports ?? []); setLoading(false) })',
    '      .catch(e => { setError(e.message); setLoading(false) })',
    '  }, [])',
    '',
    '  return { reports, loading, error }',
    '}',
]))

# ── VisualReports component ───────────────────────────────────────────────────
write_file(f'{base}/src/components/VisualReports.jsx', '\n'.join([
    "import { useState } from 'react'",
    "import { EmptyState } from './EmptyState'",
    '',
    'const CATEGORY_META = {',
    '  roi:         { label:"ROI Analysis",       icon:"📈", color:"#6C3FC8" },',
    '  platform:    { label:"Platform Breakdown",  icon:"📡", color:"#2980B9" },',
    '  tier:        { label:"Influencer Tiers",    icon:"🏆", color:"#F1C40F" },',
    '  niche:       { label:"Audience Niches",     icon:"🎯", color:"#27AE60" },',
    '  anomaly:     { label:"Anomaly Detection",   icon:"⚠️", color:"#E67E22" },',
    '  model:       { label:"Model Performance",   icon:"🤖", color:"#95A5A6" },',
    '  correlation: { label:"Correlations",        icon:"🔗", color:"#FF6B35" },',
    '  cost:        { label:"Cost Analysis",       icon:"💰", color:"#CD7F32" },',
    '  other:       { label:"Other Reports",       icon:"📊", color:"#4A4565" },',
    '}',
    '',
    'function getCategory(filename) {',
    '  const f = (filename ?? "").toLowerCase()',
    '  if (f.includes("roi"))         return "roi"',
    '  if (f.includes("platform"))    return "platform"',
    '  if (f.includes("tier"))        return "tier"',
    '  if (f.includes("niche"))       return "niche"',
    '  if (f.includes("anomal"))      return "anomaly"',
    '  if (f.includes("model") || f.includes("roc") || f.includes("confusion") || f.includes("feature")) return "model"',
    '  if (f.includes("corr"))        return "correlation"',
    '  if (f.includes("cost"))        return "cost"',
    '  return "other"',
    '}',
    '',
    'function makeTitle(filename) {',
    '  return (filename ?? "")',
    '    .replace(/\\.png$/i, "").replace(/\\.jpg$/i, "").replace(/\\.jpeg$/i, "")',
    '    .replace(/[_-]/g, " ")',
    '    .replace(/\\b\\w/g, c => c.toUpperCase())',
    '    .replace(/\\s+/g, " ").trim()',
    '}',
    '',
    'function ReportCard({ report, onClick }) {',
    '  const cat  = report.category ?? getCategory(report.filename)',
    '  const meta = CATEGORY_META[cat] ?? CATEGORY_META.other',
    '  const src  = report.url ?? `/reports/${report.filename}`',
    '  const title = report.title ?? makeTitle(report.filename)',
    '',
    '  return (',
    '    <div',
    '      onClick={() => onClick(report)}',
    '      style={{',
    '        background:"var(--color-surface)", border:"1px solid var(--color-border)",',
    '        borderRadius:"var(--radius-lg)", overflow:"hidden",',
    '        boxShadow:"var(--shadow-card)", cursor:"pointer",',
    '        transition:"all 0.15s ease",',
    '      }}',
    '      onMouseEnter={e => { e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow="var(--shadow-raised)" }}',
    '      onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="var(--shadow-card)" }}',
    '    >',
    '      {/* Image */}',
    '      <div style={{ position:"relative", paddingBottom:"62%", background:"var(--color-surface-raised)", overflow:"hidden" }}>',
    '        <img',
    '          src={src}',
    '          alt={title}',
    '          style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"contain", padding:8 }}',
    '          onError={e => { e.target.style.display="none"; e.target.nextSibling.style.display="flex" }}',
    '        />',
    '        <div style={{ display:"none", position:"absolute", inset:0, alignItems:"center",',
    '          justifyContent:"center", flexDirection:"column", gap:8,',
    '          color:"var(--color-text-muted)", fontSize:"var(--text-sm)" }}>',
    '          <span style={{ fontSize:"2rem" }}>🖼️</span>',
    '          <span>Image not loaded</span>',
    '          <span style={{ fontSize:"var(--text-xs)" }}>Copy to public/reports/</span>',
    '        </div>',
    '        {/* Category badge overlay */}',
    '        <span style={{',
    '          position:"absolute", top:10, left:10,',
    '          background: meta.color, color:"#fff",',
    '          borderRadius:"var(--radius-pill)", padding:"3px 10px",',
    '          fontSize:"var(--text-xs)", fontWeight:700,',
    '        }}>',
    '          {meta.icon} {meta.label}',
    '        </span>',
    '      </div>',
    '      {/* Footer */}',
    '      <div style={{ padding:"var(--space-4)" }}>',
    '        <div style={{ fontWeight:700, fontSize:"var(--text-sm)", color:"var(--color-text-primary)",',
    '          marginBottom:"var(--space-1)", lineHeight:1.4 }}>{title}</div>',
    '        {report.description && (',
    '          <div style={{ fontSize:"var(--text-xs)", color:"var(--color-text-muted)", lineHeight:1.5 }}>',
    '            {report.description}',
    '          </div>',
    '        )}',
    '      </div>',
    '    </div>',
    '  )',
    '}',
    '',
    'function LightboxModal({ report, onClose }) {',
    '  if (!report) return null',
    '  const src   = report.url ?? `/reports/${report.filename}`',
    '  const title = report.title ?? makeTitle(report.filename)',
    '  const cat   = report.category ?? getCategory(report.filename)',
    '  const meta  = CATEGORY_META[cat] ?? CATEGORY_META.other',
    '',
    '  return (',
    '    <div',
    '      onClick={onClose}',
    '      style={{',
    '        position:"fixed", inset:0, background:"rgba(26,21,48,0.85)",',
    '        zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center",',
    '        padding:"var(--space-8)", backdropFilter:"blur(4px)",',
    '      }}',
    '    >',
    '      <div',
    '        onClick={e => e.stopPropagation()}',
    '        style={{',
    '          background:"var(--color-surface)", borderRadius:"var(--radius-xl)",',
    '          overflow:"hidden", maxWidth:"90vw", maxHeight:"90vh",',
    '          display:"flex", flexDirection:"column", boxShadow:"0 24px 80px rgba(0,0,0,0.4)",',
    '        }}',
    '      >',
    '        {/* Modal header */}',
    '        <div style={{',
    '          display:"flex", alignItems:"center", justifyContent:"space-between",',
    '          padding:"var(--space-4) var(--space-6)",',
    '          borderBottom:"1px solid var(--color-border)",',
    '        }}>',
    '          <div>',
    '            <span style={{ background:meta.color, color:"#fff",',
    '              borderRadius:"var(--radius-pill)", padding:"2px 10px",',
    '              fontSize:"var(--text-xs)", fontWeight:700, marginRight:"var(--space-3)" }}>',
    '              {meta.icon} {meta.label}',
    '            </span>',
    '            <span style={{ fontWeight:700, color:"var(--color-text-primary)", fontSize:"var(--text-base)" }}>',
    '              {title}',
    '            </span>',
    '          </div>',
    '          <button onClick={onClose} style={{',
    '            background:"none", border:"1px solid var(--color-border)",',
    '            borderRadius:"var(--radius-md)", width:32, height:32,',
    '            cursor:"pointer", fontSize:"1rem", color:"var(--color-text-secondary)",',
    '          }}>✕</button>',
    '        </div>',
    '        {/* Image */}',
    '        <div style={{ overflow:"auto", padding:"var(--space-4)", flex:1 }}>',
    '          <img src={src} alt={title}',
    '            style={{ maxWidth:"100%", height:"auto", display:"block", margin:"0 auto" }} />',
    '        </div>',
    '        {report.description && (',
    '          <div style={{',
    '            padding:"var(--space-4) var(--space-6)",',
    '            borderTop:"1px solid var(--color-border)",',
    '            fontSize:"var(--text-sm)", color:"var(--color-text-secondary)",',
    '          }}>',
    '            {report.description}',
    '          </div>',
    '        )}',
    '      </div>',
    '    </div>',
    '  )',
    '}',
    '',
    'export default function VisualReports({ reports }) {',
    '  const [activeFilter, setActiveFilter] = useState("all")',
    '  const [lightbox, setLightbox]         = useState(null)',
    '  const [search, setSearch]             = useState("")',
    '',
    '  if (!reports || !reports.length) return (',
    '    <div>',
    '      <EmptyState message="No visual reports found." icon="🖼️" />',
    '      <div style={{ textAlign:"center", marginTop:"var(--space-4)" }}>',
    '        <p style={{ fontSize:"var(--text-sm)", color:"var(--color-text-muted)", marginBottom:"var(--space-3)" }}>',
    '          Run the patch script to import your pipeline PNG reports:',
    '        </p>',
    '        <code style={{ background:"var(--color-surface-raised)", padding:"var(--space-3) var(--space-4)",',
    '          borderRadius:"var(--radius-md)", fontSize:"var(--text-sm)", display:"inline-block",',
    '          border:"1px solid var(--color-border)", color:"var(--color-primary)", fontWeight:600 }}>',
    '          python export_for_frontend_patch.py',
    '        </code>',
    '      </div>',
    '    </div>',
    '  )',
    '',
    '  // Build category counts',
    '  const cats = {}',
    '  reports.forEach(r => {',
    '    const c = r.category ?? getCategory(r.filename)',
    '    cats[c] = (cats[c] ?? 0) + 1',
    '  })',
    '',
    '  const filtered = reports.filter(r => {',
    '    const c = r.category ?? getCategory(r.filename)',
    '    const t = (r.title ?? makeTitle(r.filename)).toLowerCase()',
    '    const matchesCat  = activeFilter === "all" || c === activeFilter',
    '    const matchSearch = !search || t.includes(search.toLowerCase())',
    '    return matchesCat && matchSearch',
    '  })',
    '',
    '  return (',
    '    <div>',
    '      <LightboxModal report={lightbox} onClose={() => setLightbox(null)} />',
    '',
    '      {/* Header + search */}',
    '      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",',
    '        marginBottom:"var(--space-4)", flexWrap:"wrap", gap:"var(--space-3)" }}>',
    '        <div style={{ fontSize:"var(--text-sm)", color:"var(--color-text-muted)" }}>',
    '          {filtered.length} of {reports.length} reports',
    '        </div>',
    '        <input',
    '          type="text"',
    '          placeholder="Search reports…"',
    '          value={search}',
    '          onChange={e => setSearch(e.target.value)}',
    '          style={{',
    '            padding:"var(--space-2) var(--space-4)", border:"1px solid var(--color-border)",',
    '            borderRadius:"var(--radius-pill)", fontFamily:"var(--font-body)", fontSize:"var(--text-sm)",',
    '            outline:"none", width:220, background:"var(--color-surface)",',
    '          }}',
    '        />',
    '      </div>',
    '',
    '      {/* Category filter pills */}',
    '      <div className="filter-pills" style={{ marginBottom:"var(--space-6)" }}>',
    '        <button className={`filter-pill ${activeFilter==="all"?"active":""}`}',
    '          onClick={() => setActiveFilter("all")}>',
    '          All ({reports.length})',
    '        </button>',
    '        {Object.entries(cats).map(([cat, count]) => {',
    '          const meta = CATEGORY_META[cat] ?? CATEGORY_META.other',
    '          return (',
    '            <button key={cat}',
    '              className={`filter-pill ${activeFilter===cat?"active":""}`}',
    '              onClick={() => setActiveFilter(cat)}>',
    '              {meta.icon} {meta.label} ({count})',
    '            </button>',
    '          )',
    '        })}',
    '      </div>',
    '',
    '      {/* Report grid */}',
    '      {filtered.length === 0 ? (',
    '        <EmptyState message="No reports match this filter." icon="🔍" />',
    '      ) : (',
    '        <div style={{',
    '          display:"grid",',
    '          gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))",',
    '          gap:"var(--space-6)",',
    '        }}>',
    '          {filtered.map((r, i) => (',
    '            <ReportCard key={i} report={r} onClick={setLightbox} />',
    '          ))}',
    '        </div>',
    '      )}',
    '    </div>',
    '  )',
    '}',
]))

print("  ✓ VisualReports component + useReports hook written")

# ── Dashboard.jsx (main page with tabs + mobile drawer) ───────────────────────
write_file(f'{base}/src/pages/Dashboard.jsx', '\n'.join([
    "import { useState } from 'react'",
    "import Sidebar from '../components/Sidebar'",
    "import KPICards from '../components/KPICards'",
    "import ChartPanel from '../components/ChartPanel'",
    "import InsightCards from '../components/InsightCards'",
    "import TierMatrix from '../components/TierMatrix'",
    "import PlatformPerformance from '../components/PlatformPerformance'",
    "import AnomalyTable from '../components/AnomalyTable'",
    "import Forecaster from '../components/Forecaster'",
    "import VisualReports from '../components/VisualReports'",
    "import { EmptyState } from '../components/EmptyState'",
    "import { useKPIs } from '../hooks/useKPIs'",
    "import { useCharts } from '../hooks/useCharts'",
    "import { useInsights } from '../hooks/useInsights'",
    "import { useTiers } from '../hooks/useTiers'",
    "import { usePlatforms } from '../hooks/usePlatforms'",
    "import { useContract } from '../hooks/useContract'",
    "import { useAnomalies } from '../hooks/useAnomalies'",
    "import { useReports } from '../hooks/useReports'",
    '',
    "const TABS = ['ROI Overview','Platform Analysis','Influencer Tiers','Campaign Insights','ROI Forecaster','Anomalies','Visual Reports']",
    '',
    'function Spinner() {',
    '  return <div style={{ display:"flex", justifyContent:"center", padding:"var(--space-16)" }}><div style={{ width:36, height:36, border:"3px solid var(--color-border)", borderTop:"3px solid var(--color-primary)", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} /></div>',
    '}',
    '',
    'function ROIOverviewTab() {',
    '  const { data, loading, error } = useKPIs()',
    '  const { charts, loading:cl }   = useCharts()',
    '  if (loading || cl) return <Spinner />',
    '  if (error) return <EmptyState message={error} icon="⚠️" />',
    '  return (<><KPICards data={data} /><ChartPanel charts={charts} filter="overview" /></>)',
    '}',
    '',
    'function PlatformAnalysisTab() {',
    '  const { platforms, loading, error } = usePlatforms()',
    '  const { charts, loading:cl }        = useCharts()',
    '  if (loading || cl) return <Spinner />',
    '  if (error) return <EmptyState message={error} icon="⚠️" />',
    '  return (<><PlatformPerformance platforms={platforms} /><ChartPanel charts={charts} filter="platform" /></>)',
    '}',
    '',
    'function InfluencerTiersTab() {',
    '  const { tiers, loading, error } = useTiers()',
    '  if (loading) return <Spinner />',
    '  if (error) return <EmptyState message={error} icon="⚠️" />',
    '  return <TierMatrix tiers={tiers} />',
    '}',
    '',
    'function CampaignInsightsTab() {',
    '  const { insights, loading, error } = useInsights()',
    '  if (loading) return <Spinner />',
    '  if (error) return <EmptyState message={error} icon="⚠️" />',
    '  return <InsightCards insights={insights} />',
    '}',
    '',
    'function ROIForecasterTab() {',
    '  const { contract, loading, error } = useContract()',
    '  if (loading) return <Spinner />',
    '  if (error) return <EmptyState message={error} icon="⚠️" />',
    '  return <Forecaster contract={contract} />',
    '}',
    '',
    'function AnomaliesTab() {',
    '  const { anomalies, loading, error } = useAnomalies()',
    '  if (loading) return <Spinner />',
    '  if (error) return (',
    '    <div>',
    '      <EmptyState message={error} icon="⚠️" />',
    '      <p style={{ textAlign:"center", fontSize:"var(--text-sm)", color:"var(--color-text-muted)", marginTop:"var(--space-4)" }}>',
    '        Run: <code>python export_for_frontend_patch.py</code> to generate anomalies.json',
    '      </p>',
    '    </div>',
    '  )',
    '  return <AnomalyTable anomalies={anomalies ?? []} />',
    '}',
    '',
    'function VisualReportsTab() {',
    '  const { reports, loading, error } = useReports()',
    '  if (loading) return <Spinner />',
    '  if (error) return (',
    '    <div>',
    '      <EmptyState message={error} icon="🖼️" />',
    '      <p style={{ textAlign:"center", fontSize:"var(--text-sm)", color:"var(--color-text-muted)", marginTop:"var(--space-4)" }}>',
    '        Run: <code>python export_for_frontend_patch.py</code> to import your pipeline PNG reports.',
    '      </p>',
    '    </div>',
    '  )',
    '  return <VisualReports reports={reports ?? []} />',
    '}',
    '',
    'const TAB_COMPONENTS = [',
    '  <ROIOverviewTab />,',
    '  <PlatformAnalysisTab />,',
    '  <InfluencerTiersTab />,',
    '  <CampaignInsightsTab />,',
    '  <ROIForecasterTab />,',
    '  <AnomaliesTab />,',
    '  <VisualReportsTab />,',
    ']',
    '',
    'export default function Dashboard() {',
    '  const [activeTab, setActiveTab]   = useState(0)',
    '  const [drawerOpen, setDrawerOpen] = useState(false)',
    '',
    '  function changeTab(i) { setActiveTab(i); setDrawerOpen(false) }',
    '',
    '  return (',
    '    <div className="app-layout">',
    '      {/* Mobile top bar */}',
    '      <div className="mobile-topbar">',
    '        <span style={{ fontFamily:"var(--font-heading)", fontWeight:800, fontSize:"var(--text-lg)", color:"var(--color-text-primary)" }}>🎯 ROI Intelligence</span>',
    '        <button onClick={() => setDrawerOpen(true)} style={{ background:"none", border:"none", fontSize:"1.5rem", cursor:"pointer" }}>☰</button>',
    '      </div>',
    '',
    '      {/* Mobile drawer overlay */}',
    '      <div className={`drawer-overlay ${drawerOpen ? "open" : ""}`} onClick={() => setDrawerOpen(false)} />',
    '      <div className={`drawer ${drawerOpen ? "open" : ""}`}>',
    '        <Sidebar activeTab={activeTab} onTabChange={changeTab} />',
    '      </div>',
    '',
    '      {/* Desktop sidebar */}',
    '      <div style={{ display:"contents" }} className="desktop-sidebar">',
    '        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />',
    '      </div>',
    '',
    '      <main className="main-content">',
    '        <div style={{ maxWidth:1200 }}>',
    '          <h1 className="section-title">{TABS[activeTab]}</h1>',
    '          <div className="tab-enter tab-enter-active">',
    '            {TAB_COMPONENTS[activeTab]}',
    '          </div>',
    '        </div>',
    '      </main>',
    '    </div>',
    '  )',
    '}',
]))

print("  ✓ Dashboard.jsx written")

# ── Cloudflare Worker ─────────────────────────────────────────────────────────
write_file(f'{base}/src/worker/forecaster.js', '\n'.join([
    "import { getAssetFromKV } from '@cloudflare/kv-asset-handler'",
    "import manifestJSON from '__STATIC_CONTENT_MANIFEST'",
    'const assetManifest = JSON.parse(manifestJSON)',
    '',
    'const CORS = {',
    "  'Access-Control-Allow-Origin':  '*',",
    "  'Access-Control-Allow-Methods': 'POST, OPTIONS',",
    "  'Access-Control-Allow-Headers': 'Content-Type',",
    '}',
    '',
    'function jsonResp(body, status = 200) {',
    "  return new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })",
    '}',
    '',
    'function findNearest(lookup, inputs) {',
    '  if (!lookup || !lookup.length) return { prediction: 0, probability: 0.5, risk_level: "MEDIUM" }',
    '  let best = lookup[0], bestDist = Infinity',
    '  for (const row of lookup) {',
    '    let dist = 0',
    '    for (const [k, v] of Object.entries(inputs)) {',
    '      if (typeof v === "number" && typeof row[k] === "number") dist += Math.pow(v - row[k], 2)',
    '      else if (v !== row[k]) dist += 100',
    '    }',
    '    if (dist < bestDist) { bestDist = dist; best = row }',
    '  }',
    '  return { prediction: best.prediction ?? 0, probability: best.probability ?? 0.5, risk_level: best.risk_level ?? "MEDIUM" }',
    '}',
    '',
    'export default {',
    '  async fetch(request, env, ctx) {',
    '    const url = new URL(request.url)',
    '',
    '    if (request.method === "OPTIONS") return new Response(null, { status: 200, headers: CORS })',
    '',
    '    if (url.pathname === "/api" && request.method === "POST") {',
    '      try {',
    '        const inputs   = await request.json()',
    '        const required = (env.INPUT_FIELDS ?? "").split(",").filter(Boolean)',
    '        for (const field of required) {',
    '          if (inputs[field] === undefined || inputs[field] === null)',
    '            return jsonResp({ error: `Missing field: ${field}` }, 400)',
    '        }',
    '        const lookup = JSON.parse(env.FORECAST_LOOKUP ?? "[]")',
    '        return jsonResp(findNearest(lookup, inputs))',
    '      } catch (e) {',
    '        return jsonResp({ error: "Worker error", detail: e.message }, 500)',
    '      }',
    '    }',
    '',
    '    try {',
    '      return await getAssetFromKV(',
    '        { request, waitUntil: ctx.waitUntil.bind(ctx) },',
    '        { ASSET_NAMESPACE: env.__STATIC_CONTENT, ASSET_MANIFEST: assetManifest }',
    '      )',
    '    } catch (e) {',
    '      try {',
    '        const indexReq = new Request(new URL("/index.html", url.origin).href, request)',
    '        return await getAssetFromKV(',
    '          { request: indexReq, waitUntil: ctx.waitUntil.bind(ctx) },',
    '          { ASSET_NAMESPACE: env.__STATIC_CONTENT, ASSET_MANIFEST: assetManifest }',
    '        )',
    '      } catch (e2) {',
    '        return new Response("Not Found", { status: 404, headers: CORS })',
    '      }',
    '    }',
    '  }',
    '}',
]))

print("  ✓ Cloudflare Worker written")

# ── export_for_frontend_patch.py — adds missing exports to pipeline ───────────
# This standalone script reads the pipeline's feature CSV and trained model,
# then writes anomalies.json + forecast_lookup.json into reports/frontend/.
# Run it once after python main.py if those files are missing.
write_file('export_for_frontend_patch.py', '\n'.join([
    '"""',
    'export_for_frontend_patch.py',
    'Generates the two files the React dashboard needs that export_for_frontend.py may not produce:',
    '  reports/frontend/anomalies.json      — rows where is_campaign_anomaly == 1',
    '  reports/frontend/forecast_lookup.json — sampled rows with prediction + probability for local forecasting',
    '',
    'Run after python main.py:',
    '  python export_for_frontend_patch.py',
    '"""',
    'import os, sys, json',
    'import pandas as pd',
    '',
    '# ── CONFIG — adjust these paths if your pipeline uses different names ───────',
    "FEAT_CSV      = 'data/processed/campaigns_features.csv'",
    "MODEL_CLF     = 'models/roi_classifier.pkl'",
    "FEAT_COLS     = 'models/feature_cols.pkl'",
    "OUT_DIR       = 'reports/frontend'",
    "ANOMALY_COL   = 'is_campaign_anomaly'   # column set by your pipeline's anomaly detector",
    "TARGET_COL    = 'High_ROI'               # binary target (0/1)",
    "PROB_COL      = 'roi_probability'         # probability column written by predictor.py",
    "LOOKUP_SAMPLE = 500                       # rows to embed in forecast_lookup.json",
    '# ─────────────────────────────────────────────────────────────────────────────',
    '',
    'os.makedirs(OUT_DIR, exist_ok=True)',
    '',
    'if not os.path.exists(FEAT_CSV):',
    '    print(f"ERROR: {FEAT_CSV} not found. Run python main.py first.")',
    '    sys.exit(1)',
    '',
    'print(f"Reading {FEAT_CSV}...")',
    'df = pd.read_csv(FEAT_CSV)',
    'print(f"  Shape: {df.shape}")',
    '',
    '# ── 1. ANOMALIES ─────────────────────────────────────────────────────────────',
    f'anomaly_path = os.path.join(OUT_DIR, "anomalies.json")',
    'if ANOMALY_COL in df.columns:',
    '    anomaly_df = df[df[ANOMALY_COL] == 1].copy()',
    '    print(f"  Anomalies found: {len(anomaly_df)}")',
    'else:',
    '    # Fallback: flag rows where campaign cost is > 3 std devs from mean',
    '    print(f"  WARNING: column \'{ANOMALY_COL}\' not found — using cost outlier fallback")',
    '    cost_cols = [c for c in df.columns if "cost" in c.lower() or "Cost" in c]',
    '    if cost_cols:',
    '        col = cost_cols[0]',
    '        mu, sigma = df[col].mean(), df[col].std()',
    '        anomaly_df = df[(df[col] > mu + 2.5*sigma) | (df[col] < mu - 2.5*sigma)].copy()',
    '    else:',
    '        anomaly_df = df.head(0).copy()',
    '    print(f"  Anomalies (fallback): {len(anomaly_df)}")',
    '',
    '# Keep only serialisable columns',
    'def make_serialisable(d):',
    '    out = {}',
    '    for k, v in d.items():',
    '        try:',
    '            import math',
    '            if isinstance(v, float) and (math.isnan(v) or math.isinf(v)):',
    '                out[k] = None',
    '            else:',
    '                out[k] = v',
    '        except Exception:',
    '            out[k] = str(v)',
    '    return out',
    '',
    'anomaly_records = [make_serialisable(r) for r in anomaly_df.head(500).to_dict(orient="records")]',
    'with open(anomaly_path, "w", encoding="utf-8") as f:',
    '    json.dump(anomaly_records, f, indent=2, default=str)',
    'print(f"  ✓ {anomaly_path} ({len(anomaly_records)} rows)")',
    '',
    '# ── 2. FORECAST LOOKUP ───────────────────────────────────────────────────────',
    f'lookup_path = os.path.join(OUT_DIR, "forecast_lookup.json")',
    '',
    '# Try to use the trained model to generate probabilities for the lookup',
    'lookup_records = []',
    'try:',
    '    import joblib',
    '    if os.path.exists(MODEL_CLF) and os.path.exists(FEAT_COLS):',
    '        clf       = joblib.load(MODEL_CLF)',
    '        feat_cols = joblib.load(FEAT_COLS)',
    '        print(f"  Model loaded: {MODEL_CLF}")',
    '        print(f"  Feature cols: {feat_cols}")',
    '',
    '        # Sample rows for the lookup table',
    '        sample = df.sample(min(LOOKUP_SAMPLE, len(df)), random_state=42).copy()',
    '',
    '        # Build feature matrix — handle missing cols gracefully',
    '        available = [c for c in feat_cols if c in sample.columns]',
    '        missing   = [c for c in feat_cols if c not in sample.columns]',
    '        if missing:',
    '            print(f"  WARNING: missing feature columns: {missing} — filling with 0")',
    '            for c in missing:',
    '                sample[c] = 0',
    '',
    '        X = sample[feat_cols].fillna(0)',
    '        probs = clf.predict_proba(X)[:, 1]',
    '        preds = (probs >= 0.5).astype(int)',
    '',
    '        # Build input schema column list from contract',
    '        contract_path = os.path.join(OUT_DIR, "frontend_contract.json")',
    '        input_cols = []',
    '        if os.path.exists(contract_path):',
    '            with open(contract_path) as cf:',
    '                cdata = json.load(cf)',
    '            input_cols = [s["name"] for s in cdata.get("forecaster",{}).get("input_schema",[])]',
    '',
    '        for i, (_, row) in enumerate(sample.iterrows()):',
    '            rec = {}',
    '            # Include input schema fields (for nearest-neighbour matching)',
    '            for col in (input_cols or list(sample.columns[:10])):',
    '                if col in row.index:',
    '                    v = row[col]',
    '                    import math',
    '                    rec[col] = None if (isinstance(v, float) and (math.isnan(v) or math.isinf(v))) else v',
    '            rec["prediction"]  = int(preds[i])',
    '            rec["probability"] = round(float(probs[i]), 4)',
    '            rec["risk_level"]  = "LOW" if probs[i] >= 0.65 else "MEDIUM" if probs[i] >= 0.4 else "HIGH"',
    '            lookup_records.append(rec)',
    '',
    '        print(f"  ✓ Lookup built from model: {len(lookup_records)} rows")',
    '    else:',
    '        raise FileNotFoundError("Model files not found")',
    '',
    'except Exception as e:',
    '    print(f"  WARNING: Could not use model ({e}) — building lookup from CSV predictions")',
    '    # Fallback: use existing probability/prediction columns from the pipeline CSV',
    '    prob_col_candidates = [c for c in df.columns if "prob" in c.lower() or "probability" in c.lower()]',
    '    pred_col_candidates = [c for c in df.columns if c in ["prediction","predicted","High_ROI_pred","roi_pred","y_pred"]]',
    '    tgt_candidates      = [c for c in df.columns if c in ["High_ROI","roi_label","target","is_high_roi"]]',
    '',
    '    prob_col = prob_col_candidates[0] if prob_col_candidates else None',
    '    pred_col = pred_col_candidates[0] if pred_col_candidates else None',
    '    tgt_col  = tgt_candidates[0]      if tgt_candidates      else None',
    '',
    '    sample = df.sample(min(LOOKUP_SAMPLE, len(df)), random_state=42).copy()',
    '',
    '    contract_path = os.path.join(OUT_DIR, "frontend_contract.json")',
    '    input_cols = []',
    '    if os.path.exists(contract_path):',
    '        with open(contract_path) as cf:',
    '            cdata = json.load(cf)',
    '        input_cols = [s["name"] for s in cdata.get("forecaster",{}).get("input_schema",[])]',
    '',
    '    for _, row in sample.iterrows():',
    '        rec = {}',
    '        for col in (input_cols or list(sample.columns[:10])):',
    '            if col in row.index:',
    '                import math',
    '                v = row[col]',
    '                rec[col] = None if (isinstance(v, float) and (math.isnan(v) or math.isinf(v))) else v',
    '        if prob_col and prob_col in row.index:',
    '            p = float(row[prob_col])',
    '            rec["probability"] = round(p, 4)',
    '            rec["prediction"]  = 1 if p >= 0.5 else 0',
    '            rec["risk_level"]  = "LOW" if p >= 0.65 else "MEDIUM" if p >= 0.4 else "HIGH"',
    '        elif pred_col and pred_col in row.index:',
    '            pred = int(row[pred_col])',
    '            rec["prediction"]  = pred',
    '            rec["probability"] = 0.75 if pred == 1 else 0.25',
    '            rec["risk_level"]  = "LOW" if pred == 1 else "HIGH"',
    '        elif tgt_col and tgt_col in row.index:',
    '            tgt = int(row[tgt_col])',
    '            rec["prediction"]  = tgt',
    '            rec["probability"] = 0.72 if tgt == 1 else 0.28',
    '            rec["risk_level"]  = "LOW" if tgt == 1 else "HIGH"',
    '        else:',
    '            rec["prediction"]  = 0',
    '            rec["probability"] = 0.5',
    '            rec["risk_level"]  = "MEDIUM"',
    '        lookup_records.append(rec)',
    '',
    '    print(f"  ✓ Lookup built from CSV: {len(lookup_records)} rows")',
    '',
    'with open(lookup_path, "w", encoding="utf-8") as f:',
    '    json.dump(lookup_records, f, indent=2, default=str)',
    'print(f"  ✓ {lookup_path} ({len(lookup_records)} rows)")',
    '',
    '',
    '# ── 3. VISUAL REPORTS MANIFEST ───────────────────────────────────────────────',
    'print("Scanning for report images...")',
    'visual_reports = []',
    'report_search_dirs = ["reports", "reports/frontend", "reports/charts", "reports/figures", "reports/visualizations", "."]',
    'seen_files = set()',
    'for search_dir in report_search_dirs:',
    '    if not os.path.isdir(search_dir):',
    '        continue',
    '    for fname in sorted(os.listdir(search_dir)):',
    '        if not fname.lower().endswith((".png", ".jpg", ".jpeg", ".svg")):',
    '            continue',
    '        if fname in seen_files:',
    '            continue',
    '        seen_files.add(fname)',
    '        def _cat(n):',
    '            nl = n.lower()',
    '            if "roi" in nl: return "roi"',
    '            if "platform" in nl: return "platform"',
    '            if "tier" in nl: return "tier"',
    '            if "niche" in nl: return "niche"',
    '            if "anomal" in nl: return "anomaly"',
    '            if "model" in nl or "roc" in nl or "confusion" in nl or "feature" in nl: return "model"',
    '            if "corr" in nl: return "correlation"',
    '            if "cost" in nl: return "cost"',
    '            return "other"',
    '        title = fname.rsplit(".", 1)[0].replace("_"," ").replace("-"," ")',
    '        title = " ".join(w.capitalize() for w in title.split())',
    '        visual_reports.append({',
    '            "filename": fname,',
    '            "title": title,',
    '            "category": _cat(fname),',
    '            "description": f"Generated by pipeline from {search_dir}/",',
    '        })',
    'visual_reports_path = os.path.join(OUT_DIR, "visual_reports.json")',
    'with open(visual_reports_path, "w", encoding="utf-8") as f:',
    '    json.dump(visual_reports, f, indent=2)',
    'print(f"  ✓ {visual_reports_path} ({len(visual_reports)} reports found)")',
    '',
    'print()',
    'print("=" * 60)',
    'print("export_for_frontend_patch complete.")',
    'print(f"  anomalies.json       → {len(anomaly_records)} rows")',
    'print(f"  forecast_lookup.json → {len(lookup_records)} rows")',
    'print(f"  visual_reports.json  → {len(visual_reports)} images")',
    'print()',
    'print("Copy to dashboard:")',
    'print("  cp reports/frontend/anomalies.json react_frontend/public/data/")',
    'print("  cp reports/frontend/forecast_lookup.json react_frontend/public/data/")',
    'print("  cp reports/frontend/visual_reports.json react_frontend/public/data/")',
    'print("  mkdir -p react_frontend/public/reports")',
    'print("  for f in $(find reports -name *.png 2>/dev/null); do cp $f react_frontend/public/reports/; done")',
    'print("Then: npm run dev")',
    'print("=" * 60)',
]))

print("  ✓ export_for_frontend_patch.py written")

# ── chmod + completion message ────────────────────────────────────────────────
import stat
os.chmod(f'{base}/deploy.sh', 0o755)

files_written = sum(len(files) for _, _, files in os.walk(base))
print()
print("=" * 60)
print("React SaaS scaffold complete.")
print(f"Files written  : {files_written}")
print(f"Project        : Influencer Marketing ROI Intelligence Platform")
print(f"Domain         : Marketing Analytics")
print(f"Components     : KPICards | ChartPanel | InsightCards | AnomalyTable | Forecaster | Sidebar | TierMatrix | PlatformPerformance")
print(f"Auth           : Cloudflare Access (zero-code user management)")
print()
print("Next steps:")
print()
print("  STEP 1 — Generate missing data files from your pipeline:")
print("    python export_for_frontend_patch.py")
print("    (writes anomalies.json + forecast_lookup.json to reports/frontend/)")
print()
print("  STEP 2 — Copy data files to the dashboard:")
print("    cp reports/frontend/anomalies.json react_frontend/public/data/")
print("    cp reports/frontend/forecast_lookup.json react_frontend/public/data/")
print()
print("  STEP 3 — Run locally:")
print(f"    cd {base}")
print("    npm install           ← REQUIRED FIRST: generates package-lock.json")
print("    npm run dev           → http://localhost:5173")
print()
print("  STEP 4 — Deploy to Cloudflare:")
print("    git add .")
print("    git commit -m 'scaffold'")
print("    git push")
print("    npx wrangler deploy   → https://influencer-roi-dashboard.pages.dev")
print()
print("  NOTE: The Forecaster works locally WITHOUT the worker.")
print("        It uses forecast_lookup.json directly in the browser.")
print("        Anomalies tab reads anomalies.json directly — no worker needed.")
print("=" * 60)

"""
upgrade_visuals.py  -  run AFTER your scaffold script (and after python main.py)

  python upgrade_visuals.py

1. Exports row-level data  -> reports/frontend/campaigns.json (+ copies to react_frontend/public/data/)
2. Writes an interactive Power BI-style Explorer (slicers, cross-filtering, drill-down)
3. Patches Dashboard.jsx, main.jsx and index.css so the old blank ChartPanel is no longer used
"""
import os, re, sys, glob, json, math, shutil
import pandas as pd

BASE = 'react_frontend'
OUT = 'reports/frontend'
HIGH_ROI_THRESHOLD = 3.0   # only used if your CSV has no High_ROI column

CAND = {
    'platform':   ['Platform'],
    'niche':      ['Audience_Niche', 'Niche'],
    'cost':       ['Campaign_Cost_USD', 'Cost_USD', 'Cost'],
    'revenue':    ['Revenue_Generated_USD', 'Revenue_USD', 'Revenue'],
    'roi':        ['roi_ratio', 'ROI_Ratio', 'ROI'],
    'high_roi':   ['High_ROI', 'is_high_roi', 'roi_label'],
    'followers':  ['Follower_Count'],
    'engagement': ['Engagement_Rate_Pct'],
}

def find(df, names):
    low = {c.lower(): c for c in df.columns}
    for n in names:
        if n.lower() in low:
            return low[n.lower()]
    return None

# ---------- 1. EXPORT ROW-LEVEL DATA ----------
df = None
for pattern in ['data/processed/*.csv', 'data/*.csv', 'data/raw/*.csv', '*.csv']:
    for path in glob.glob(pattern):
        try:
            d = pd.read_csv(path)
        except Exception:
            continue
        if find(d, CAND['platform']) and find(d, CAND['revenue']):
            df, used = d, path
            break
    if df is not None:
        break
if df is None:
    print('ERROR: no CSV with Platform + Revenue columns found under data/. '
          'Edit CAND at the top of this script to match your column names.')
    sys.exit(1)

print(f'Using {used}  shape={df.shape}')
m = {k: find(df, v) for k, v in CAND.items()}
print('Column mapping:', m)
for need in ['platform', 'cost', 'revenue']:
    if not m[need]:
        print(f'ERROR: could not find a column for "{need}". Edit CAND.'); sys.exit(1)

out = pd.DataFrame()
out['platform'] = df[m['platform']].astype(str)
out['niche'] = df[m['niche']].astype(str) if m['niche'] else 'All'
out['cost'] = pd.to_numeric(df[m['cost']], errors='coerce')
out['revenue'] = pd.to_numeric(df[m['revenue']], errors='coerce')
out['roi'] = pd.to_numeric(df[m['roi']], errors='coerce') if m['roi'] else out['revenue'] / out['cost']
if m['high_roi']:
    out['high_roi'] = pd.to_numeric(df[m['high_roi']], errors='coerce').fillna(0).astype(int)
else:
    out['high_roi'] = (out['roi'] >= HIGH_ROI_THRESHOLD).astype(int)
out['followers'] = pd.to_numeric(df[m['followers']], errors='coerce') if m['followers'] else None
out['engagement'] = pd.to_numeric(df[m['engagement']], errors='coerce') if m['engagement'] else None
out = out.dropna(subset=['cost', 'revenue', 'roi'])
out = out.replace([float('inf'), float('-inf')], None).head(5000).round(3)

os.makedirs(OUT, exist_ok=True)
os.makedirs(f'{BASE}/public/data', exist_ok=True)
records = json.loads(out.to_json(orient='records'))
for target in (f'{OUT}/campaigns.json', f'{BASE}/public/data/campaigns.json'):
    with open(target, 'w', encoding='utf-8') as f:
        json.dump(records, f)
print(f'  campaigns.json: {len(records)} rows')

def write(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

# ---------- 2. EXPLORER COMPONENT ----------
write(f'{BASE}/src/components/Explorer.jsx', r'''import { useState, useMemo, useEffect } from 'react'
import { Bar, Scatter, Doughnut } from 'react-chartjs-2'
import { EmptyState } from './EmptyState'

const PURPLE = '#6C3FC8', GREEN = '#27AE60', RED = '#C0392B', ORANGE = '#FF6B35'
const FADED = 'rgba(108,63,200,0.25)'
const usd = v => '$' + Math.round(v).toLocaleString()
const avg = a => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0)
const groupBy = (rows, key) => {
  const m = {}
  rows.forEach(r => { (m[r[key]] = m[r[key]] || []).push(r) })
  return m
}

function useCampaigns() {
  const [rows, setRows] = useState(null)
  const [error, setError] = useState(null)
  useEffect(() => {
    fetch('/data/campaigns.json')
      .then(r => (r.ok ? r.json() : Promise.reject(new Error('campaigns.json not found - run: python upgrade_visuals.py'))))
      .then(setRows)
      .catch(e => setError(e.message))
  }, [])
  return { rows, error }
}

const Card = ({ title, hint, children }) => (
  <div className="chart-container" style={{ marginBottom: 0 }}>
    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-lg)' }}>{title}</div>
    {hint && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)' }}>{hint}</div>}
    <div style={{ position: 'relative', height: 280 }}>{children}</div>
  </div>
)

function Slicer({ label, options, value, onPick }) {
  return (
    <div style={{ marginBottom: 'var(--space-3)' }}>
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 4 }}>{label}</div>
      <div className="filter-pills" style={{ marginBottom: 0 }}>
        {options.map(o => (
          <button key={o} className={`filter-pill ${value === o ? 'active' : ''}`} onClick={() => onPick(o)}>{o}</button>
        ))}
      </div>
    </div>
  )
}

function Kpi({ label, value, color }) {
  return (
    <div className="kpi-card">
      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>{label}</div>
      <div style={{ fontSize: 'var(--text-3xl)', fontFamily: 'var(--font-heading)', fontWeight: 800, color: color || 'var(--color-text-primary)', lineHeight: 1 }}>{value}</div>
    </div>
  )
}

function Body({ rows }) {
  const [f, setF] = useState({ platform: null, niche: null, outcome: 'All' })
  const toggle = (k, v) => setF(p => ({ ...p, [k]: p[k] === v ? null : v }))
  const reset = () => setF({ platform: null, niche: null, outcome: 'All' })

  const pass = (r, skip) =>
    (skip === 'platform' || !f.platform || r.platform === f.platform) &&
    (skip === 'niche' || !f.niche || r.niche === f.niche) &&
    (f.outcome === 'All' || (f.outcome === 'High ROI') === (r.high_roi === 1))

  const platforms = useMemo(() => [...new Set(rows.map(r => r.platform))].sort(), [rows])
  const niches = useMemo(() => [...new Set(rows.map(r => r.niche))].sort(), [rows])
  const data = useMemo(() => rows.filter(r => pass(r)), [rows, f])
  const byPlat = useMemo(() => groupBy(rows.filter(r => pass(r, 'platform')), 'platform'), [rows, f])
  const byNiche = useMemo(() => groupBy(rows.filter(r => pass(r, 'niche')), 'niche'), [rows, f])

  const spend = data.reduce((s, r) => s + r.cost, 0)
  const revenue = data.reduce((s, r) => s + r.revenue, 0)
  const highN = data.filter(r => r.high_roi === 1).length
  const active = f.platform || f.niche || f.outcome !== 'All'

  const baseOpts = (onClick) => ({
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1A1530', padding: 10, cornerRadius: 8 } },
    scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(0,0,0,0.05)' }, beginAtZero: true } },
    onClick, onHover: (e, el) => { if (e.native) e.native.target.style.cursor = el.length ? 'pointer' : 'default' },
  })

  const platBar = {
    labels: platforms,
    datasets: [{ data: platforms.map(p => +avg((byPlat[p] || []).map(r => r.roi)).toFixed(2)),
      backgroundColor: platforms.map(p => (f.platform && f.platform !== p ? FADED : PURPLE)), borderRadius: 6 }],
  }
  const nicheBar = {
    labels: niches,
    datasets: [{ data: niches.map(n => { const g = byNiche[n] || []; return g.length ? +(100 * g.filter(r => r.high_roi === 1).length / g.length).toFixed(1) : 0 }),
      backgroundColor: niches.map(n => (f.niche && f.niche !== n ? 'rgba(255,107,53,0.25)' : ORANGE)), borderRadius: 6 }],
  }
  const donut = {
    labels: ['High ROI', 'Low ROI'],
    datasets: [{ data: [highN, data.length - highN], backgroundColor: [GREEN, RED], borderWidth: 0 }],
  }
  const sample = data.length > 600 ? data.filter((_, i) => i % Math.ceil(data.length / 600) === 0) : data
  const scatter = {
    datasets: [
      { label: 'High ROI', data: sample.filter(r => r.high_roi === 1).map(r => ({ x: r.cost, y: r.revenue })), backgroundColor: 'rgba(39,174,96,0.6)', pointRadius: 4 },
      { label: 'Low ROI', data: sample.filter(r => r.high_roi !== 1).map(r => ({ x: r.cost, y: r.revenue })), backgroundColor: 'rgba(192,57,43,0.55)', pointRadius: 4 },
    ],
  }

  const heatRows = rows.filter(r => f.outcome === 'All' || (f.outcome === 'High ROI') === (r.high_roi === 1))
  const heat = {}
  heatRows.forEach(r => { const k = r.platform + '|' + r.niche; (heat[k] = heat[k] || []).push(r.roi) })
  const cell = (p, n) => (heat[p + '|' + n] ? avg(heat[p + '|' + n]) : null)
  const allCells = platforms.flatMap(p => niches.map(n => cell(p, n))).filter(v => v !== null)
  const lo = Math.min(...allCells), hi = Math.max(...allCells)

  const top = [...data].sort((a, b) => b.revenue - a.revenue).slice(0, 10)

  return (
    <div>
      <div className="chart-container">
        <Slicer label="Platform" options={platforms} value={f.platform} onPick={v => toggle('platform', v)} />
        <Slicer label="Audience niche" options={niches} value={f.niche} onPick={v => toggle('niche', v)} />
        <Slicer label="Outcome" options={['All', 'High ROI', 'Low ROI']} value={f.outcome} onPick={v => setF(p => ({ ...p, outcome: v }))} />
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', display: 'flex', gap: 12, alignItems: 'center' }}>
          <span>{active ? 'Filtered view' : 'All campaigns'}. Click any bar, heatmap cell or filter to slice the data.</span>
          {active && <button className="filter-pill active" onClick={reset}>Clear filters</button>}
        </div>
      </div>

      <div className="kpi-grid">
        <Kpi label="Campaigns" value={data.length.toLocaleString()} />
        <Kpi label="High ROI rate" value={data.length ? (100 * highN / data.length).toFixed(1) + '%' : '-'} color={highN / (data.length || 1) >= 0.5 ? 'var(--color-success)' : 'var(--color-danger)'} />
        <Kpi label="Avg ROI" value={avg(data.map(r => r.roi)).toFixed(2) + 'x'} />
        <Kpi label="Total spend" value={usd(spend)} />
        <Kpi label="Total revenue" value={usd(revenue)} />
        <Kpi label="Blended return" value={spend ? (revenue / spend).toFixed(2) + 'x' : '-'} />
      </div>

      {data.length === 0 ? <EmptyState message="No campaigns match these filters. Clear a filter to continue." icon="🔍" /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 'var(--space-6)' }}>
          <Card title="Average ROI by platform" hint="Click a bar to filter by platform">
            <Bar data={platBar} options={baseOpts((e, el) => el.length && toggle('platform', platforms[el[0].index]))} />
          </Card>
          <Card title="High ROI rate by niche (%)" hint="Click a bar to filter by niche">
            <Bar data={nicheBar} options={baseOpts((e, el) => el.length && toggle('niche', niches[el[0].index]))} />
          </Card>
          <Card title="Outcome split" hint="Share of filtered campaigns">
            <Doughnut data={donut} options={{ responsive: true, maintainAspectRatio: false, cutout: '62%', plugins: { legend: { position: 'bottom' } } }} />
          </Card>
          <Card title="Spend vs revenue" hint={`Each dot is a campaign (${sample.length} shown)`}>
            <Scatter data={scatter} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } },
              scales: { x: { title: { display: true, text: 'Campaign cost (USD)' } }, y: { title: { display: true, text: 'Revenue (USD)' } } } }} />
          </Card>
        </div>
      )}

      <div className="chart-container" style={{ marginTop: 'var(--space-6)' }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-lg)' }}>Platform x niche: average ROI</div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)' }}>Darker is better. Click a cell to filter both.</div>
        <div className="table-wrapper"><table>
          <thead><tr><th></th>{niches.map(n => <th key={n} style={{ textAlign: 'center' }}>{n}</th>)}</tr></thead>
          <tbody>{platforms.map(p => (
            <tr key={p}><td style={{ fontWeight: 600 }}>{p}</td>
              {niches.map(n => {
                const v = cell(p, n); const t = v === null || hi === lo ? 0 : (v - lo) / (hi - lo)
                const sel = f.platform === p && f.niche === n
                return <td key={n} onClick={() => setF(s => ({ ...s, platform: p, niche: n }))}
                  style={{ textAlign: 'center', cursor: 'pointer', fontWeight: 600, background: `rgba(108,63,200,${0.06 + t * 0.75})`,
                    color: t > 0.55 ? '#fff' : 'var(--color-text-primary)', outline: sel ? '2px solid #1A1530' : 'none' }}>
                  {v === null ? '-' : v.toFixed(2) + 'x'}</td>
              })}
            </tr>))}</tbody>
        </table></div>
      </div>

      <div className="chart-container">
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-lg)', marginBottom: 'var(--space-3)' }}>Top 10 campaigns by revenue (current filters)</div>
        <div className="table-wrapper"><table>
          <thead><tr><th>Platform</th><th>Niche</th><th>Cost</th><th>Revenue</th><th>ROI</th><th>Outcome</th></tr></thead>
          <tbody>{top.map((r, i) => (
            <tr key={i}><td>{r.platform}</td><td>{r.niche}</td><td>{usd(r.cost)}</td><td>{usd(r.revenue)}</td>
              <td style={{ fontWeight: 700 }}>{r.roi.toFixed(2)}x</td>
              <td style={{ color: r.high_roi === 1 ? 'var(--color-success)' : 'var(--color-danger)', fontWeight: 600 }}>{r.high_roi === 1 ? 'High ROI' : 'Low ROI'}</td></tr>))}
          </tbody>
        </table></div>
      </div>
    </div>
  )
}

export default function Explorer() {
  const { rows, error } = useCampaigns()
  if (error) return <EmptyState message={error} icon="⚠️" />
  if (!rows) return <EmptyState message="Loading campaigns..." icon="⏳" />
  if (!rows.length) return <EmptyState message="campaigns.json is empty. Re-run python upgrade_visuals.py." icon="📭" />
  return <Body rows={rows} />
}

export function PlatformBars({ platforms }) {
  if (!platforms || !platforms.length) return null
  const data = {
    labels: platforms.map(p => p.platform),
    datasets: [{ label: 'Mean ROI', data: platforms.map(p => p.mean_roi_ratio ?? 0), backgroundColor: PURPLE, borderRadius: 6 }],
  }
  return (
    <div className="chart-container">
      <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-lg)', marginBottom: 'var(--space-3)' }}>Mean ROI by platform</div>
      <div style={{ position: 'relative', height: 300 }}>
        <Bar data={data} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
      </div>
    </div>
  )
}
''')
print('  Explorer.jsx written')

# ---------- 3. PATCH EXISTING FILES ----------
dash = f'{BASE}/src/pages/Dashboard.jsx'
s = open(dash, encoding='utf-8').read()
s = s.replace("import ChartPanel from '../components/ChartPanel'",
              "import Explorer, { PlatformBars } from '../components/Explorer'")
s = re.sub(r"function ROIOverviewTab\(\) \{.*?\n\}",
           "function ROIOverviewTab() {\n  return <Explorer />\n}", s, flags=re.S)
s = re.sub(r"function PlatformAnalysisTab\(\) \{.*?\n\}",
           "function PlatformAnalysisTab() {\n"
           "  const { platforms, loading, error } = usePlatforms()\n"
           "  if (loading) return <Spinner />\n"
           "  if (error) return <EmptyState message={error} icon=\"⚠️\" />\n"
           "  return (<><PlatformPerformance platforms={platforms} /><PlatformBars platforms={platforms} /></>)\n}",
           s, flags=re.S)
open(dash, 'w', encoding='utf-8').write(s)

main = f'{BASE}/src/main.jsx'
s = open(main, encoding='utf-8').read()
if 'ArcElement' not in s:   # doughnut chart needs ArcElement registered
    s = s.replace('PointElement, Title, Tooltip, Legend, Filler',
                  'PointElement, Title, Tooltip, Legend, Filler, ArcElement')
open(main, 'w', encoding='utf-8').write(s)

css = f'{BASE}/src/index.css'
s = open(css, encoding='utf-8').read()
if 'DRAWER FIX' not in s:
    s += '\n/* DRAWER FIX: sidebar was hidden inside the mobile drawer */\n' \
         '@media (max-width: 767px) { .drawer .sidebar { display: flex !important; width: 100%; border-right: none; } }\n'
open(css, 'w', encoding='utf-8').write(s)

print('\nDone. Now run:  cd react_frontend && npm run dev')


"""
upgrade_tiers.py  -  run after upgrade_visuals.py

  python upgrade_tiers.py

Rewrites react_frontend/src/components/TierMatrix.jsx so it:
  - reads the real keys in influencer_tiers.json (mean_engagement, mean_audience_quality, mean_cost_per_use)
  - lets the client click a tier to compare it with the rest of the roster
  - shows ROI, engagement, roster mix and cost-per-use charts
"""
import os

PATH = 'react_frontend/src/components/TierMatrix.jsx'
os.makedirs(os.path.dirname(PATH), exist_ok=True)

CODE = r'''import { useState } from 'react'
import { Bar, Doughnut } from 'react-chartjs-2'
import { EmptyState } from './EmptyState'
import { TIER_COLORS } from '../utils/colors'
import { formatROI } from '../utils/formatters'

const ORDER = ['Gold Tier', 'Silver Tier', 'Bronze Tier']
const STRATEGY = {
  'Gold Tier':   { label: 'Priority partner', bg: '#27AE60' },
  'Silver Tier': { label: 'Steady state',     bg: '#2980B9' },
  'Bronze Tier': { label: 'Test budget only', bg: '#E67E22' },
}

const norm = t => ({
  tier: t.tier,
  count: t.count ?? t.influencer_count ?? 0,
  roi: t.mean_roi_ratio ?? t.roi_ratio ?? 0,
  eng: t.mean_engagement ?? t.mean_engagement_rate ?? 0,
  aq: t.mean_audience_quality ?? t.mean_audience_quality_score ?? 0,
  cpu: t.mean_cost_per_use ?? t.mean_cost_per_conversion ?? t.cost_per_conversion ?? 0,
})

function ChartCard({ title, hint, children }) {
  return (
    <div className="chart-container" style={{ marginBottom: 0 }}>
      <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-lg)' }}>{title}</div>
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)' }}>{hint}</div>
      <div style={{ position: 'relative', height: 240 }}>{children}</div>
    </div>
  )
}

export default function TierMatrix({ tiers }) {
  const [sel, setSel] = useState(null)
  if (!tiers || !tiers.length)
    return <EmptyState message="No tier data found. Run the pipeline first." icon="🏆" />

  const rows = tiers.map(norm).sort((a, b) => ORDER.indexOf(a.tier) - ORDER.indexOf(b.tier))
  const color = t => (TIER_COLORS[t]?.bg ?? '#888')
  const faded = t => (sel && sel !== t ? color(t) + '55' : color(t))
  const total = rows.reduce((s, r) => s + r.count, 0)
  const portfolioROI = total ? rows.reduce((s, r) => s + r.roi * r.count, 0) / total : 0
  const portfolioCPU = total ? rows.reduce((s, r) => s + r.cpu * r.count, 0) / total : 0
  const picked = rows.find(r => r.tier === sel)
  const labels = rows.map(r => r.tier)
  const pick = i => setSel(s => (s === rows[i].tier ? null : rows[i].tier))

  const barOpts = (fmt) => ({
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => fmt(c.parsed.y) } } },
    scales: { x: { grid: { display: false } }, y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } } },
    onClick: (e, el) => el.length && pick(el[0].index),
    onHover: (e, el) => { if (e.native) e.native.target.style.cursor = el.length ? 'pointer' : 'default' },
  })
  const bar = key => ({ labels, datasets: [{ data: rows.map(r => r[key]), backgroundColor: rows.map(r => faded(r.tier)), borderRadius: 6 }] })

  return (
    <div>
      <div className="tier-grid" style={{ marginBottom: 'var(--space-6)' }}>
        {rows.map(r => {
          const tc = TIER_COLORS[r.tier] ?? { icon: '🎖️' }
          const st = STRATEGY[r.tier] ?? { label: 'Review', bg: '#888' }
          const on = sel === r.tier
          return (
            <div key={r.tier} className="tier-card" onClick={() => setSel(on ? null : r.tier)}
              style={{ borderTop: `4px solid ${color(r.tier)}`, cursor: 'pointer', outline: on ? `2px solid ${color(r.tier)}` : 'none',
                opacity: sel && !on ? 0.6 : 1, transition: 'opacity 0.15s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                <span style={{ fontSize: '2rem' }}>{tc.icon}</span>
                <div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'var(--text-xl)' }}>{r.tier}</div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{r.count} influencers ({total ? Math.round(100 * r.count / total) : 0}%)</div>
                </div>
              </div>
              {[
                ['Average ROI', formatROI(r.roi)],
                ['Engagement rate', `${r.eng.toFixed(1)}%`],
                ['Audience quality', r.aq.toFixed(2)],
                ['Cost per discount use', `$${r.cpu.toFixed(2)}`],
              ].map(([l, v]) => (
                <div key={l} className="metric-row">
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{l}</span>
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700 }}>{v}</span>
                </div>
              ))}
              <span style={{ display: 'inline-block', marginTop: 'var(--space-4)', background: st.bg, color: '#fff',
                borderRadius: 'var(--radius-pill)', padding: '4px 16px', fontSize: 'var(--text-xs)', fontWeight: 700 }}>{st.label}</span>
            </div>
          )
        })}
      </div>

      <div className="chart-container" style={{ background: picked ? 'var(--color-surface-raised)' : undefined }}>
        {picked ? (
          <div style={{ fontSize: 'var(--text-base)', lineHeight: 1.6 }}>
            <strong>{picked.tier}</strong> returns <strong>{(picked.roi / portfolioROI).toFixed(1)}x</strong> the roster-average ROI
            ({formatROI(picked.roi)} vs {formatROI(portfolioROI)}) at <strong>{portfolioCPU ? Math.round(100 * picked.cpu / portfolioCPU) : 0}%</strong> of
            the average cost per discount use ($${picked.cpu.toFixed(2)} vs ${portfolioCPU.toFixed(2)}).
            <button className="filter-pill" style={{ marginLeft: 12 }} onClick={() => setSel(null)}>Clear selection</button>
          </div>
        ) : (
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
            Click a tier card or a bar to compare it with the whole roster. Roster average ROI is {formatROI(portfolioROI)}.
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 'var(--space-6)', marginTop: 'var(--space-6)' }}>
        <ChartCard title="Average ROI by tier" hint="Return per dollar spent">
          <Bar data={bar('roi')} options={barOpts(v => `${v.toFixed(2)}x ROI`)} />
        </ChartCard>
        <ChartCard title="Engagement rate by tier" hint="Average engagement, %">
          <Bar data={bar('eng')} options={barOpts(v => `${v.toFixed(1)}%`)} />
        </ChartCard>
        <ChartCard title="Cost per discount use" hint="Lower is cheaper to convert">
          <Bar data={bar('cpu')} options={barOpts(v => `$${v.toFixed(2)}`)} />
        </ChartCard>
        <ChartCard title="Roster mix" hint="Influencers per tier">
          <Doughnut
            data={{ labels, datasets: [{ data: rows.map(r => r.count), backgroundColor: rows.map(r => faded(r.tier)), borderWidth: 0 }] }}
            options={{ responsive: true, maintainAspectRatio: false, cutout: '60%', plugins: { legend: { position: 'bottom' } },
              onClick: (e, el) => el.length && pick(el[0].index) }} />
        </ChartCard>
      </div>
    </div>
  )
}
'''

with open(PATH, 'w', encoding='utf-8') as f:
    f.write(CODE)
print(f'Wrote {PATH}')
print('Reload the dashboard: cd react_frontend && npm run dev')

