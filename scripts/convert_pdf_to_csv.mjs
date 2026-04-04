import { readFile, writeFile } from 'node:fs/promises';
import { PDFParse } from 'pdf-parse';

const INPUT_PDF = 'Sample research papers/all_processes_dataset.xlsx.pdf';
const OUTPUT_CSV = 'datasets/all_processes_from_pdf.csv';

const PROCESS_CONDITION_MAP = [
  {
    match: /Copper Heap Leach/i,
    names: ['oreGrade (g/t Cu)', 'temperature (degC)', 'pressure (atm)'],
  },
  {
    match: /Copper Flotation/i,
    names: ['oreGrade (% Cu)', 'temperature (degC)', 'pH'],
  },
  {
    match: /Aluminum Bauxite/i,
    names: ['Al2O3 Grade (%)', 'temperature (degC)', 'pressure (bar)'],
  },
  {
    match: /Iron Magnetite/i,
    names: ['Fe Grade (%)', 'grindSize (mm)', 'magneticIntensity (Oe)'],
  },
  {
    match: /Zinc Roasting/i,
    names: ['Zn Grade (%)', 'temperature (degC)', 'SO2 Concentration (%)'],
  },
  {
    match: /Gold Cyanidation/i,
    names: ['oreGrade (g/t Au)', 'cyanideConc (mol/L)', 'pH'],
  },
  {
    match: /Silver Leaching/i,
    names: ['oreGrade (g/t Ag)', 'cyanideConc (mol/L)', 'pH'],
  },
  {
    match: /Cobalt Leaching/i,
    names: ['coGrade (%)', 'temperature (degC)', 'pressure (bar)'],
  },
  {
    match: /Lead Smelting/i,
    names: ['pbGrade (%)', 'temperature (degC)', 'O2 Enrichment (%)'],
  },
  {
    match: /Nickel Laterite/i,
    names: ['niGrade (%)', 'temperature (degC)', 'pressure (bar)'],
  },
];

function inferConditionNames(processName, fallbackNames) {
  for (const entry of PROCESS_CONDITION_MAP) {
    if (entry.match.test(processName)) return entry.names;
  }
  return fallbackNames;
}

function isNumericToken(value) {
  return /^-?\d+(?:\.\d+)?$/.test(value);
}

function parsePageA(pageText) {
  const lines = pageText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const headerIdx = lines.findIndex((line) => line.startsWith('processName'));
  if (headerIdx === -1) {
    throw new Error('Page A header not found.');
  }

  const headerLine = lines[headerIdx];
  const headerParts = headerLine
    .split(/\t+/)
    .map((part) => part.trim())
    .filter(Boolean);

  let conditionNames = headerParts.length >= 4
    ? headerParts.slice(1, 4)
    : ['condition_1', 'condition_2', 'condition_3'];

  const rows = [];
  for (let i = headerIdx + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (line.startsWith('Summary Statistics')) break;

    const tokens = line.split(/\s+/).filter(Boolean);
    if (tokens.length < 4) continue;

    const n1 = tokens[tokens.length - 3];
    const n2 = tokens[tokens.length - 2];
    const n3 = tokens[tokens.length - 1];
    if (!(isNumericToken(n1) && isNumericToken(n2) && isNumericToken(n3))) continue;

    const processName = tokens.slice(0, tokens.length - 3).join(' ').trim();
    if (!processName) continue;

    rows.push({
      processName,
      c1: Number(n1),
      c2: Number(n2),
      c3: Number(n3),
    });

    if (rows.length === 20) break;
  }

  if (rows.length !== 20) {
    throw new Error(`Page A parse failed. Expected 20 rows, found ${rows.length}.`);
  }

  conditionNames = inferConditionNames(rows[0].processName, conditionNames);

  return { conditionNames, rows };
}

