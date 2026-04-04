# ML Optimization Workflow (Colab)

Use `ml/colab_per_process_compare.py` in Google Colab to compare:
- Linear Regression
- Random Forest
- XGBoost (optional if installed)

## Quick steps

1. Upload `datasets/all_processes_from_pdf.csv` to Colab (`/content/`).
2. Run:
   ```python
   !pip -q install xgboost
   ```
3. Copy and run `ml/colab_per_process_compare.py`.
4. Download `/content/ml_models_by_process.json`.
5. Replace `src/data/ml_models_by_process.json` in this repo.
6. Run `npm run build` and deploy.

## Notes

- The website currently supports direct inference for `linear_regression` artifacts.
- Random Forest / XGBoost are compared in Colab for quality decisions.
- If you want browser-side inference for tree models, we can add an exported-tree inference format next.
