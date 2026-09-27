import pandas as pd
import numpy as np


def engineer(df, config):
    df = df.copy()
    df['roi_ratio'] = df[config['COL_REVENUE']] / df[config['COL_COST']].replace(0, 1)
    df['cost_per_discount_use'] = df[config['COL_COST']] / df[config['COL_DISCOUNT_USES']].replace(0, 1)
    df['revenue_per_follower'] = df[config['COL_REVENUE']] / df[config['COL_FOLLOWERS']].replace(0, 1)
    df['conversion_rate'] = df[config['COL_DISCOUNT_USES']] / df[config['COL_FOLLOWERS']].replace(0, 1)
    df['engagement_to_cost_efficiency'] = (df[config['COL_ENGAGEMENT']] * df[config['COL_DISCOUNT_USES']]) / df[config['COL_COST']].replace(0, 1)

    def normalize(s):
        return (s - s.min()) / (s.max() - s.min() + 1e-9)

    df['comments_per_follower'] = df[config['COL_COMMENTS']] / df[config['COL_FOLLOWERS']].replace(0, 1)
    df['audience_quality_score'] = 0.4 * normalize(df[config['COL_ENGAGEMENT']]) + 0.3 * normalize(df['conversion_rate']) + 0.3 * normalize(df['comments_per_follower'])
    df['influencer_experience_score'] = np.log1p(df[config['COL_COLLABS']])
    df['revenue_per_comment'] = df[config['COL_REVENUE']] / df[config['COL_COMMENTS']].replace(0, 1)
    df['cost_efficiency_tier'] = pd.cut(
        df['cost_per_discount_use'],
        bins=[0, 25, 50, 100, float('inf')],
        labels=['Elite', 'Good', 'Fair', 'Poor'],
    )
    if 'follower_tier' not in df.columns:
        df['follower_tier'] = df[config['COL_FOLLOWERS']].apply(
            lambda n: 'Micro' if n < config['FOLLOWER_MICRO'] else ('Macro' if n < config['FOLLOWER_MACRO'] else 'Mega')
        )
    df['engagement_tier'] = df[config['COL_ENGAGEMENT']].apply(
        lambda x: 'Elite' if x >= config['ENGAGEMENT_HIGH'] else ('Healthy' if x >= config['ENGAGEMENT_MEDIUM'] else 'Low')
    )
    df['platform_niche_combo'] = df[config['COL_PLATFORM']].astype(str) + '_' + df[config['COL_NICHE']].astype(str)
    df.to_csv(config['FEAT_CSV'], index=False, encoding='utf-8')
    print(f'Engineering complete | shape={df.shape}')
    return df
