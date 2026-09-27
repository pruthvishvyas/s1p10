import pandas as pd
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import openpyxl
from openpyxl.utils.dataframe import dataframe_to_rows


def export(df, config):
    fig = make_subplots(rows=2, cols=2, subplot_titles=('ROI Rate by Platform', 'Audience Quality by Tier', 'Cost vs Revenue', 'Partnership Priority'))
    pr = df.groupby(config['COL_PLATFORM']).apply(lambda x: (x[config['COL_TARGET']] == 'Yes').mean() * 100)
    fig.add_trace(go.Bar(x=pr.index.tolist(), y=pr.values.tolist(), name='ROI Rate %', marker_color='#3498db'), row=1, col=1)
    if 'influencer_tier' in df.columns:
        for t in ['Gold Tier', 'Silver Tier', 'Bronze Tier']:
            sub = df[df['influencer_tier'] == t]
            if len(sub):
                fig.add_trace(go.Box(y=sub['audience_quality_score'].tolist(), name=t), row=1, col=2)
    colors_roi = df[config['COL_TARGET']].map({'Yes': '#2ecc71', 'No': '#e74c3c'}).tolist()
    fig.add_trace(go.Scatter(x=df[config['COL_COST']].tolist(), y=df[config['COL_REVENUE']].tolist(), mode='markers', marker=dict(color=colors_roi, size=6, opacity=0.7), name='Campaigns'), row=2, col=1)
    if 'partnership_priority' in df.columns:
        pp = df['partnership_priority'].value_counts()
        fig.add_trace(go.Bar(x=pp.index.tolist(), y=pp.values.tolist(), name='Priority'), row=2, col=2)
    fig.update_layout(title='Influencer Marketing ROI Intelligence Dashboard', height=700, template='plotly_white')
    fig.write_html(config['REPORTS_DIR'] + 'interactive_dashboard.html')

    wb = openpyxl.Workbook()
    wb.remove(wb.active)

    def ws(df_, name):
        s = wb.create_sheet(title=name[:31])
        for row in dataframe_to_rows(df_.reset_index(drop=True), index=False, header=True):
            s.append(row)

    ws(df, 'Full Campaign Dataset')
    kpi = pd.DataFrame([
        {'KPI': 'Total Campaigns', 'Value': len(df)},
        {'KPI': 'High ROI Campaigns', 'Value': int((df[config['COL_TARGET']] == 'Yes').sum())},
        {'KPI': 'High ROI Rate (%)', 'Value': round((df[config['COL_TARGET']] == 'Yes').mean() * 100, 2)},
        {'KPI': 'Mean ROI Ratio', 'Value': round(df['roi_ratio'].mean(), 3) if 'roi_ratio' in df.columns else 0},
        {'KPI': 'Total Revenue USD', 'Value': round(df[config['COL_REVENUE']].sum(), 2)},
    ])
    ws(kpi, 'KPI Summary')
    pa = df.groupby(config['COL_PLATFORM']).agg(
        Campaigns=('roi_ratio', 'count'),
        High_ROI_Rate=(config['COL_TARGET'], lambda x: round((x == 'Yes').mean() * 100, 2)),
        Mean_Revenue=(config['COL_REVENUE'], 'mean'),
    ).round(2).reset_index()
    ws(pa, 'Platform Analysis')
    na = df.groupby(config['COL_NICHE']).agg(
        Campaigns=('roi_ratio', 'count'),
        Mean_ROI=('roi_ratio', 'mean'),
        High_ROI_Rate=(config['COL_TARGET'], lambda x: round((x == 'Yes').mean() * 100, 2)),
    ).round(2).reset_index() if 'roi_ratio' in df.columns else pd.DataFrame()
    ws(na, 'Niche Analysis')
    if 'partnership_priority' in df.columns:
        ws(df.groupby('partnership_priority').agg(Count=('roi_ratio', 'count'), Mean_ROI=('roi_ratio', 'mean')).round(3).reset_index(), 'Partnership Priority')
    if 'influencer_tier' in df.columns:
        ws(df[df['influencer_tier'] == 'Gold Tier'].sort_values('roi_ratio', ascending=False), 'Gold Tier Influencers')
    if 'is_campaign_anomaly' in df.columns:
        ws(df[df['is_campaign_anomaly'] == 1], 'Anomalous Campaigns')
    if 'partnership_priority' in df.columns:
        ws(df[df['partnership_priority'] == 'P1_STRATEGIC_PARTNER'], 'P1 Strategic Partners')
    wb.save(config['REPORTS_DIR'] + 'influencer_roi_report.xlsx')
    print('Export complete: interactive_dashboard.html + influencer_roi_report.xlsx')
    return df
