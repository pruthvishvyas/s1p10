# Influencer Marketing ROI Intelligence Platform

## Business Problem
Marketing teams allocate significant budgets to influencer campaigns without a systematic
framework for predicting ROI before spend is committed. This platform provides data-driven
influencer selection, automated tier scoring, and pre-campaign revenue forecasting —
replacing guesswork with an evidence-based campaign intelligence engine.

## The Core Finding
96.2% of 208 analysed campaigns delivered High ROI. Tiktok leads all platforms
with 97.0% High ROI rate. Gold Tier influencers deliver 5.5x the ROI of Bronze Tier.

## Dataset
208 campaigns | 11 columns | Source: influencer_campaigns.csv

| Column | Type | Business Meaning |
|---|---|---|
| Influencer_ID | ID | Unique influencer identifier |
| Platform | Categorical | Campaign channel (Instagram, YouTube, TikTok, etc.) |
| Audience_Niche | Categorical | Content vertical / audience category |
| Follower_Count | Integer | Total audience size — reach proxy |
| Engagement_Rate_Pct | Float | % audience actively engaging — quality signal |
| Avg_Comments_Per_Post | Integer | Depth of audience interaction |
| Past_Brand_Collaborations | Integer | Commercial experience — reliability proxy |
| Campaign_Cost_USD | Float | Total campaign spend |
| Discount_Code_Uses | Integer | Direct attribution — tracked conversions |
| Revenue_Generated_USD | Float | Attributed campaign revenue |
| High_ROI_Campaign | Target | Whether campaign delivered high ROI (Yes/No) |

## Project Structure
./
  main.py
  README.md
  requirements.txt
  config/
    config.py
  data/
    processed/
      campaigns_clean.csv
      campaigns_features.csv
    raw/
      influencer_campaigns.csv
  models/
    campaign_anomaly_detector.pkl
    feature_cols.pkl
    influencer_segmenter.pkl
    revenue_forecaster.pkl
    roi_classifier.pkl
    seg_scaler.pkl
  react_frontend/
    .env
    .env.example
    .gitignore
    deploy.sh
    index.html
    package-lock.json
    package.json
    README.md
    vite.config.js
    wrangler.toml
    _headers
    _redirects
    public/
      data/
        anomalies.json
        campaigns.json
        charts.json
        forecast_lookup.json
        frontend_contract.json
        influencer_tiers.json
        insights.json
        kpis.json
        model_meta.json
        platform_performance.json
        visual_reports.json
      reports/
        biz_01_partnership_priorities.png
        eda_01_roi_outcome_distribution.png
        eda_02_platform_roi_rate.png
        eda_03_niche_roi_rate.png
        eda_04_follower_tier_roi.png
        eda_05_engagement_vs_roi_scatter.png
        eda_06_cost_vs_revenue_scatter.png
        eda_07_audience_quality_by_platform.png
        eda_08_correlation_heatmap.png
        eda_09_cost_efficiency_tier_breakdown.png
        eda_10_platform_niche_roi_heatmap.png
        interactive_dashboard.html
        manifest.json

## Pipeline Phases
0.  Config & Campaign Intelligence Setup — all thresholds and column references
1.  Data Ingestion & Validation — schema check, target balance, portfolio overview
2.  Data Cleaning & Standardisation — dtype enforcement, IQR capping, dedup
3.  Feature Engineering — 12 business-meaningful performance signals
4.  EDA — 10 campaign intelligence visualisations
5.  ROI Prediction Model — classify High/Low ROI before spend
6.  Influencer Segmentation — Gold/Silver/Bronze tiers + anomaly detection
7.  Revenue Forecasting — predict campaign revenue (USD)
8.  Campaign Intelligence Engine — automated alerts, priority tiers, recommendations
9.  Marketing Intelligence Insights — 10 structured findings with evidence

## ML Models
| Model | Purpose | Algorithm | Status |
|---|---|---|---|
| ROI Classifier | Predict High ROI before spend | Gradient Boosting | Ready |
| Revenue Forecaster | Estimate campaign revenue (USD) | Gradient Boosting | Ready |
| Influencer Segmenter | Tier influencers Gold/Silver/Bronze | KMeans | Ready |
| Campaign Anomaly Detector | Flag unusual spend/revenue patterns | Isolation Forest | Ready |

## Key Insights
- [HIGH] 96.2% of 208 campaigns delivered High ROI
  Action: Use as baseline for new campaign ROI targets
- [HIGH] Tiktok leads with 97.0% High ROI rate
  Action: Concentrate budget toward Tiktok
- [HIGH] Skincare niche delivers highest mean ROI of 10.31x
  Action: Prioritise Skincare niche for premium campaigns

## How to Run
1. pip install -r requirements.txt
2. Place raw CSV in data/raw/influencer_campaigns.csv
3. python main.py                    # runs full analytics pipeline
4. python export_for_frontend.py     # packages outputs -> reports/frontend/
5. open reports/interactive_dashboard.html

## Output Files
| File | Purpose |
|---|---|
| reports/interactive_dashboard.html | Plotly ROI intelligence dashboard |
| reports/influencer_roi_report.xlsx | 8-sheet Excel campaign workbook |
| reports/insights.json | Structured marketing insights (10 findings) |
| reports/executive_report.txt | 14-slide boardroom briefing |
| reports/frontend/ | 7 JSON files for Cloudflare SaaS |
| models/roi_classifier.pkl | ROI prediction model |
| models/revenue_forecaster.pkl | Revenue forecast model |
| models/influencer_segmenter.pkl | Gold/Silver/Bronze cluster model |
| models/campaign_anomaly_detector.pkl | Anomaly detection model |

## Tech Stack
Python 3.10+ | pandas | numpy | scikit-learn | matplotlib | seaborn
plotly | openpyxl | joblib | xgboost | lightgbm | notebook