import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, r2_score

REG_FEATURES = [
    'Follower_Count', 'Engagement_Rate_Pct', 'Avg_Comments_Per_Post',
    'Past_Brand_Collaborations', 'Campaign_Cost_USD', 'Discount_Code_Uses',
    'cost_per_discount_use', 'revenue_per_follower', 'conversion_rate',
    'engagement_to_cost_efficiency', 'audience_quality_score',
    'influencer_experience_score', 'revenue_per_comment',
]


def run_forecast(df, config):
    fc = [c for c in REG_FEATURES if c in df.columns]
    X = df[fc].fillna(0)
    y = df[config['COL_REVENUE']].fillna(0)
    X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=config['TEST_SIZE'], random_state=config['RANDOM_STATE'])
    assert len(X_tr) >= 20
    gbr = GradientBoostingRegressor(n_estimators=200, random_state=config['RANDOM_STATE'])
    gbr.fit(X_tr, y_tr)
    preds = gbr.predict(X_te)
    mae = mean_absolute_error(y_te, preds)
    r2 = r2_score(y_te, preds)
    mape = float(np.abs((y_te.values - preds) / y_te.replace(0, 1).values).mean() * 100)
    joblib.dump(gbr, config['MODELS_DIR'] + 'revenue_forecaster.pkl')
    df['predicted_revenue_usd'] = gbr.predict(X)
    print(f'Revenue Forecaster: MAE=${mae:,.2f} | R2={r2:.4f} | MAPE={mape:.2f}%')
    return {'mae': mae, 'r2': r2, 'mape': mape}
