
from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import KFold, cross_validate, train_test_split
from sklearn.svm import SVR

try:
    from xgboost import XGBRegressor

    HAS_XGB = True
except Exception:
    HAS_XGB = False


FEATURES = [
    "condition_1_value",
    "condition_2_value",
    "condition_3_value",
    "condition_4_value",
]
TARGET = "recoveryRate"
PROCESS_COL = "processName"


def get_candidates() -> dict:
    candidates = {
        "Linear Regression": LinearRegression(),
        "Random Forest": RandomForestRegressor(
            n_estimators=300, random_state=42, min_samples_leaf=1
        ),
        "SVR (RBF)": SVR(C=20.0, gamma="scale", epsilon=0.2),
    }
    if HAS_XGB:
        candidates["XGBoost"] = XGBRegressor(
            n_estimators=250,
            learning_rate=0.05,
            max_depth=5,
            subsample=0.9,
            colsample_bytree=0.9,
            objective="reg:squarederror",
            random_state=42,
        )
    return candidates


def evaluate_per_process(df: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame]:
    rows = []
    pred_rows = []
    candidates = get_candidates()

    for process, g in df.groupby(PROCESS_COL):
        X = g[FEATURES].astype(float)
        y = g[TARGET].astype(float)

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        cv = KFold(n_splits=min(5, len(g)), shuffle=True, random_state=42)

        model_reports = []
        trained_models = {}

        for model_name, model in candidates.items():
            scores = cross_validate(
                model,
                X,
                y,
                cv=cv,
                scoring=("r2", "neg_mean_absolute_error"),
                n_jobs=None,
            )
            cv_r2 = float(np.mean(scores["test_r2"]))
            cv_mae = float(-np.mean(scores["test_neg_mean_absolute_error"]))

            model.fit(X_train, y_train)
            y_pred = model.predict(X_test)
            holdout_r2 = float(r2_score(y_test, y_pred))
            holdout_mae = float(mean_absolute_error(y_test, y_pred))

            report = {
                "processName": process,
                "model": model_name,
                "cv_r2": cv_r2,
                "cv_mae": cv_mae,
                "holdout_r2": holdout_r2,
                "holdout_mae": holdout_mae,
                "samples": int(len(g)),
            }
            rows.append(report)
            model_reports.append(report)
            trained_models[model_name] = model

        winner = sorted(model_reports, key=lambda d: (d["cv_r2"], -d["cv_mae"]), reverse=True)[
            0
        ]
        best_model_name = winner["model"]
        best_model = trained_models[best_model_name]
        best_pred = best_model.predict(X_test)

        for actual, pred in zip(y_test, best_pred):
            pred_rows.append(
                {
                    "processName": process,
                    "best_model": best_model_name,
                    "actual": float(actual),
                    "predicted": float(pred),
                    "residual": float(actual - pred),
                }
            )

    return pd.DataFrame(rows), pd.DataFrame(pred_rows)


def save_table_images(df_summary: pd.DataFrame, outdir: Path) -> None:
    table_df = (
        df_summary.groupby("model")[["cv_r2", "cv_mae", "holdout_r2", "holdout_mae"]]
        .mean()
        .round(3)
        .sort_values("cv_r2", ascending=False)
    )
    table_df.to_csv(outdir / "table_model_average_metrics.csv")


def graph_model_comparison(df_summary: pd.DataFrame, outdir: Path) -> None:
    avg = (
        df_summary.groupby("model")[["cv_r2", "cv_mae"]]
        .mean()
        .reset_index()
        .sort_values("cv_r2", ascending=False)
    )

    plt.figure(figsize=(8, 5))
    sns.barplot(data=avg, x="model", y="cv_r2", hue="model", legend=False)
    plt.title("Model Comparison: Mean CV R2")
    plt.xlabel("Model")
    plt.ylabel("Mean CV R2")
    plt.xticks(rotation=20, ha="right")
    plt.tight_layout()
    plt.savefig(outdir / "01_model_comparison_cv_r2.png", dpi=300)
    plt.close()

    plt.figure(figsize=(8, 5))
    sns.barplot(data=avg.sort_values("cv_mae"), x="model", y="cv_mae", hue="model", legend=False)
    plt.title("Model Comparison: Mean CV MAE")
    plt.xlabel("Model")
    plt.ylabel("Mean CV MAE (Lower Better)")
    plt.xticks(rotation=20, ha="right")
    plt.tight_layout()
    plt.savefig(outdir / "02_model_comparison_cv_mae.png", dpi=300)
    plt.close()


