import pandas as pd


def load_and_validate(config):
    df = pd.read_csv(config["RAW_CSV"])
    expected = [
        config["COL_ID"], config["COL_PLATFORM"], config["COL_NICHE"],
        config["COL_FOLLOWERS"], config["COL_ENGAGEMENT"], config["COL_COMMENTS"],
        config["COL_COLLABS"], config["COL_COST"], config["COL_DISCOUNT_USES"],
        config["COL_REVENUE"], config["COL_TARGET"],
    ]
    missing = [c for c in expected if c not in df.columns]
    print(f'Ingest: {len(df)} rows | Schema OK: {not missing}')
    if missing:
        print('Missing columns:', missing)
    tc = df[config["COL_TARGET"]].value_counts(normalize=True) * 100
    print('Target balance:', tc.round(1).to_dict())
    return df
