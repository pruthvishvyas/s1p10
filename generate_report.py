import json, os, sys
import pandas as pd

CONFIG = {
    'FEAT_CSV':    'data/processed/campaigns_features.csv',
    'REPORTS_DIR': 'reports/',
    'MODELS_DIR':  'models/',
    'COL_PLATFORM':'Platform',
    'COL_NICHE':   'Audience_Niche',
    'COL_TARGET':  'High_ROI_Campaign',
    'COL_COST':    'Campaign_Cost_USD',
    'COL_REVENUE': 'Revenue_Generated_USD',
    'COL_ENGAGEMENT':'Engagement_Rate_Pct',
    'COL_FOLLOWERS':'Follower_Count',
}

if not os.path.exists(CONFIG['FEAT_CSV']):
    print('ERROR: Feature CSV not found. Run main.py first.')
    sys.exit(1)

df = pd.read_csv(CONFIG['FEAT_CSV'])

insights = []
ins_path = CONFIG['REPORTS_DIR'] + 'insights.json'
if os.path.exists(ins_path):
    with open(ins_path,'r',encoding='utf-8') as f:
        insights = json.load(f)

total    = len(df)
high_n   = int((df[CONFIG['COL_TARGET']] == 'Yes').sum())
high_pct = round(high_n / max(total,1) * 100, 1)
mean_roi = round(df['roi_ratio'].mean(), 2) if 'roi_ratio' in df.columns else 0.0
tot_rev  = round(df[CONFIG['COL_REVENUE']].sum(), 2)
tot_cost = round(df[CONFIG['COL_COST']].sum(), 2)
plat_roi = df.groupby(CONFIG['COL_PLATFORM']).apply(lambda x: (x[CONFIG['COL_TARGET']] == 'Yes').mean() * 100)
best_plat = plat_roi.idxmax()
best_prate = round(plat_roi.max(), 1)
niche_roi = df.groupby(CONFIG['COL_NICHE'])['roi_ratio'].mean() if 'roi_ratio' in df.columns else pd.Series(dtype=float)
best_niche = niche_roi.idxmax() if len(niche_roi) > 0 else 'N/A'
best_nroi  = round(niche_roi.max(), 2) if len(niche_roi) > 0 else 0.0
gold_n = len(df[df['influencer_tier']=='Gold Tier']) if 'influencer_tier' in df.columns else 0
anom_n = int(df['is_campaign_anomaly'].sum()) if 'is_campaign_anomaly' in df.columns else 0
p1_n   = int((df['partnership_priority']=='P1_STRATEGIC_PARTNER').sum()) if 'partnership_priority' in df.columns else 0
clf_ok  = os.path.exists(CONFIG['MODELS_DIR']+'roi_classifier.pkl')
rev_ok  = os.path.exists(CONFIG['MODELS_DIR']+'revenue_forecaster.pkl')
seg_ok  = os.path.exists(CONFIG['MODELS_DIR']+'influencer_segmenter.pkl')
ano_ok  = os.path.exists(CONFIG['MODELS_DIR']+'campaign_anomaly_detector.pkl')

slides = []
def S(t): slides.append(t)

S('SLIDE 1 -- INFLUENCER MARKETING ROI INTELLIGENCE REPORT')
S(f'Total campaigns analysed: {total}')
S(f'Total campaign spend: ${tot_cost:,.2f}  |  Total attributed revenue: ${tot_rev:,.2f}')
S(f'Mean ROI ratio across portfolio: {mean_roi}x')

S('SLIDE 2 -- THE BUSINESS PROBLEM')
S('Brands allocate large budgets to influencer marketing without a systematic way to predict')
S('which influencers will deliver high return on investment before committing spend.')
S('This pipeline replaces intuition-based influencer selection with data-driven ROI prediction,')
S('automated influencer tier scoring, and a rules-based campaign intelligence engine.')