function parsePageB(pageText) {
  const lines = pageText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const headerLine = lines.find((line) => line.includes('recoveryRate'));
  if (!headerLine) {
    throw new Error('Page B header not found.');
  }

  const condition4Name = headerLine.split('recoveryRate')[0].trim().replace(/\s+$/, '') || 'condition_4';

  const rows = [];
  let startCollecting = false;

  for (const line of lines) {
    if (!startCollecting) {
      if (line.includes('recoveryRate')) startCollecting = true;
      continue;
    }

    const nums = line.match(/-?\d+(?:\.\d+)?/g);
    if (!nums || nums.length < 5) continue;

    rows.push({
      c4: Number(nums[0]),
      recoveryRate: Number(nums[1]),
      efficiency: Number(nums[2]),
      wasteGenerated: Number(nums[3]),
      waterUsage: Number(nums[4]),
    });

    if (rows.length === 20) break;
  }

  if (rows.length !== 20) {
    throw new Error(`Page B parse failed. Expected 20 rows, found ${rows.length}.`);
  }

  return { condition4Name, rows };
}

function parsePageC(pageText) {
  const lines = pageText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const rows = [];
  for (const line of lines) {
    if (!/(Optimal|Warning|Alert)/.test(line)) continue;

    const nums = line.match(/-?\d+(?:\.\d+)?/g);
    const statusMatch = line.match(/(Optimal|Warning|Alert)/);

    if (!nums || nums.length < 2 || !statusMatch) continue;

    rows.push({
      energyConsumption: Number(nums[0]),
      co2Emissions: Number(nums[1]),
      status: statusMatch[1],
    });

    if (rows.length === 20) break;
  }

  if (rows.length !== 20) {
    throw new Error(`Page C parse failed. Expected 20 rows, found ${rows.length}.`);
  }

  return rows;
}

function csvEscape(value) {
  if (value === null || value === undefined) return '';
  const text = String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function toCsv(rows) {
  const headers = [
    'processName',
    'condition_1_name',
    'condition_1_value',
    'condition_2_name',
    'condition_2_value',
    'condition_3_name',
    'condition_3_value',
    'condition_4_name',
    'condition_4_value',
    'recoveryRate',
    'efficiency',
    'wasteGenerated',
    'waterUsage',
    'energyConsumption',
    'co2Emissions',
    'status',
    'sourcePdf'
  ];

  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map((h) => csvEscape(row[h])).join(','));
  }
  return `${lines.join('\n')}\n`;
}

async function main() {
  const buffer = await readFile(INPUT_PDF);
  const parser = new PDFParse({ data: buffer });
  const textResult = await parser.getText();
  await parser.destroy();

  const pages = textResult.pages;
  const dataStart = 2;
  const processCount = 10;

  const mergedRows = [];

  for (let p = 0; p < processCount; p += 1) {
    const base = dataStart + p * 3;
    const pageA = pages[base]?.text || '';
    const pageB = pages[base + 1]?.text || '';
    const pageC = pages[base + 2]?.text || '';

    const parsedA = parsePageA(pageA);
    const parsedB = parsePageB(pageB);
    const parsedC = parsePageC(pageC);

    for (let i = 0; i < 20; i += 1) {
      mergedRows.push({
        processName: parsedA.rows[i].processName,
        condition_1_name: parsedA.conditionNames[0],
        condition_1_value: parsedA.rows[i].c1,
        condition_2_name: parsedA.conditionNames[1],
        condition_2_value: parsedA.rows[i].c2,
        condition_3_name: parsedA.conditionNames[2],
        condition_3_value: parsedA.rows[i].c3,
        condition_4_name: parsedB.condition4Name,
        condition_4_value: parsedB.rows[i].c4,
        recoveryRate: parsedB.rows[i].recoveryRate,
        efficiency: parsedB.rows[i].efficiency,
        wasteGenerated: parsedB.rows[i].wasteGenerated,
        waterUsage: parsedB.rows[i].waterUsage,
        energyConsumption: parsedC[i].energyConsumption,
        co2Emissions: parsedC[i].co2Emissions,
        status: parsedC[i].status,
        sourcePdf: INPUT_PDF,
      });
    }
  }

  const csv = toCsv(mergedRows);
  await writeFile(OUTPUT_CSV, csv, 'utf8');

  console.log(`Created ${OUTPUT_CSV} with ${mergedRows.length} rows.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
