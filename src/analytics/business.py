THRESHOLDS = {
    'roi_high': 3.0,
    'roi_medium': 1.5,
    'engagement_high': 5.0,
    'engagement_low': 1.0,
    'cost_per_use_good': 50.0,
    'cost_per_use_alarm': 200.0,
    'conversion_good': 0.005,
    'experience_low': 2,
    'audience_quality_high': 0.7,
}


def assign_campaign_alerts(row):
    alerts = []
    roi = row.get('roi_ratio', 0)
    eng = row.get('Engagement_Rate_Pct', 0)
    aq = row.get('audience_quality_score', 0)
    cpu = row.get('cost_per_discount_use', 9999)
    cr = row.get('conversion_rate', 0)
    duc = row.get('Discount_Code_Uses', 0)
    col = row.get('Past_Brand_Collaborations', 0)
    ano = row.get('is_campaign_anomaly', 0)
    if roi >= THRESHOLDS['roi_high']:
        alerts.append('HIGH_ROI_CONFIRMED')
    if eng >= THRESHOLDS['engagement_high']:
        alerts.append('STRONG_ENGAGEMENT')
    if aq >= THRESHOLDS['audience_quality_high']:
        alerts.append('ELITE_AUDIENCE_QUALITY')
    if cpu <= THRESHOLDS['cost_per_use_good']:
        alerts.append('LOW_COST_PER_CONVERSION')
    if cr >= THRESHOLDS['conversion_good']:
        alerts.append('HIGH_CONVERSION_RATE')
    if roi < 1.0:
        alerts.append('NEGATIVE_ROI')
    if eng < THRESHOLDS['engagement_low']:
        alerts.append('POOR_ENGAGEMENT')
    if cpu > THRESHOLDS['cost_per_use_alarm']:
        alerts.append('EXPENSIVE_CONVERSIONS')
    if duc == 0:
        alerts.append('ZERO_CONVERSIONS')
    if col < THRESHOLDS['experience_low']:
        alerts.append('INEXPERIENCED_INFLUENCER')
    if ano == 1:
        alerts.append('ANOMALOUS_CAMPAIGN')
    return '|'.join(alerts) if alerts else 'NO_ALERTS'


def assign_partnership_priority(alerts_str):
    a = set(alerts_str.split('|'))
    if 'NEGATIVE_ROI' in a and ('POOR_ENGAGEMENT' in a or 'ZERO_CONVERSIONS' in a):
        return 'P5_DO_NOT_REBOOK'
    if any(x in a for x in ['NEGATIVE_ROI', 'EXPENSIVE_CONVERSIONS', 'ZERO_CONVERSIONS']):
        return 'P4_REVIEW_REQUIRED'
    if 'HIGH_ROI_CONFIRMED' in a and ('STRONG_ENGAGEMENT' in a or 'ELITE_AUDIENCE_QUALITY' in a):
        return 'P1_STRATEGIC_PARTNER'
    if 'HIGH_ROI_CONFIRMED' in a or ('STRONG_ENGAGEMENT' in a and 'LOW_COST_PER_CONVERSION' in a):
        return 'P2_RECOMMENDED'
    return 'P3_MONITOR'


def generate_campaign_recommendation(row):
    a = set(str(row.get('campaign_alerts', '')).split('|'))
    recs = []
    if 'HIGH_ROI_CONFIRMED' in a:
        recs.append('Prioritise for next campaign cycle')
    if 'POOR_ENGAGEMENT' in a:
        recs.append('Review campaign brief — content-audience mismatch')
    if 'EXPENSIVE_CONVERSIONS' in a:
        recs.append('Optimise discount code strategy')
    if 'ZERO_CONVERSIONS' in a:
        recs.append('Verify audience authenticity')
    if 'ANOMALOUS_CAMPAIGN' in a:
        recs.append('Flag for manual audit')
    if 'NEGATIVE_ROI' in a:
        recs.append('Consider platform switch')
    if not recs:
        recs.append('A/B test with smaller budget first')
    return '; '.join(recs)


def run_business_logic(df, config):
    df = df.copy()
    df['campaign_alerts'] = df.apply(assign_campaign_alerts, axis=1)
    df['partnership_priority'] = df['campaign_alerts'].apply(assign_partnership_priority)
    df['campaign_recommendation'] = df.apply(generate_campaign_recommendation, axis=1)
    df.to_csv(config['FEAT_CSV'], index=False, encoding='utf-8')
    print('Business logic complete.')
    print(df['partnership_priority'].value_counts().to_string())
    return df
