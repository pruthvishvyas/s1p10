import sys

from config.config import CONFIG
from src.data.ingest import load_and_validate
from src.data.clean import clean
from src.features.engineer import engineer
from src.analytics.eda import run_eda
from src.models.classify import run_classification
from src.models.segment import run_segmentation
from src.models.forecast import run_forecast
from src.analytics.business import run_business_logic
from src.analytics.insights import run_insights
from src.reporting.export import export


def main():
    phases = [
        ('Ingestion', lambda df: load_and_validate(CONFIG), True),
        ('Cleaning', lambda df: clean(df, CONFIG), True),
        ('Engineering', lambda df: engineer(df, CONFIG), True),
        ('EDA', lambda df: run_eda(df, CONFIG) or df, False),
        ('Classify', lambda df: run_classification(df, CONFIG), False),
        ('Segment', lambda df: run_segmentation(df, CONFIG), False),
        ('Forecast', lambda df: run_forecast(df, CONFIG) or df, False),
        ('Business', lambda df: run_business_logic(df, CONFIG), False),
        ('Insights', lambda df: run_insights(df, CONFIG) or df, False),
        ('Export', lambda df: export(df, CONFIG) or df, False),
    ]
    df = None
    for name, fn, critical in phases:
        try:
            print(f'--- Phase: {name} ---')
            result = fn(df)
            if result is not None and hasattr(result, 'shape'):
                df = result
        except Exception as e:
            print(f'Phase {name} FAILED: {e}')
            if critical:
                sys.exit(1)
    print('Pipeline complete.')


if __name__ == '__main__':
    main()
