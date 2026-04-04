"""
Colab script: per-process model comparison (Linear vs RandomForest vs XGBoost)

Usage in Colab:
1) Upload datasets/all_processes_from_pdf.csv
2) Run: !pip -q install xgboost
3) Run this script cell-by-cell
"""

import json
import numpy as np
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score

try:
    from xgboost import XGBRegressor
    HAS_XGB = True
except Exception:
    HAS_XGB = False

CSV_PATH = '/content/all_processes_from_pdf.csv'
FEATURES = ['condition_1_value', 'condition_2_value', 'condition_3_value', 'condition_4_value']
TARGET = 'recoveryRate'


def evaluate_models_per_process(df: pd.DataFrame):
    summaries = []
    best_models = {}

    for process, g in df.groupby('processName'):
        X = g[FEATURES].astype(float)
        y = g[TARGET].astype(float)

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )

        candidates = {
            'linear_regression': LinearRegression(),
            'random_forest': RandomForestRegressor(
                n_estimators=300,
                max_depth=None,
                min_samples_leaf=1,
                random_state=42,
            ),
        }

        if HAS_XGB:
            candidates['xgboost'] = XGBRegressor(
                n_estimators=300,
                learning_rate=0.05,
                max_depth=6,
                subsample=0.9,
                colsample_bytree=0.9,
                objective='reg:squarederror',
                random_state=42,
            )

        proc_scores = []
        trained = {}

        for name, model in candidates.items():
            model.fit(X_train, y_train)
            pred = model.predict(X_test)
            proc_scores.append({
                'processName': process,
                'model': name,
                'mae': float(mean_absolute_error(y_test, pred)),
                'r2': float(r2_score(y_test, pred)),
            })
            trained[name] = model

        summaries.extend(proc_scores)

        # pick best by R2, tie-breaker lower MAE
        proc_scores_sorted = sorted(proc_scores, key=lambda x: (x['r2'], -x['mae']), reverse=True)
        winner = proc_scores_sorted[0]['model']
        winner_model = trained[winner]

        ranges = []
        labels = [g.iloc[0]['condition_1_name'], g.iloc[0]['condition_2_name'], g.iloc[0]['condition_3_name'], g.iloc[0]['condition_4_name']]
        for k in FEATURES:
            ranges.append({
                'key': k,
                'min': float(g[k].min()),
                'max': float(g[k].max()),
            })

        if winner == 'linear_regression':
            best_models[process] = {
                'model_type': 'linear_regression',
                'features': FEATURES,
                'feature_labels': labels,
                'intercept': float(winner_model.intercept_),
                'coefficients': [float(v) for v in winner_model.coef_],
                'ranges': ranges,
                'metrics': {k: v for k, v in proc_scores_sorted[0].items() if k in ('mae', 'r2')},
                'samples': int(len(g)),
            }

    report_df = pd.DataFrame(summaries).sort_values(['processName', 'r2'], ascending=[True, False])
    return report_df, best_models


def export_linear_models_json(best_models, path='/content/ml_models_by_process.json'):
    out = {
        'generatedAt': pd.Timestamp.utcnow().isoformat(),
        'model_family': 'per_process_best_model',
        'feature_keys': FEATURES,
        'target_key': TARGET,
        'processes': best_models,
    }
    with open(path, 'w') as f:
        json.dump(out, f, indent=2)
    print('Saved:', path)


if __name__ == '__main__':
    df = pd.read_csv(CSV_PATH)
    summary, best_models = evaluate_models_per_process(df)
    print(summary)
    print('\nAverage by model:')
    print(summary.groupby('model')[['mae', 'r2']].mean().sort_values('r2', ascending=False))
    export_linear_models_json(best_models)
