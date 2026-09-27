import json, os, datetime
import pandas as pd
import numpy as np

CONFIG = {
    'RAW_CSV': 'data/raw/influencer_campaigns.csv',
    'PROCESSED_CSV': 'data/processed/campaigns_clean.csv',
    'FEAT_CSV': 'data/processed/campaigns_features.csv',
    'REPORTS_DIR': 'reports/',
    'MODELS_DIR': 'models/',
    'COL_PLATFORM': 'Platform',
    'COL_NICHE': 'Audience_Niche',
    'COL_TARGET': 'High_ROI_Campaign',
    'COL_COST': 'Campaign_Cost_USD',
    'COL_REVENUE': 'Revenue_Generated_USD',
    'COL_ENGAGEMENT': 'Engagement_Rate_Pct',
    'COL_FOLLOWERS': 'Follower_Count',
    'BIGQUERY': {'project_id': '', 'dataset': '', 'table': 'feat', 'credentials_file': 'credentials.json'},
}

def _bigquery_available():
    creds_path = os.path.join(os.path.dirname(__file__), 'credentials.json')
    if not os.path.exists(creds_path):
        return False
    try:
        from google.cloud import bigquery  # noqa
        return True
    except ImportError:
        return False

def _load_from_csv(config):
    return pd.read_csv(config['FEAT_CSV'])

def _load_from_bigquery(config):
    from google.cloud import bigquery
    creds_path = os.path.join(os.path.dirname(__file__), 'credentials.json')
    client = bigquery.Client.from_service_account_json(creds_path)
    bq = config.get('BIGQUERY', {})
    q = f"SELECT * FROM `{bq['project_id']}.{bq['dataset']}.{bq['table']}`"
    return client.query(q).to_dataframe()

def _load_data(config):
    if _bigquery_available():
        print('[export_for_frontend] Source: BigQuery')
        try:
            return _load_from_bigquery(config)
        except Exception as e:
            print(f'[export_for_frontend] BigQuery failed ({e}), falling back to CSV')
    print('[export_for_frontend] Source: CSV')
    return _load_from_csv(config)

def safe_int(v):
    try:
        return int(v)
    except Exception:
        return 0

def safe_float(v, dp=4):
    try:
        return round(float(v), dp)
    except Exception:
        return 0.0

