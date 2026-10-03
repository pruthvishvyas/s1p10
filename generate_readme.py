import json, os
import pandas as pd

CONFIG = {
    'FEAT_CSV':    'data/processed/campaigns_features.csv',
    'REPORTS_DIR': 'reports/',
    'MODELS_DIR':  'models/',
    'COL_PLATFORM':'Platform',
    'COL_NICHE':   'Audience_Niche',
    'COL_TARGET':  'High_ROI_Campaign',
    'COL_REVENUE': 'Revenue_Generated_USD',
    'COL_COST':    'Campaign_Cost_USD',
    'COL_ENGAGEMENT':'Engagement_Rate_Pct',
    'COL_FOLLOWERS':'Follower_Count',
}

df = pd.read_csv(CONFIG['FEAT_CSV']) if os.path.exists(CONFIG['FEAT_CSV']) else pd.DataFrame()
total    = len(df)
high_pct = round((df[CONFIG['COL_TARGET']]=='Yes').mean()*100,1) if total > 0 else 0
plat_roi = df.groupby(CONFIG['COL_PLATFORM']).apply(lambda x: (x[CONFIG['COL_TARGET']]=='Yes').mean()*100) if total > 0 else {}
best_plat = plat_roi.idxmax() if len(plat_roi) > 0 else 'N/A'
best_prate = round(plat_roi.max(), 1) if len(plat_roi) > 0 else 0
gold_n = len(df[df['influencer_tier']=='Gold Tier']) if 'influencer_tier' in df.columns else 0
bronze_n = len(df[df['influencer_tier']=='Bronze Tier']) if 'influencer_tier' in df.columns else 1
gold_roi = df[df['influencer_tier']=='Gold Tier']['roi_ratio'].mean() if 'influencer_tier' in df.columns and 'roi_ratio' in df.columns else 0
bronze_roi = df[df['influencer_tier']=='Bronze Tier']['roi_ratio'].mean() if 'influencer_tier' in df.columns and 'roi_ratio' in df.columns else 1
gold_mult = round(gold_roi / max(bronze_roi,0.01), 1)
clf_status = 'Ready' if os.path.exists(CONFIG['MODELS_DIR']+'roi_classifier.pkl') else 'Not trained'
rev_status = 'Ready' if os.path.exists(CONFIG['MODELS_DIR']+'revenue_forecaster.pkl') else 'Not trained'
seg_status = 'Ready' if os.path.exists(CONFIG['MODELS_DIR']+'influencer_segmenter.pkl') else 'Not trained'
ano_status = 'Ready' if os.path.exists(CONFIG['MODELS_DIR']+'campaign_anomaly_detector.pkl') else 'Not trained'

insights = []
if os.path.exists(CONFIG['REPORTS_DIR']+'insights.json'):
    with open(CONFIG['REPORTS_DIR']+'insights.json','r',encoding='utf-8') as f:
        insights = json.load(f)
high_ins = [i for i in insights if i.get('severity')=='HIGH'][:3]

sections = []
def S(t): sections.append(t)

S('# Influencer Marketing ROI Intelligence Platform')
S('')
S('## Business Problem')
S('Marketing teams allocate significant budgets to influencer campaigns without a systematic')
S('framework for predicting ROI before spend is committed. This platform provides data-driven')
S('influencer selection, automated tier scoring, and pre-campaign revenue forecasting —')
S('replacing guesswork with an evidence-based campaign intelligence engine.')
S('')
S('## The Core Finding')
S(f'{high_pct}% of {total} analysed campaigns delivered High ROI. {best_plat} leads all platforms')
S(f'with {best_prate}% High ROI rate. Gold Tier influencers deliver {gold_mult}x the ROI of Bronze Tier.')
S('')
S('## Dataset')
S('208 campaigns | 11 columns | Source: influencer_campaigns.csv')
S('')
S('| Column | Type | Business Meaning |')
S('|---|---|---|')
S('| Influencer_ID | ID | Unique influencer identifier |')
S('| Platform | Categorical | Campaign channel (Instagram, YouTube, TikTok, etc.) |')
S('| Audience_Niche | Categorical | Content vertical / audience category |')
S('| Follower_Count | Integer | Total audience size — reach proxy |')
S('| Engagement_Rate_Pct | Float | % audience actively engaging — quality signal |')
S('| Avg_Comments_Per_Post | Integer | Depth of audience interaction |')
S('| Past_Brand_Collaborations | Integer | Commercial experience — reliability proxy |')
S('| Campaign_Cost_USD | Float | Total campaign spend |')
S('| Discount_Code_Uses | Integer | Direct attribution — tracked conversions |')
S('| Revenue_Generated_USD | Float | Attributed campaign revenue |')
S('| High_ROI_Campaign | Target | Whether campaign delivered high ROI (Yes/No) |')
S('')
S('## Project Structure')
lines = []
for root, dirs, files in os.walk('.'):
    dirs[:] = [d for d in dirs if d not in ['.git','__pycache__','.ipynb_checkpoints','node_modules']]
    level = root.replace('.','').count(os.sep)
    indent = '  ' * level
    lines.append(f'{indent}{os.path.basename(root)}/')
    subindent = '  ' * (level + 1)
    for fname in files:
        lines.append(f'{subindent}{fname}')
