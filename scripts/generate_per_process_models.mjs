import { readFile, writeFile } from 'node:fs/promises';

const INPUT_CSV = 'datasets/all_processes_from_pdf.csv';
const OUTPUT_JSON = 'src/data/ml_models_by_process.json';

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines[0].split(',');
  return lines.slice(1).map((line) => {
    const cols = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i += 1) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === ',' && !inQuotes) {
        cols.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
    cols.push(current);

    const row = {};
    headers.forEach((h, idx) => { row[h] = cols[idx] ?? ''; });
    return row;
  });
}

const featureKeys = ['condition_1_value', 'condition_2_value', 'condition_3_value', 'condition_4_value'];
const targetKey = 'recoveryRate';

function seededRandom(seed) {
  let s = seed >>> 0;
  return () => {
    s = (1664525 * s + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function shuffle(arr, seed = 42) {
  const out = [...arr];
  const rnd = seededRandom(seed);
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rnd() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function transpose(m) {
  return m[0].map((_, i) => m.map((r) => r[i]));
}

function multiply(a, b) {
  const out = Array.from({ length: a.length }, () => Array(b[0].length).fill(0));
  for (let i = 0; i < a.length; i += 1) {
    for (let k = 0; k < b.length; k += 1) {
      for (let j = 0; j < b[0].length; j += 1) {
        out[i][j] += a[i][k] * b[k][j];
      }
    }
  }
  return out;
}

function identity(n) {
  return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
}

function inverse(matrix) {
  const n = matrix.length;
  const aug = matrix.map((row, i) => [...row, ...identity(n)[i]]);
  for (let i = 0; i < n; i += 1) {
    let pivotRow = i;
    for (let r = i + 1; r < n; r += 1) {
      if (Math.abs(aug[r][i]) > Math.abs(aug[pivotRow][i])) pivotRow = r;
    }
    if (Math.abs(aug[pivotRow][i]) < 1e-12) return null;
    if (pivotRow !== i) [aug[i], aug[pivotRow]] = [aug[pivotRow], aug[i]];

    const pivot = aug[i][i];
    for (let c = 0; c < 2 * n; c += 1) aug[i][c] /= pivot;

    for (let r = 0; r < n; r += 1) {
      if (r === i) continue;
      const factor = aug[r][i];
      for (let c = 0; c < 2 * n; c += 1) aug[r][c] -= factor * aug[i][c];
    }
  }
  return aug.map((r) => r.slice(n));
}

function ridgeRegressionFit(X, y, lambda = 1e-6) {
  const Xt = transpose(X);
  const XtX = multiply(Xt, X);
  for (let i = 0; i < XtX.length; i += 1) XtX[i][i] += lambda;
  const XtXInv = inverse(XtX);
  if (!XtXInv) return null;
  const XtY = multiply(Xt, y.map((v) => [v]));
  const W = multiply(XtXInv, XtY).map((r) => r[0]);
  return { intercept: W[0], coefficients: W.slice(1) };
}

function predictLinear(model, x) {
  return model.intercept + model.coefficients.reduce((sum, c, i) => sum + c * x[i], 0);
}

function mae(yTrue, yPred) {
  let s = 0;
  for (let i = 0; i < yTrue.length; i += 1) s += Math.abs(yTrue[i] - yPred[i]);
  return s / yTrue.length;
}

function r2(yTrue, yPred) {
  const mean = yTrue.reduce((a, b) => a + b, 0) / yTrue.length;
  let ssRes = 0;
  let ssTot = 0;
  for (let i = 0; i < yTrue.length; i += 1) {
    ssRes += (yTrue[i] - yPred[i]) ** 2;
    ssTot += (yTrue[i] - mean) ** 2;
  }
  return ssTot === 0 ? 0 : 1 - ssRes / ssTot;
}

function toNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function summarizeRanges(rows) {
  const mins = featureKeys.map(() => Number.POSITIVE_INFINITY);
  const maxs = featureKeys.map(() => Number.NEGATIVE_INFINITY);
  for (const row of rows) {
    featureKeys.forEach((k, i) => {
      const n = toNum(row[k]);
      mins[i] = Math.min(mins[i], n);
      maxs[i] = Math.max(maxs[i], n);
    });
  }
  return featureKeys.map((k, i) => ({
    key: k,
    min: mins[i],
    max: maxs[i],
  }));
}

async function main() {
  const csvText = await readFile(INPUT_CSV, 'utf8');
  const rows = parseCsv(csvText);
  const grouped = new Map();
  for (const row of rows) {
    const name = row.processName;
    if (!grouped.has(name)) grouped.set(name, []);
    grouped.get(name).push(row);
  }

  const result = {
    generatedAt: new Date().toISOString(),
    model_family: 'per_process_linear_regression',
    feature_keys: featureKeys,
    target_key: targetKey,
    processes: {},
  };

  for (const [processName, processRows] of grouped.entries()) {
    const shuffled = shuffle(processRows, 42);
    const split = Math.max(1, Math.floor(shuffled.length * 0.8));
    const train = shuffled.slice(0, split);
    const test = shuffled.slice(split);

    const Xtrain = train.map((row) => [1, ...featureKeys.map((k) => toNum(row[k]))]);
    const ytrain = train.map((row) => toNum(row[targetKey]));
    const model = ridgeRegressionFit(Xtrain, ytrain);
    if (!model) continue;

    const evalRows = test.length > 0 ? test : train;
    const yTrue = evalRows.map((row) => toNum(row[targetKey]));
    const yPred = evalRows.map((row) => predictLinear(model, featureKeys.map((k) => toNum(row[k]))));

    const sample = processRows[0];
    const conditionNames = [sample.condition_1_name, sample.condition_2_name, sample.condition_3_name, sample.condition_4_name];

    result.processes[processName] = {
      model_type: 'linear_regression',
      features: featureKeys,
      feature_labels: conditionNames,
      intercept: model.intercept,
      coefficients: model.coefficients,
      ranges: summarizeRanges(processRows),
      metrics: {
        mae: mae(yTrue, yPred),
        r2: r2(yTrue, yPred),
      },
      samples: processRows.length,
      split: {
        train: train.length,
        test: test.length,
      },
    };
  }

  await writeFile(OUTPUT_JSON, JSON.stringify(result, null, 2));
  console.log(`Created ${OUTPUT_JSON} for ${Object.keys(result.processes).length} processes.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