def graph_process_heatmap(df_summary: pd.DataFrame, outdir: Path) -> None:
    piv = df_summary.pivot(index="processName", columns="model", values="cv_r2")
    plt.figure(figsize=(9, 7))
    sns.heatmap(piv, annot=True, fmt=".2f", cmap="RdYlGn", vmin=-1, vmax=1)
    plt.title("CV R2 by Process and Model")
    plt.xlabel("Model")
    plt.ylabel("Process")
    plt.tight_layout()
    plt.savefig(outdir / "03_cv_r2_process_model_heatmap.png", dpi=300)
    plt.close()


def graph_best_model_counts(df_summary: pd.DataFrame, outdir: Path) -> None:
    best = (
        df_summary.sort_values(["processName", "cv_r2", "cv_mae"], ascending=[True, False, True])
        .groupby("processName")
        .head(1)
    )
    cnt = best["model"].value_counts().reset_index()
    cnt.columns = ["model", "count"]

    plt.figure(figsize=(7, 4))
    sns.barplot(data=cnt, x="model", y="count", hue="model", legend=False)
    plt.title("Best Model Count Across Processes")
    plt.xlabel("Best Model")
    plt.ylabel("Number of Processes")
    plt.xticks(rotation=20, ha="right")
    plt.tight_layout()
    plt.savefig(outdir / "04_best_model_count.png", dpi=300)
    plt.close()


def graph_parity_and_residuals(df_pred: pd.DataFrame, outdir: Path) -> None:
    plt.figure(figsize=(7, 6))
    sns.scatterplot(data=df_pred, x="actual", y="predicted", hue="processName", s=45, alpha=0.8, legend=False)
    all_vals = pd.concat([df_pred["actual"], df_pred["predicted"]])
    lo, hi = float(all_vals.min()), float(all_vals.max())
    plt.plot([lo, hi], [lo, hi], "k--", linewidth=1.2)
    plt.title("Parity Plot: Predicted vs Observed (Best Model per Process)")
    plt.xlabel("Observed Recovery Rate")
    plt.ylabel("Predicted Recovery Rate")
    plt.tight_layout()
    plt.savefig(outdir / "05_parity_plot.png", dpi=300)
    plt.close()

    plt.figure(figsize=(8, 5))
    sns.histplot(df_pred["residual"], bins=18, kde=True, color="#D95F02")
    plt.title("Residual Distribution (Actual - Predicted)")
    plt.xlabel("Residual")
    plt.ylabel("Frequency")
    plt.tight_layout()
    plt.savefig(outdir / "06_residual_distribution.png", dpi=300)
    plt.close()


def graph_feature_correlations(df: pd.DataFrame, outdir: Path) -> None:
    corr_cols = FEATURES + [TARGET, "efficiency", "wasteGenerated", "waterUsage", "energyConsumption", "co2Emissions"]
    corr = df[corr_cols].astype(float).corr()
    plt.figure(figsize=(10, 8))
    sns.heatmap(corr, annot=True, fmt=".2f", cmap="coolwarm", center=0)
    plt.title("Pearson Correlation Matrix")
    plt.tight_layout()
    plt.savefig(outdir / "07_correlation_heatmap.png", dpi=300)
    plt.close()


def graph_feature_effects(df: pd.DataFrame, outdir: Path) -> None:
    fig, axes = plt.subplots(2, 2, figsize=(12, 9))
    axes = axes.ravel()
    for i, f in enumerate(FEATURES):
        sns.regplot(
            data=df,
            x=f,
            y=TARGET,
            lowess=True,
            scatter_kws={"alpha": 0.55, "s": 28},
            line_kws={"color": "crimson"},
            ax=axes[i],
        )
        axes[i].set_title(f"Effect of {f} on {TARGET}")
    plt.tight_layout()
    plt.savefig(outdir / "08_feature_effects.png", dpi=300)
    plt.close()


def graph_response_surface(df: pd.DataFrame, outdir: Path) -> None:
    process = "Copper Flotation" if "Copper Flotation" in set(df[PROCESS_COL]) else df[PROCESS_COL].iloc[0]
    g = df[df[PROCESS_COL] == process].copy()
    X = g[FEATURES].astype(float)
    y = g[TARGET].astype(float)

    model = RandomForestRegressor(n_estimators=300, random_state=42)
    model.fit(X, y)

    f1, f2, f3, f4 = FEATURES
    x1 = np.linspace(X[f1].min(), X[f1].max(), 45)
    x2 = np.linspace(X[f2].min(), X[f2].max(), 45)
    xx, yy = np.meshgrid(x1, x2)

    med3 = float(X[f3].median())
    med4 = float(X[f4].median())
    grid = pd.DataFrame({f1: xx.ravel(), f2: yy.ravel(), f3: med3, f4: med4})
    zz = model.predict(grid).reshape(xx.shape)

    max_idx = np.unravel_index(np.argmax(zz), zz.shape)
    best_x, best_y, best_z = xx[max_idx], yy[max_idx], zz[max_idx]

    plt.figure(figsize=(9, 6))
    contour = plt.contourf(xx, yy, zz, levels=25, cmap="YlOrRd")
    plt.colorbar(contour, label="Predicted Recovery Rate")
    plt.scatter([best_x], [best_y], marker="*", s=220, color="cyan", edgecolor="black", linewidth=1.2)
    plt.title(f"Response Surface for {process}\n({f3}={med3:.2f}, {f4}={med4:.2f})")
    plt.xlabel(f1)
    plt.ylabel(f2)
    plt.tight_layout()
    plt.savefig(outdir / "09_response_surface.png", dpi=300)
    plt.close()


