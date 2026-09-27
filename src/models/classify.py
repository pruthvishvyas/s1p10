import joblib
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import roc_auc_score

FEATURE_COLS = [
    'Follower_Count', 'Engagement_Rate_Pct', 'Avg_Comments_Per_Post',
    'Past_Brand_Collaborations', 'Campaign_Cost_USD', 'Discount_Code_Uses',
    'roi_ratio', 'cost_per_discount_use', 'revenue_per_follower',
    'conversion_rate', 'engagement_to_cost_efficiency',
    'audience_quality_score', 'influencer_experience_score', 'revenue_per_comment',
]


def run_classification(df, config):
    fc = [c for c in FEATURE_COLS if c in df.columns]
    X = df[fc].fillna(0)
    y = df['target_numeric'].fillna(0).astype(int)
    X_tr, X_te, y_tr, y_te = train_test_split(
        X, y, test_size=config['TEST_SIZE'], random_state=config['RANDOM_STATE'], stratify=y
    )
    assert len(X_tr) >= 20
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=config['RANDOM_STATE'])
    models = {
        'Logistic Regression': Pipeline([
            ('sc', StandardScaler()),
            ('clf', LogisticRegression(max_iter=1000, random_state=config['RANDOM_STATE']))
        ]),
        'Random Forest': RandomForestClassifier(n_estimators=100, random_state=config['RANDOM_STATE'], n_jobs=-1),
        'Gradient Boosting': GradientBoostingClassifier(n_estimators=200, random_state=config['RANDOM_STATE']),
    }
    best_auc, best_model = 0, None
    for name, mdl in models.items():
        cv = cross_val_score(mdl, X_tr, y_tr, cv=skf, scoring='roc_auc')
        mdl.fit(X_tr, y_tr)
        auc = roc_auc_score(y_te, mdl.predict_proba(X_te)[:, 1])
        print(f'{name}: CV-AUC={cv.mean():.4f} | Test-AUC={auc:.4f}')
        if auc > best_auc:
            best_auc, best_model = auc, mdl
    joblib.dump(best_model, config['MODELS_DIR'] + 'roi_classifier.pkl')
    joblib.dump(fc, config['MODELS_DIR'] + 'feature_cols.pkl')
    df['pred_high_roi'] = best_model.predict(X.fillna(0))
    df['pred_roi_probability'] = best_model.predict_proba(X.fillna(0))[:, 1]
    print(f'Best AUC: {best_auc:.4f} | Saved roi_classifier.pkl')
    return df
