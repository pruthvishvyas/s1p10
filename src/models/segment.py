import joblib
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.ensemble import IsolationForest

SEG_FEATURES = [
    'audience_quality_score', 'roi_ratio', 'conversion_rate',
    'influencer_experience_score', 'cost_per_discount_use'
]


def run_segmentation(df, config):
    sf = [c for c in SEG_FEATURES if c in df.columns]
    X = df[sf].fillna(0)
    sc = StandardScaler()
    Xs = sc.fit_transform(X)
    km = KMeans(n_clusters=3, n_init=10, random_state=config['RANDOM_STATE'])
    df['_km'] = km.fit_predict(Xs)
    cr = df.groupby('_km')['roi_ratio'].mean().sort_values(ascending=False) if 'roi_ratio' in df.columns else df.groupby('_km').size().sort_values(ascending=False)
    tmap = {cid: t for cid, t in zip(cr.index, ['Gold Tier', 'Silver Tier', 'Bronze Tier'])}
    df['influencer_tier'] = df['_km'].map(tmap)
    df.drop(columns=['_km'], inplace=True)
    iso = IsolationForest(contamination=0.08, random_state=config['RANDOM_STATE'])
    df['is_campaign_anomaly'] = (iso.fit_predict(Xs) == -1).astype(int)
    joblib.dump(km, config['MODELS_DIR'] + 'influencer_segmenter.pkl')
    joblib.dump(iso, config['MODELS_DIR'] + 'campaign_anomaly_detector.pkl')
    joblib.dump(sc, config['MODELS_DIR'] + 'seg_scaler.pkl')
    df.to_csv(config['FEAT_CSV'], index=False, encoding='utf-8')
    print(f"Segmentation: Gold={(df['influencer_tier']=='Gold Tier').sum()} | Anomalies={df['is_campaign_anomaly'].sum()}")
    return df
