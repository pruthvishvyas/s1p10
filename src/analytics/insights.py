import json


def run_insights(df, config):
    insights = []

    def add(category, finding, evidence, action, severity):
        insights.append({
            'category': category,
            'finding': finding,
            'evidence': evidence,
            'action': action,
            'severity': severity,
        })

    total = len(df)
    high_n = int((df[config['COL_TARGET']] == 'Yes').sum())
    high_pct = round(high_n / max(total, 1) * 100, 1)
    add('CAMPAIGN_ROI_PREVALENCE', f'{high_pct}% of {total} campaigns delivered High ROI', f'High ROI: {high_n} | Low: {total - high_n}', 'Use as baseline for new campaign ROI targets', 'HIGH')

    plat_roi = df.groupby(config['COL_PLATFORM']).apply(lambda x: (x[config['COL_TARGET']] == 'Yes').mean() * 100)
    best_p = plat_roi.idxmax()
    add('BEST_PLATFORM', f'{best_p} leads with {round(plat_roi.max(), 1)}% High ROI rate', str(plat_roi.round(1).to_dict()), f'Concentrate budget toward {best_p}', 'HIGH')

    if 'roi_ratio' in df.columns:
        nr = df.groupby(config['COL_NICHE'])['roi_ratio'].mean()
        bn = nr.idxmax()
        add('BEST_NICHE', f'{bn} niche delivers highest mean ROI of {round(nr.max(), 2)}x', str(nr.round(2).to_dict()), f'Prioritise {bn} niche for premium campaigns', 'HIGH')

    if 'follower_tier' in df.columns:
        micro = df[df['follower_tier'] == 'Micro'][config['COL_TARGET']].eq('Yes').mean() * 100
        mega = df[df['follower_tier'] == 'Mega'][config['COL_TARGET']].eq('Yes').mean() * 100
        better = 'Micro' if micro > mega else 'Mega'
        add('MICRO_VS_MEGA', f'{better}-influencers outperform by {round(abs(micro - mega), 1)} ppt', f'Micro={micro:.1f}% | Mega={mega:.1f}%', f'Allocate more budget to {better}-influencers', 'HIGH')

    if 'roi_ratio' in df.columns:
        ec = round(df['Engagement_Rate_Pct'].corr(df['roi_ratio']), 3) if 'Engagement_Rate_Pct' in df.columns else 0
        add('ENGAGEMENT_ROI_CORRELATION', f'Engagement-ROI correlation: {ec}', f'Pearson r={ec}', 'Weight composite audience_quality_score over raw engagement rate', 'MEDIUM')
        if 'cost_per_discount_use' in df.columns:
            h_cpu = round(df[df[config['COL_TARGET']] == 'Yes']['cost_per_discount_use'].median(), 2)
            l_cpu = round(df[df[config['COL_TARGET']] == 'No']['cost_per_discount_use'].median(), 2)
            add('COST_EFFICIENCY_FINDING', f'High ROI CPA=${h_cpu} vs Low ROI CPA=${l_cpu}', f'Difference: ${round(l_cpu - h_cpu, 2)}', f'Set ${config["COST_PER_USE_THRESHOLD"]} max CPA in all campaign briefs', 'HIGH')

    if 'platform_niche_combo' in df.columns and 'roi_ratio' in df.columns:
        combo = df.groupby('platform_niche_combo')['roi_ratio'].mean()
        bc = combo.idxmax()
        add('TOP_PLATFORM_NICHE_COMBO', f'{bc} is top combo with mean ROI {round(combo.max(), 2)}x', str(combo.sort_values(ascending=False).head(3).round(2).to_dict()), f'Create dedicated packages for {bc} partnerships', 'HIGH')

    if 'is_campaign_anomaly' in df.columns:
        ac = int(df['is_campaign_anomaly'].sum())
        add('ANOMALY_PROFILE', f'{ac} anomalous campaigns flagged for manual review', f'Anomaly count={ac}', 'Audit anomalous campaigns for fraud or brief misalignment', 'MEDIUM')

    if 'influencer_tier' in df.columns and 'roi_ratio' in df.columns:
        gold = df[df['influencer_tier'] == 'Gold Tier']
        add('GOLD_TIER_PROFILE', f'Gold Tier: {len(gold)} influencers | mean ROI {round(gold["roi_ratio"].mean(), 2)}x | mean engagement {round(gold["Engagement_Rate_Pct"].mean(), 2)}%', f'N={len(gold)}', 'Use Gold Tier profile as recruitment benchmark', 'HIGH')

    add('MODEL_PERFORMANCE', 'ROI Prediction Model deployed for pre-spend screening', 'roi_classifier.pkl trained on 14 features', 'Use model to screen new influencers before contract signing', 'MEDIUM')

    out = config['REPORTS_DIR'] + 'insights.json'
    with open(out, 'w', encoding='utf-8') as f:
        json.dump(insights, f, indent=2, default=str)
    print(f'Insights: {len(insights)} saved to {out}')
    return df