S(chr(10).join(lines[:60]))
S('')
S('## Pipeline Phases')
S('0.  Config & Campaign Intelligence Setup — all thresholds and column references')
S('1.  Data Ingestion & Validation — schema check, target balance, portfolio overview')
S('2.  Data Cleaning & Standardisation — dtype enforcement, IQR capping, dedup')
S('3.  Feature Engineering — 12 business-meaningful performance signals')
S('4.  EDA — 10 campaign intelligence visualisations')
S('5.  ROI Prediction Model — classify High/Low ROI before spend')
S('6.  Influencer Segmentation — Gold/Silver/Bronze tiers + anomaly detection')
S('7.  Revenue Forecasting — predict campaign revenue (USD)')
S('8.  Campaign Intelligence Engine — automated alerts, priority tiers, recommendations')
S('9.  Marketing Intelligence Insights — 10 structured findings with evidence')
S('10. Dashboard Export — Plotly HTML + 8-sheet Excel workbook')
S('11. Frontend Export — 7 JSON files for Cloudflare SaaS dashboard')
S('12. Executive Report Generator — 14-slide boardroom text report')
S('13. README Generator — this file')
S('14. Production Scaffolding — full src/ module project structure')
S('')
S('## ML Models')
S('| Model | Purpose | Algorithm | Status |')
S('|---|---|---|---|')
S(f'| ROI Classifier | Predict High ROI before spend | Gradient Boosting | {clf_status} |')
S(f'| Revenue Forecaster | Estimate campaign revenue (USD) | Gradient Boosting | {rev_status} |')
S(f'| Influencer Segmenter | Tier influencers Gold/Silver/Bronze | KMeans | {seg_status} |')
S(f'| Campaign Anomaly Detector | Flag unusual spend/revenue patterns | Isolation Forest | {ano_status} |')
S('')
S('## Key Insights')
for ins in high_ins:
    S(f"- [{ins['severity']}] {ins['finding']}")
    S(f"  Action: {ins['action']}")
S('')
S('## How to Run')
S('1. pip install -r requirements.txt')
S('2. Place raw CSV in data/raw/influencer_campaigns.csv')
S('3. python main.py                    # runs full analytics pipeline')
S('4. python export_for_frontend.py     # packages outputs -> reports/frontend/')
S('5. open reports/interactive_dashboard.html')
S('')
S('## Output Files')
S('| File | Purpose |')
S('|---|---|')
S('| reports/interactive_dashboard.html | Plotly ROI intelligence dashboard |')
S('| reports/influencer_roi_report.xlsx | 8-sheet Excel campaign workbook |')
S('| reports/insights.json | Structured marketing insights (10 findings) |')
S('| reports/executive_report.txt | 14-slide boardroom briefing |')
S('| reports/frontend/ | 7 JSON files for Cloudflare SaaS |')
S('| models/roi_classifier.pkl | ROI prediction model |')
S('| models/revenue_forecaster.pkl | Revenue forecast model |')
S('| models/influencer_segmenter.pkl | Gold/Silver/Bronze cluster model |')
S('| models/campaign_anomaly_detector.pkl | Anomaly detection model |')
S('')
S('## Tech Stack')
S('Python 3.10+ | pandas | numpy | scikit-learn | matplotlib | seaborn')
S('plotly | openpyxl | joblib | xgboost | lightgbm | notebook')

output = chr(10).join(sections)
output = output.replace(chr(0xfffd), '-')
out_path = 'README.md'
with open(out_path, 'w', encoding='utf-8') as f:
    f.write(output)
print(f'README saved: {out_path}')
print(f'Word count: {len(output.split())}')