S('SLIDE 3 -- CAMPAIGN PORTFOLIO OVERVIEW')
S(f'Total campaigns: {total} | High ROI: {high_n} ({high_pct}%) | Low ROI: {total-high_n} ({100-high_pct}%)')
S('Platform mix: ' + ' | '.join(f'{k}: {v}' for k,v in df[CONFIG['COL_PLATFORM']].value_counts().items()))
S('Niche mix: ' + ' | '.join(f'{k}: {v}' for k,v in df[CONFIG['COL_NICHE']].value_counts().head(5).items()))
fol_tier = df['follower_tier'].value_counts().to_dict() if 'follower_tier' in df.columns else {}
S('Follower tier mix: ' + str(fol_tier))

S('SLIDE 4 -- ROI PERFORMANCE BASELINE')
S(f'High ROI rate: {high_pct}% of all campaigns')
S(f'Mean ROI ratio: {mean_roi}x (revenue per dollar spent)')
top_roi = df.nlargest(3,'roi_ratio')[['Follower_Count','Campaign_Cost_USD','roi_ratio']].to_string() if 'roi_ratio' in df.columns else ''
S('Top 3 campaigns by ROI ratio:')
S(top_roi)

S('SLIDE 5 -- PLATFORM PERFORMANCE ANALYSIS')
S(f'Best platform by ROI rate: {best_plat} ({best_prate}% High ROI campaigns)')
plat_full = df.groupby(CONFIG['COL_PLATFORM']).agg(
    Campaigns=('roi_ratio','count'),
    High_ROI_Rate=(CONFIG['COL_TARGET'], lambda x: round((x == 'Yes').mean()*100,1)),
    Mean_ROI=('roi_ratio','mean')
).round(2) if 'roi_ratio' in df.columns else pd.DataFrame()
S(plat_full.to_string())

S('SLIDE 6 -- NICHE & AUDIENCE ANALYSIS')
S(f'Best niche: {best_niche} (mean ROI ratio {best_nroi}x)')
niche_full = df.groupby(CONFIG['COL_NICHE']).agg(
    Campaigns=('roi_ratio','count'),
    Mean_ROI=('roi_ratio','mean'),
    High_ROI_Rate=(CONFIG['COL_TARGET'], lambda x: round((x == 'Yes').mean()*100,1))
).round(2).sort_values('Mean_ROI', ascending=False) if 'roi_ratio' in df.columns else pd.DataFrame()
S(niche_full.to_string())

S('SLIDE 7 -- FEATURE ENGINEERING: THE 12 PERFORMANCE SIGNALS')
S('roi_ratio                    : Revenue/Cost — fundamental campaign efficiency metric')
S('cost_per_discount_use        : Cost per tracked conversion — spend efficiency')
S('revenue_per_follower         : Revenue yield per audience member — cuts vanity metrics')
S('conversion_rate              : % followers who used discount — persuasion power')
S('engagement_to_cost_efficiency: Engagement x Conversions / Cost — combined quality signal')
S('audience_quality_score       : Composite 0-1 quality index normalised across platforms')
S('influencer_experience_score  : Log(collabs) — commercial reliability proxy')
S('revenue_per_comment          : Comment-to-revenue conversion — intent signal')
S('cost_efficiency_tier         : Elite/Good/Fair/Poor cost bucket label')
S('follower_tier                : Micro/Macro/Mega segmentation')
S('engagement_tier              : Elite/Healthy/Low engagement label')
S('platform_niche_combo         : Channel x Vertical interaction feature')

S('SLIDE 8 -- ROI PREDICTION MODEL')
S(f'Model ready: {clf_ok}')
S('Algorithm: Gradient Boosting Classifier (best of LR / RF / GBM by AUC)')
S('Task: Predict probability of High ROI before campaign spend is committed')
S('Input: 14 influencer profile and performance features')
S('Output: Binary High/Low ROI prediction + probability score (0-1)')
S('Use case: Campaign managers score new influencers before contracting')