def main():
    df = _load_data(CONFIG)
    os.makedirs('reports/frontend', exist_ok=True)
    total = len(df)
    high_n = int((df[CONFIG['COL_TARGET']] == 'Yes').sum())
    high_rate = safe_float(high_n / max(total, 1))
    mean_roi = safe_float(df['roi_ratio'].mean()) if 'roi_ratio' in df.columns else 0.0
    anom_n = safe_int(df['is_campaign_anomaly'].sum()) if 'is_campaign_anomaly' in df.columns else 0
    p1_n = safe_int((df['partnership_priority'] == 'P1_STRATEGIC_PARTNER').sum()) if 'partnership_priority' in df.columns else 0
    gold_n = safe_int((df.get('influencer_tier', '') == 'Gold Tier').sum()) if 'influencer_tier' in df.columns else 0
    mean_aq = safe_float(df['audience_quality_score'].mean()) if 'audience_quality_score' in df.columns else 0.0
    model_auc_ready = os.path.exists(CONFIG['MODELS_DIR'] + 'roi_classifier.pkl')
    rev_mae_ready = os.path.exists(CONFIG['MODELS_DIR'] + 'revenue_forecaster.pkl')
    kpis = {
        'total_campaigns': total,
        'high_roi_count': high_n,
        'high_roi_rate': high_rate,
        'mean_roi_ratio': mean_roi,
        'median_campaign_cost_usd': safe_float(df[CONFIG['COL_COST']].median(), 2),
        'total_revenue_usd': safe_float(df[CONFIG['COL_REVENUE']].sum(), 2),
        'mean_audience_quality_score': mean_aq,
        'gold_tier_count': gold_n,
        'p1_partner_count': p1_n,
        'anomaly_count': anom_n,
        'roi_classifier_ready': model_auc_ready,
        'revenue_forecaster_ready': rev_mae_ready,
    }
    with open('reports/frontend/kpis.json', 'w', encoding='utf-8') as f:
        json.dump(kpis, f, indent=2)
    print('kpis.json written')

    charts = []
    plat_roi = df.groupby(CONFIG['COL_PLATFORM']).apply(lambda x: round((x[CONFIG['COL_TARGET']] == 'Yes').mean() * 100, 2))
    charts.append({'id': 'platform_roi_rates', 'title': 'ROI Rate by Platform', 'type': 'bar',
                  'x_label': 'Platform', 'y_label': 'High ROI %',
                  'data': [{'label': str(k), 'value': float(v)} for k, v in plat_roi.items()]})
    roi_vc = df[CONFIG['COL_TARGET']].value_counts()
    charts.append({'id': 'roi_outcome_distribution', 'title': 'Campaign ROI Outcome Distribution', 'type': 'bar',
                  'x_label': 'Outcome', 'y_label': 'Count',
                  'data': [{'label': str(k), 'value': int(v)} for k, v in roi_vc.items()]})
    niche_roi = df.groupby(CONFIG['COL_NICHE']).apply(lambda x: round((x[CONFIG['COL_TARGET']] == 'Yes').mean() * 100, 2))
    charts.append({'id': 'niche_roi_rates', 'title': 'ROI Rate by Audience Niche', 'type': 'bar',
                  'x_label': 'Niche', 'y_label': 'High ROI %',
                  'data': [{'label': str(k), 'value': float(v)} for k, v in niche_roi.items()]})

    if 'follower_tier' in df.columns:
        tier_roi = df.groupby('follower_tier').apply(lambda x: round((x[CONFIG['COL_TARGET']] == 'Yes').mean() * 100, 2))
        charts.append({'id': 'follower_tier_roi', 'title': 'ROI Rate by Follower Tier', 'type': 'bar',
                      'x_label': 'Tier', 'y_label': 'High ROI %',
                      'data': [{'label': str(k), 'value': float(v)} for k, v in tier_roi.items()]})
    if 'cost_efficiency_tier' in df.columns:
        cet = df.groupby('cost_efficiency_tier').apply(lambda x: round((x[CONFIG['COL_TARGET']] == 'Yes').mean() * 100, 2))
        charts.append({'id': 'cost_efficiency_tier_breakdown', 'title': 'ROI Rate by Cost Efficiency Tier', 'type': 'bar',
                      'x_label': 'Cost Tier', 'y_label': 'High ROI %',
                      'data': [{'label': str(k), 'value': float(v)} for k, v in cet.items()]})
    if 'partnership_priority' in df.columns:
        pp = df['partnership_priority'].value_counts()
        charts.append({'id': 'partnership_priority_distribution', 'title': 'Partnership Priority Distribution', 'type': 'bar',
                      'x_label': 'Priority', 'y_label': 'Count',
                      'data': [{'label': str(k), 'value': int(v)} for k, v in pp.items()]})
    if 'influencer_tier' in df.columns:
        it = df['influencer_tier'].value_counts()
        charts.append({'id': 'influencer_tier_sizes', 'title': 'Influencer Tier Sizes', 'type': 'bar',
                      'x_label': 'Tier', 'y_label': 'Count',
                      'data': [{'label': str(k), 'value': int(v)} for k, v in it.items()]})
    if 'roi_ratio' in df.columns:
        bins = pd.cut(df['roi_ratio'], bins=10)
        bin_counts = bins.value_counts().sort_index()
        charts.append({'id': 'roi_ratio_histogram', 'title': 'ROI Ratio Distribution', 'type': 'histogram',
                      'x_label': 'ROI Ratio', 'y_label': 'Count',
                      'data': [{'label': str(k), 'value': int(v)} for k, v in bin_counts.items()]})

    with open('reports/frontend/charts.json', 'w', encoding='utf-8') as f:
        json.dump(charts, f, indent=2, default=str)
    print('charts.json written with', len(charts), 'chart specs')

    insights_src = CONFIG['REPORTS_DIR'] + 'insights.json'
    if os.path.exists(insights_src):
        with open(insights_src, 'r', encoding='utf-8') as f:
            insights_data = json.load(f)
        with open('reports/frontend/insights.json', 'w', encoding='utf-8') as f:
            json.dump(insights_data, f, indent=2)
        print('insights.json copied')

    feat_cols_path = CONFIG['MODELS_DIR'] + 'feature_cols.pkl'
    feat_cols_list = []
    if os.path.exists(feat_cols_path):
        import joblib
        feat_cols_list = joblib.load(feat_cols_path)

    model_meta = {
        'model_name': 'ROI Classifier',
        'algorithm': 'GradientBoosting',
        'feature_count': len(feat_cols_list),
        'feature_cols': feat_cols_list,
        'roi_classifier_ready': model_auc_ready,
        'revenue_forecaster_ready': rev_mae_ready,
        'anomaly_detector_ready': os.path.exists(CONFIG['MODELS_DIR'] + 'campaign_anomaly_detector.pkl'),
    }
    with open('reports/frontend/model_meta.json', 'w', encoding='utf-8') as f:
        json.dump(model_meta, f, indent=2)
    print('model_meta.json written')

    if 'influencer_tier' in df.columns:
        tier_summary = []
        for tier in df['influencer_tier'].unique():
            sub = df[df['influencer_tier'] == tier]
            tier_summary.append({
                'tier': tier,
                'count': int(len(sub)),
                'mean_roi_ratio': safe_float(sub['roi_ratio'].mean()),
                'mean_engagement': safe_float(sub[CONFIG['COL_ENGAGEMENT']].mean()),
                'mean_audience_quality': safe_float(sub['audience_quality_score'].mean()),
                'mean_cost_per_use': safe_float(sub['cost_per_discount_use'].mean(), 2),
            })
        with open('reports/frontend/influencer_tiers.json', 'w', encoding='utf-8') as f:
            json.dump(tier_summary, f, indent=2)
        print('influencer_tiers.json written')

    plat_perf = []
    for plat in df[CONFIG['COL_PLATFORM']].unique():
        sub = df[df[CONFIG['COL_PLATFORM']] == plat]
        plat_perf.append({
            'platform': str(plat),
            'campaign_count': int(len(sub)),
            'high_roi_rate': safe_float((sub[CONFIG['COL_TARGET']] == 'Yes').mean()),
            'mean_roi_ratio': safe_float(sub['roi_ratio'].mean()) if 'roi_ratio' in sub else 0.0,
            'mean_cost_usd': safe_float(sub[CONFIG['COL_COST']].mean(), 2),
            'mean_revenue_usd': safe_float(sub[CONFIG['COL_REVENUE']].mean(), 2),
        })
    with open('reports/frontend/platform_performance.json', 'w', encoding='utf-8') as f:
        json.dump(plat_perf, f, indent=2)
    print('platform_performance.json written')

    src_type = 'bigquery' if _bigquery_available() else 'csv'
    bq_cfg = CONFIG.get('BIGQUERY', {})
    contract = {
        'generated_at': datetime.datetime.now().isoformat(),
        'pipeline_version': '1.0',
        'source': ({'type': 'bigquery', 'project_id': bq_cfg.get('project_id', ''),
                    'dataset': bq_cfg.get('dataset', ''), 'table': bq_cfg.get('table', 'feat'),
                    'credentials_file': 'credentials.json'}
                   if src_type == 'bigquery' else {'type': 'csv', 'file': CONFIG['FEAT_CSV']}),
        'files': [
            {'filename': 'kpis.json', 'purpose': 'Top-level scalar KPIs for dashboard header cards'},
            {'filename': 'charts.json', 'purpose': 'Chart specs for all platform/niche/tier visualisations'},
            {'filename': 'insights.json', 'purpose': 'Structured marketing intelligence insights feed'},
            {'filename': 'model_meta.json', 'purpose': 'ML model status and feature metadata'},
            {'filename': 'influencer_tiers.json', 'purpose': 'Gold/Silver/Bronze tier summary profiles'},
            {'filename': 'platform_performance.json', 'purpose': 'Per-platform campaign performance breakdown'},
        ],
        'forecaster': {
            'model_file': 'models/roi_classifier.pkl',
            'feature_cols_file': 'models/feature_cols.pkl',
            'output_schema': {'prediction': 'int', 'probability': 'float', 'risk_level': 'str'}
        }
    }
    with open('reports/frontend/frontend_contract.json', 'w', encoding='utf-8') as f:
        f.write(json.dumps(contract, indent=2))
    print('frontend_contract.json written')

    frontend_files = os.listdir('reports/frontend')
    total_kb = sum(os.path.getsize(os.path.join('reports/frontend', fn)) for fn in frontend_files) / 1024
    print(f'Export complete: {len(frontend_files)} files, {total_kb:.1f} KB total')
    print(f'Active source: {src_type}')
    print('Handoff document: reports/frontend/frontend_contract.json')

if __name__ == '__main__':
    main()
