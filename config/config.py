import os

CONFIG = {
    "RAW_CSV": "data/raw/influencer_campaigns.csv",
    "PROCESSED_CSV": "data/processed/campaigns_clean.csv",
    "FEAT_CSV": "data/processed/campaigns_features.csv",
    "REPORTS_DIR": "reports/",
    "MODELS_DIR": "models/",
    "COL_ID": "Influencer_ID",
    "COL_PLATFORM": "Platform",
    "COL_NICHE": "Audience_Niche",
    "COL_FOLLOWERS": "Follower_Count",
    "COL_ENGAGEMENT": "Engagement_Rate_Pct",
    "COL_COMMENTS": "Avg_Comments_Per_Post",
    "COL_COLLABS": "Past_Brand_Collaborations",
    "COL_COST": "Campaign_Cost_USD",
    "COL_DISCOUNT_USES": "Discount_Code_Uses",
    "COL_REVENUE": "Revenue_Generated_USD",
    "COL_TARGET": "High_ROI_Campaign",
    "RANDOM_STATE": 42,
    "TEST_SIZE": 0.2,
    "ANOMALY_CONT": 0.08,
    "ROI_HIGH_THRESHOLD": 3.0,
    "ROI_MEDIUM_THRESHOLD": 1.5,
    "ENGAGEMENT_HIGH": 5.0,
    "ENGAGEMENT_MEDIUM": 2.0,
    "FOLLOWER_MICRO": 50000,
    "FOLLOWER_MACRO": 500000,
    "CONVERSION_RATE_GOOD": 0.005,
    "COST_PER_USE_THRESHOLD": 50.0,
    "REV_PER_FOLLOWER_GOOD": 0.01,
    "COLLAB_EXPERIENCED": 5,
    "TARGET_MAP": {"Yes": 1, "No": 0},
    "TARGET_LABELS": {1: "High ROI", 0: "Low ROI"},
    "BIGQUERY": {
        "project_id": "",
        "dataset": "",
        "table": "feat",
        "credentials_file": "credentials.json",
    },
}

for d in [CONFIG["REPORTS_DIR"], CONFIG["MODELS_DIR"], "data/raw", "data/processed", "reports/frontend"]:
    os.makedirs(d, exist_ok=True)
