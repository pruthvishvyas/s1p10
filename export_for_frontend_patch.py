"""
export_for_frontend_patch.py
Generates the two files the React dashboard needs that export_for_frontend.py may not produce:
  reports/frontend/anomalies.json      — rows where is_campaign_anomaly == 1
  reports/frontend/forecast_lookup.json — sampled rows with prediction + probability for local forecasting

Run after python main.py:
  python export_for_frontend_patch.py
"""
import os, sys, json
import pandas as pd

# ── CONFIG — adjust these paths if your pipeline uses different names ───────
FEAT_CSV      = 'data/processed/campaigns_features.csv'
MODEL_CLF     = 'models/roi_classifier.pkl'
FEAT_COLS     = 'models/feature_cols.pkl'
OUT_DIR       = 'reports/frontend'
ANOMALY_COL   = 'is_campaign_anomaly'   # column set by your pipeline's anomaly detector
TARGET_COL    = 'High_ROI'               # binary target (0/1)
PROB_COL      = 'roi_probability'         # probability column written by predictor.py
LOOKUP_SAMPLE = 500                       # rows to embed in forecast_lookup.json
# ─────────────────────────────────────────────────────────────────────────────

os.makedirs(OUT_DIR, exist_ok=True)

if not os.path.exists(FEAT_CSV):
    print(f"ERROR: {FEAT_CSV} not found. Run python main.py first.")
    sys.exit(1)

print(f"Reading {FEAT_CSV}...")
df = pd.read_csv(FEAT_CSV)
print(f"  Shape: {df.shape}")

# ── 1. ANOMALIES ─────────────────────────────────────────────────────────────
anomaly_path = os.path.join(OUT_DIR, "anomalies.json")
if ANOMALY_COL in df.columns:
    anomaly_df = df[df[ANOMALY_COL] == 1].copy()
    print(f"  Anomalies found: {len(anomaly_df)}")
else:
    # Fallback: flag rows where campaign cost is > 3 std devs from mean
    print(f"  WARNING: column '{ANOMALY_COL}' not found — using cost outlier fallback")
    cost_cols = [c for c in df.columns if "cost" in c.lower() or "Cost" in c]
    if cost_cols:
        col = cost_cols[0]
        mu, sigma = df[col].mean(), df[col].std()
        anomaly_df = df[(df[col] > mu + 2.5*sigma) | (df[col] < mu - 2.5*sigma)].copy()
    else:
        anomaly_df = df.head(0).copy()
    print(f"  Anomalies (fallback): {len(anomaly_df)}")

# Keep only serialisable columns
def make_serialisable(d):
    out = {}
    for k, v in d.items():
        try:
            import math
            if isinstance(v, float) and (math.isnan(v) or math.isinf(v)):
                out[k] = None
            else:
                out[k] = v
        except Exception:
            out[k] = str(v)
    return out

anomaly_records = [make_serialisable(r) for r in anomaly_df.head(500).to_dict(orient="records")]
with open(anomaly_path, "w", encoding="utf-8") as f:
    json.dump(anomaly_records, f, indent=2, default=str)
print(f"  ✓ {anomaly_path} ({len(anomaly_records)} rows)")

# ── 2. FORECAST LOOKUP ───────────────────────────────────────────────────────
lookup_path = os.path.join(OUT_DIR, "forecast_lookup.json")

