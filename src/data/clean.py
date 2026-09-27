import pandas as pd


def clean(df, config):
    df = df.copy()
    for col in [config["COL_FOLLOWERS"], config["COL_COMMENTS"], config["COL_COLLABS"], config["COL_DISCOUNT_USES"]]:
        df[col] = df[col].astype('int64')
    for col in [config["COL_ENGAGEMENT"], config["COL_COST"], config["COL_REVENUE"]]:
        df[col] = df[col].astype('float64')
    for col in [config["COL_FOLLOWERS"], config["COL_COST"], config["COL_REVENUE"], config["COL_ENGAGEMENT"], config["COL_COMMENTS"]]:
        Q1, Q3 = df[col].quantile(0.25), df[col].quantile(0.75)
        IQR = Q3 - Q1
        df[col] = df[col].clip(Q1 - 1.5 * IQR, Q3 + 1.5 * IQR)
    before = len(df)
    df = df.drop_duplicates(subset=[config["COL_ID"], config["COL_COST"]]).reset_index(drop=True)
    print(f'Clean: dedup removed {before - len(df)} rows')
    df['target_numeric'] = df[config["COL_TARGET"]].map(config["TARGET_MAP"])
    df['target_label'] = df['target_numeric'].map(config["TARGET_LABELS"])
    df['follower_tier'] = df[config["COL_FOLLOWERS"]].apply(
        lambda n: 'Micro' if n < config['FOLLOWER_MICRO'] else ('Macro' if n < config['FOLLOWER_MACRO'] else 'Mega')
    )
    df[config["COL_PLATFORM"]] = df[config["COL_PLATFORM"]].str.strip().str.title()
    df.to_csv(config["PROCESSED_CSV"], index=False, encoding='utf-8')
    print(f"Cleaned data saved: {config['PROCESSED_CSV']} | shape={df.shape}")
    return df
