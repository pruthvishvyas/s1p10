import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np


def run_eda(df, config):
    plt.rcParams.update({'figure.dpi': 150, 'axes.spines.top': False, 'axes.spines.right': False})
    rd = config['REPORTS_DIR']

    fig, ax = plt.subplots(figsize=(7, 4))
    vc = df[config['COL_TARGET']].value_counts()
    colors = ['#2ecc71' if k == 'Yes' else '#e74c3c' for k in vc.index]
    bars = ax.bar(vc.index, vc.values, color=colors, edgecolor='white')
    for b in bars:
        ax.text(b.get_x() + b.get_width() / 2, b.get_height() + 0.5, f'{b.get_height()} ({b.get_height() / len(df) * 100:.1f}%)', ha='center', va='bottom', fontsize=10)
    ax.set_title('Campaign ROI Outcome Distribution')
    ax.set_xlabel('Outcome')
    ax.set_ylabel('Count')
    plt.tight_layout()
    plt.savefig(rd + 'eda_01_roi_outcome_distribution.png', dpi=150, bbox_inches='tight')
    plt.close()

    fig, ax = plt.subplots(figsize=(8, 5))
    plat_roi = df.groupby(config['COL_PLATFORM']).apply(lambda x: (x[config['COL_TARGET']] == 'Yes').mean() * 100).sort_values(ascending=False)
    ax.bar(plat_roi.index, plat_roi.values, color='#3498db', edgecolor='white')
    ax.set_title('High ROI Rate by Platform')
    ax.set_xlabel('Platform')
    ax.set_ylabel('% High ROI')
    plt.tight_layout()
    plt.savefig(rd + 'eda_02_platform_roi_rate.png', dpi=150, bbox_inches='tight')
    plt.close()

    fig, ax = plt.subplots(figsize=(8, 5))
    if 'roi_ratio' in df.columns:
        colors_map = df[config['COL_TARGET']].map({'Yes': '#2ecc71', 'No': '#e74c3c'})
        ax.scatter(df[config['COL_ENGAGEMENT']], df['roi_ratio'], c=colors_map, alpha=0.6, edgecolors='white')
    ax.set_title('Engagement Rate vs ROI Ratio')
    ax.set_xlabel('Engagement Rate (%)')
    ax.set_ylabel('ROI Ratio')
    plt.tight_layout()
    plt.savefig(rd + 'eda_05_engagement_vs_roi_scatter.png', dpi=150, bbox_inches='tight')
    plt.close()

    numeric_cols = [c for c in ['Follower_Count', 'Engagement_Rate_Pct', 'Campaign_Cost_USD', 'Revenue_Generated_USD', 'roi_ratio', 'audience_quality_score', 'target_numeric'] if c in df.columns]
    corr = df[numeric_cols].corr()
    mask = np.triu(np.ones_like(corr, dtype=bool))
    fig, ax = plt.subplots(figsize=(10, 8))
    sns.heatmap(corr, mask=mask, annot=True, fmt='.2f', cmap='RdYlGn', center=0, ax=ax, linewidths=0.5)
    ax.set_title('Feature Correlation Heatmap')
    plt.tight_layout()
    plt.savefig(rd + 'eda_08_correlation_heatmap.png', dpi=150, bbox_inches='tight')
    plt.close()

    print(f'EDA: 4 charts saved to {rd}')
    return df