def graph_samples_per_process(df: pd.DataFrame, outdir: Path) -> None:
    counts = df[PROCESS_COL].value_counts().reset_index()
    counts.columns = ["processName", "samples"]

    plt.figure(figsize=(10, 6))
    sns.barplot(data=counts, y="processName", x="samples", hue="processName", legend=False)
    plt.title("Samples per Process")
    plt.xlabel("Sample Count")
    plt.ylabel("Process")
    plt.tight_layout()
    plt.savefig(outdir / "10_samples_per_process.png", dpi=300)
    plt.close()


def graph_linear_coefficients(df: pd.DataFrame, outdir: Path) -> None:
    rows = []
    for process, g in df.groupby(PROCESS_COL):
        X = g[FEATURES].astype(float)
        y = g[TARGET].astype(float)
        model = LinearRegression().fit(X, y)
        row = {"processName": process}
        for i, feat in enumerate(FEATURES, start=1):
            row[f"coef_{i}"] = float(model.coef_[i - 1])
        rows.append(row)

    cdf = pd.DataFrame(rows).set_index("processName")
    plt.figure(figsize=(9, 7))
    sns.heatmap(cdf, annot=True, fmt=".2f", cmap="coolwarm", center=0)
    plt.title("Linear Coefficient Heatmap by Process")
    plt.xlabel("Feature Coefficients")
    plt.ylabel("Process")
    plt.tight_layout()
    plt.savefig(outdir / "11_linear_coefficients_heatmap.png", dpi=300)
    plt.close()


def graph_holdout_scatter(df_summary: pd.DataFrame, outdir: Path) -> None:
    best = (
        df_summary.sort_values(["processName", "cv_r2", "cv_mae"], ascending=[True, False, True])
        .groupby("processName")
        .head(1)
    )
    plt.figure(figsize=(7, 5))
    sns.scatterplot(data=best, x="holdout_mae", y="holdout_r2", hue="model", s=80)
    for _, r in best.iterrows():
        plt.text(r["holdout_mae"], r["holdout_r2"], r["processName"], fontsize=7)
    plt.title("Best-Model Holdout MAE vs R2 by Process")
    plt.xlabel("Holdout MAE")
    plt.ylabel("Holdout R2")
    plt.tight_layout()
    plt.savefig(outdir / "12_holdout_mae_vs_r2_scatter.png", dpi=300)
    plt.close()


def export_json(df_summary: pd.DataFrame, outdir: Path) -> None:
    best = (
        df_summary.sort_values(["processName", "cv_r2", "cv_mae"], ascending=[True, False, True])
        .groupby("processName")
        .head(1)
    )
    payload = {
        "generatedAt": pd.Timestamp.utcnow().isoformat(),
        "target": TARGET,
        "features": FEATURES,
        "best_model_per_process": best.to_dict(orient="records"),
    }
    with open(outdir / "best_models_summary.json", "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)


def run(csv_path: Path, outdir: Path) -> None:
    sns.set_theme(style="whitegrid")
    outdir.mkdir(parents=True, exist_ok=True)

    df = pd.read_csv(csv_path)
    df = df.dropna(subset=FEATURES + [TARGET, PROCESS_COL]).copy()

    df_summary, df_pred = evaluate_per_process(df)
    df_summary.to_csv(outdir / "model_per_process_metrics.csv", index=False)
    df_pred.to_csv(outdir / "best_model_predictions.csv", index=False)
    save_table_images(df_summary, outdir)
    export_json(df_summary, outdir)

    graph_model_comparison(df_summary, outdir)
    graph_process_heatmap(df_summary, outdir)
    graph_best_model_counts(df_summary, outdir)
    graph_parity_and_residuals(df_pred, outdir)
    graph_feature_correlations(df, outdir)
    graph_feature_effects(df, outdir)
    graph_response_surface(df, outdir)
    graph_samples_per_process(df, outdir)
    graph_linear_coefficients(df, outdir)
    graph_holdout_scatter(df_summary, outdir)

    print(f"Done. Graphs + tables saved to: {outdir.resolve()}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--csv", default="datasets/all_processes_from_pdf.csv")
    parser.add_argument("--outdir", default="ml/report_graphs_output")
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    run(Path(args.csv), Path(args.outdir))