S('SLIDE 9 -- REVENUE FORECASTING MODEL')
S(f'Model ready: {rev_ok}')
S('Algorithm: Gradient Boosting Regressor')
S('Task: Forecast expected revenue from a campaign given influencer profile and budget')
S('Key safety: roi_ratio excluded from features to prevent data leakage')
S('Use case: Budget approval workflow — present predicted revenue range to finance team')

S('SLIDE 10 -- INFLUENCER TIER MATRIX')
S(f'Gold Tier influencers: {gold_n} — highest ROI and audience quality — priority partners')
if 'influencer_tier' in df.columns:
    tier_sum = df.groupby('influencer_tier').agg(
        Count=('roi_ratio','count'),
        Mean_ROI=('roi_ratio','mean'),
        Mean_Engagement=(CONFIG['COL_ENGAGEMENT'],'mean'),
        Mean_AQ_Score=('audience_quality_score','mean')
    ).round(3) if 'roi_ratio' in df.columns else pd.DataFrame()
    S(tier_sum.to_string())
S('Gold Tier  = prioritise for flagship campaigns and preferred rate negotiations')
S('Silver Tier = reliable performers for steady-state campaigns')
S('Bronze Tier = test with small budgets only')

S('SLIDE 11 -- PARTNERSHIP PRIORITY INTELLIGENCE')
S(f'P1 Strategic Partners: {p1_n} influencers — high ROI confirmed + strong engagement')
S('P1_STRATEGIC_PARTNER  = flagship campaigns + preferred rate negotiation')
S('P2_RECOMMENDED        = high ROI confirmed or strong eng + low CPA')
S('P3_MONITOR            = mid-range — watch and re-evaluate after next campaign')
S('P4_REVIEW_REQUIRED    = negative ROI, expensive conversions, or zero conversions')
S('P5_DO_NOT_REBOOK      = negative ROI + poor engagement or zero conversions')
if 'partnership_priority' in df.columns:
    pp_sum = df['partnership_priority'].value_counts()
    S(pp_sum.to_string())

S('SLIDE 12 -- KEY MARKETING INSIGHTS')
high_ins = [i for i in insights if i.get('severity') == 'HIGH'][:5]
for ins in high_ins:
    S(f"{ins['category']}: {ins['finding']}")
    S(f"  Evidence: {ins['evidence']}")
    S(f"  Action:   {ins['action']}")

S('SLIDE 13 -- STRATEGIC RECOMMENDATIONS')
S(f'1. Concentrate budget on {best_plat} — leading platform with {best_prate}% ROI rate')
S(f'2. Prioritise {best_niche} niche campaigns — highest mean ROI of {best_nroi}x')
S(f'3. Use ROI Prediction Model to screen all new influencer proposals before contracting')
S('4. Set $50 maximum cost-per-conversion KPI in all campaign briefs')
S(f'5. Review {anom_n} anomalous campaigns for influencer fraud or brief misalignment')

S('SLIDE 14 -- TECHNICAL ARCHITECTURE')
S('Pipeline: 15 phases | Config -> Ingest -> Clean -> Engineer -> EDA -> Classify -> Segment -> Forecast -> Business -> Insights -> Export -> Frontend -> Report -> README -> Scaffold')
S('Models: ROI Classifier | Revenue Forecaster | Influencer Segmenter | Anomaly Detector')
S('Outputs: influencer_roi_analysis.ipynb | main.py | export_for_frontend.py')
S('         generate_report.py | generate_readme.py | reports/ | models/')
S('SaaS layer: reports/frontend/ -> 7 JSON files -> Cloudflare-hosted dashboard')

output = chr(10).join(slides)
output = output.replace(chr(0xfffd), '-')
out_path = CONFIG['REPORTS_DIR'] + 'executive_report.txt'
with open(out_path, 'w', encoding='utf-8') as f:
    f.write(output)
print(f'Report saved: {out_path}')
print(f'Lines: {len(output.splitlines())} | Chars: {len(output)} | Slides: {len(slides)}')