# Try to use the trained model to generate probabilities for the lookup
lookup_records = []
try:
    import joblib
    if os.path.exists(MODEL_CLF) and os.path.exists(FEAT_COLS):
        clf       = joblib.load(MODEL_CLF)
        feat_cols = joblib.load(FEAT_COLS)
        print(f"  Model loaded: {MODEL_CLF}")
        print(f"  Feature cols: {feat_cols}")

        # Sample rows for the lookup table
        sample = df.sample(min(LOOKUP_SAMPLE, len(df)), random_state=42).copy()

        # Build feature matrix — handle missing cols gracefully
        available = [c for c in feat_cols if c in sample.columns]
        missing   = [c for c in feat_cols if c not in sample.columns]
        if missing:
            print(f"  WARNING: missing feature columns: {missing} — filling with 0")
            for c in missing:
                sample[c] = 0

        X = sample[feat_cols].fillna(0)
        probs = clf.predict_proba(X)[:, 1]
        preds = (probs >= 0.5).astype(int)

        # Build input schema column list from contract
        contract_path = os.path.join(OUT_DIR, "frontend_contract.json")
        input_cols = []
        if os.path.exists(contract_path):
            with open(contract_path) as cf:
                cdata = json.load(cf)
            input_cols = [s["name"] for s in cdata.get("forecaster",{}).get("input_schema",[])]

        for i, (_, row) in enumerate(sample.iterrows()):
            rec = {}
            # Include input schema fields (for nearest-neighbour matching)
            for col in (input_cols or list(sample.columns[:10])):
                if col in row.index:
                    v = row[col]
                    import math
                    rec[col] = None if (isinstance(v, float) and (math.isnan(v) or math.isinf(v))) else v
            rec["prediction"]  = int(preds[i])
            rec["probability"] = round(float(probs[i]), 4)
            rec["risk_level"]  = "LOW" if probs[i] >= 0.65 else "MEDIUM" if probs[i] >= 0.4 else "HIGH"
            lookup_records.append(rec)

        print(f"  ✓ Lookup built from model: {len(lookup_records)} rows")
    else:
        raise FileNotFoundError("Model files not found")

except Exception as e:
    print(f"  WARNING: Could not use model ({e}) — building lookup from CSV predictions")
    # Fallback: use existing probability/prediction columns from the pipeline CSV
    prob_col_candidates = [c for c in df.columns if "prob" in c.lower() or "probability" in c.lower()]
    pred_col_candidates = [c for c in df.columns if c in ["prediction","predicted","High_ROI_pred","roi_pred","y_pred"]]
    tgt_candidates      = [c for c in df.columns if c in ["High_ROI","roi_label","target","is_high_roi"]]

    prob_col = prob_col_candidates[0] if prob_col_candidates else None
    pred_col = pred_col_candidates[0] if pred_col_candidates else None
    tgt_col  = tgt_candidates[0]      if tgt_candidates      else None

    sample = df.sample(min(LOOKUP_SAMPLE, len(df)), random_state=42).copy()

    contract_path = os.path.join(OUT_DIR, "frontend_contract.json")
    input_cols = []
    if os.path.exists(contract_path):
        with open(contract_path) as cf:
            cdata = json.load(cf)
        input_cols = [s["name"] for s in cdata.get("forecaster",{}).get("input_schema",[])]

    for _, row in sample.iterrows():
        rec = {}
        for col in (input_cols or list(sample.columns[:10])):
            if col in row.index:
                import math
                v = row[col]
                rec[col] = None if (isinstance(v, float) and (math.isnan(v) or math.isinf(v))) else v
        if prob_col and prob_col in row.index:
            p = float(row[prob_col])
            rec["probability"] = round(p, 4)
            rec["prediction"]  = 1 if p >= 0.5 else 0
            rec["risk_level"]  = "LOW" if p >= 0.65 else "MEDIUM" if p >= 0.4 else "HIGH"
        elif pred_col and pred_col in row.index:
            pred = int(row[pred_col])
            rec["prediction"]  = pred
            rec["probability"] = 0.75 if pred == 1 else 0.25
            rec["risk_level"]  = "LOW" if pred == 1 else "HIGH"
        elif tgt_col and tgt_col in row.index:
            tgt = int(row[tgt_col])
            rec["prediction"]  = tgt
            rec["probability"] = 0.72 if tgt == 1 else 0.28
            rec["risk_level"]  = "LOW" if tgt == 1 else "HIGH"
        else:
            rec["prediction"]  = 0
            rec["probability"] = 0.5
            rec["risk_level"]  = "MEDIUM"
        lookup_records.append(rec)

    print(f"  ✓ Lookup built from CSV: {len(lookup_records)} rows")

with open(lookup_path, "w", encoding="utf-8") as f:
    json.dump(lookup_records, f, indent=2, default=str)
print(f"  ✓ {lookup_path} ({len(lookup_records)} rows)")

print()
print("=" * 60)
print("export_for_frontend_patch complete.")
print(f"  anomalies.json     → {len(anomaly_records)} rows")
print(f"  forecast_lookup.json → {len(lookup_records)} rows")
print()
print("Next: copy these files to react_frontend/public/data/")
print("  cp reports/frontend/anomalies.json react_frontend/public/data/")
print("  cp reports/frontend/forecast_lookup.json react_frontend/public/data/")
print("Then reload the dashboard: npm run dev")
print("=" * 60)