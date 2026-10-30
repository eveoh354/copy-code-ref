import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';
import { Resvg } from '@resvg/resvg-js';

export const SOURCE_URL = 'https://vsx-pulse.org/api/series?id=ohEVE.copy-code-path-ref&metric=downloads&grain=hour';
const ROOT = fileURLToPath(new URL('../', import.meta.url));
const HOUR = 60 * 60 * 1000;
const TIME_ZONE = 'Asia/Shanghai';
const dateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit'
});

export function localDate(timestamp) {
  const parts = Object.fromEntries(dateFormatter.formatToParts(new Date(timestamp)).map(({ type, value }) => [type, value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function validatePoint(point) {
  if (!point || typeof point.timestamp !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:00:00\.000Z$/.test(point.timestamp)
    || !Number.isFinite(Date.parse(point.timestamp)) || new Date(point.timestamp).toISOString() !== point.timestamp
    || !Number.isSafeInteger(point.downloads) || point.downloads < 0) {
    throw new Error('Invalid hourly download record; existing history was not updated.');
  }
  return { timestamp: point.timestamp, downloads: point.downloads };
}

export function parseSeries(series) {
  if (!Array.isArray(series) || series.length === 0) {
    throw new Error('VSX Pulse returned no hourly data; existing history was not updated.');
  }
  return series.map(point => {
    if (!point || typeof point.bucket !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}$/.test(point.bucket)) {
      throw new Error('Unexpected VSX Pulse hourly bucket.');
    }
    // For a single extension at grain=hour, Pulse's "delta" is the cumulative count.
    return validatePoint({ timestamp: `${point.bucket}:00:00.000Z`, downloads: point.delta });
  });
}

export function mergeHistory(existing, incoming) {
  const points = new Map();
  for (const point of [...existing, ...incoming]) {
    const valid = validatePoint(point);
    points.set(valid.timestamp, valid);
  }
  // Preserve records that have aged out of Pulse's rolling response. Corrections
  // to overlapping hours replace the old value, including downward corrections.
  return [...points.values()].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

export function selectChartPoints(history) {
  if (history.length === 0) throw new Error('Cannot render an empty history.');
  const anniversary = new Date(history[0].timestamp);
  anniversary.setUTCFullYear(anniversary.getUTCFullYear() + 1);
  if (Date.parse(history.at(-1).timestamp) < anniversary.getTime()) {
    return { resolution: 'hourly', points: history };
  }
  const days = new Map();
  for (const point of history) days.set(localDate(point.timestamp), point);
  return { resolution: 'daily', points: [...days.values()] };
}

export async function readHistory(root = ROOT) {
  const directory = join(root, 'data/openvsx');
  let names;
  try {
    names = await readdir(directory);
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
  const points = [];
  for (const name of names.filter(name => /^\d{4}-\d{2}\.json$/.test(name)).sort()) {
    const month = JSON.parse(await readFile(join(directory, name), 'utf8'));
    if (!Array.isArray(month)) throw new Error(`Invalid history file: ${name}`);
    for (const point of month) {
      const valid = validatePoint(point);
      if (valid.timestamp.slice(0, 7) !== name.slice(0, 7)) throw new Error(`Wrong month in ${name}`);
      points.push(valid);
    }
  }
  return mergeHistory([], points);
}

async function writeIfChanged(path, content) {
  try {
    if ((await readFile(path)).equals(Buffer.from(content))) return;
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, content);
}

const number = value => value.toLocaleString('en-US');
const escapeXml = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[char]));

export function renderChart(history, theme = 'auto') {
  const { resolution, points } = selectChartPoints(history);
  const first = history[0];
  const latest = history.at(-1);
  const left = 80, right = 908, top = 140, bottom = 348;
  const start = Date.parse(first.timestamp);
  const end = Date.parse(latest.timestamp);
  const max = points.reduce((max, point) => Math.max(max, point.downloads), 1);
  const magnitude = 10 ** Math.floor(Math.log10(max));
  const ceiling = Math.ceil(max / magnitude) * magnitude;
  const x = timestamp => left + (Date.parse(timestamp) - start) / Math.max(HOUR, end - start) * (right - left);
  const y = count => bottom - count / ceiling * (bottom - top);
  const paths = [];
  let path = '';
  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    const previous = points[i - 1];
    const gap = previous && (resolution === 'hourly'
      ? Date.parse(point.timestamp) - Date.parse(previous.timestamp) > HOUR
      : Date.parse(localDate(point.timestamp)) - Date.parse(localDate(previous.timestamp)) > 24 * HOUR);
    if (gap && path) { paths.push(path); path = ''; }
    path += `${path ? ' L' : 'M'}${x(point.timestamp).toFixed(2)},${y(point.downloads).toFixed(2)}`;
  }
  if (path) paths.push(path);
  const grid = Array.from({ length: 5 }, (_, i) => {
    const count = ceiling * i / 4;
    const position = y(count);
    return `<line class="grid" x1="${left}" x2="${right}" y1="${position}" y2="${position}"/>
    <text class="tick" x="${left - 14}" y="${position + 4}" text-anchor="end">${number(Math.round(count))}</text>`;
  }).join('\n    ');
  const ticks = Array.from({ length: end === start ? 1 : 5 }, (_, i) => {
    const position = left + (right - left) * i / 4;
    const timestamp = new Date(start + (end - start) * i / 4).toISOString();
    return `<text class="tick" x="${position}" y="${bottom + 26}" text-anchor="${i === 0 ? 'start' : i === 4 ? 'end' : 'middle'}">${localDate(timestamp)}</text>`;
  }).join('\n    ');
  const lastHour = new Intl.DateTimeFormat('en-GB', { timeZone: TIME_ZONE, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(latest.timestamp));
  const change = latest.downloads - first.downloads;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="442" viewBox="0 0 960 442" role="img" aria-labelledby="title description">
  <title id="title">Open VSX download history — Copy Code Ref for AI</title>
  <desc id="description">${escapeXml(`${number(latest.downloads)} cumulative downloads. Recorded from ${localDate(first.timestamp)} to ${localDate(latest.timestamp)}. ${resolution} chart; gaps indicate missing observations. Source: VSX Pulse. Downloads are not unique users.`)}</desc>
  <style>
    svg { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .background { fill: #ffffff; stroke: #e5e7eb; }
    .heading, .total { fill: #172033; }
    .muted, .tick { fill: #667085; }
    .grid { stroke: #edf0f4; stroke-width: 1; }
    .curve { fill: none; stroke: #db4790; stroke-width: 2.5; stroke-linejoin: round; stroke-linecap: round; }
    .point { fill: #db4790; stroke: #ffffff; stroke-width: 2; }
    .tick { font-size: 12px; font-variant-numeric: tabular-nums; }
    ${theme === 'dark' ? '' : '@media (prefers-color-scheme: dark) {'}
      .background { fill: #0d1117; stroke: #30363d; }
      .heading, .total { fill: #e6edf3; }
      .muted, .tick { fill: #9da7b3; }
      .grid { stroke: #222b36; }
      .curve { stroke: #f477b6; }
      .point { fill: #f477b6; stroke: #0d1117; }
    ${theme === 'dark' ? '' : '}'}
  </style>
  <rect class="background" x="0.5" y="0.5" width="959" height="441" rx="16"/>
  <text class="heading" x="32" y="42" font-size="20" font-weight="650">Open VSX download history</text>
  <text class="muted" x="32" y="67" font-size="13">Copy Code Ref for AI · ${resolution === 'hourly' ? 'Hourly observations' : 'Daily last observations'}</text>
  <text class="muted" x="32" y="99" font-size="13">${change >= 0 ? '+' : ''}${number(change)} downloads over the recorded period</text>
  <text class="total" x="928" y="52" text-anchor="end" font-size="34" font-weight="700">${number(latest.downloads)}</text>
  <text class="muted" x="928" y="75" text-anchor="end" font-size="12">cumulative downloads</text>
  <g>
    ${grid}
    ${ticks}
    ${paths.map(d => `<path class="curve" d="${d}"/>`).join('\n    ')}
    <circle class="point" cx="${x(latest.timestamp).toFixed(2)}" cy="${y(latest.downloads).toFixed(2)}" r="4.5"/>
  </g>
  <text class="muted" x="32" y="407" font-size="11">Data: VSX Pulse · Downloads, including updates · UTC+8</text>
  <text class="muted" x="928" y="407" text-anchor="end" font-size="11">Latest observation: ${localDate(latest.timestamp)} ${lastHour}</text>
</svg>
`;
}

export async function updateHistory(series, root = ROOT) {
  // Validate all fetched and stored records, and render, before writing any files.
  const incoming = parseSeries(series);
  const history = mergeHistory(await readHistory(root), incoming);
  const chart = renderChart(history);
  const pngOptions = { fitTo: { mode: 'width', value: 1920 }, font: { defaultFontFamily: 'DejaVu Sans' } };
  const lightPng = new Resvg(chart, pngOptions).render().asPng();
  const darkPng = new Resvg(renderChart(history, 'dark'), pngOptions).render().asPng();
  const months = new Map();
  for (const point of history) {
    const month = point.timestamp.slice(0, 7);
    if (!months.has(month)) months.set(month, []);
    months.get(month).push(point);
  }
  for (const [month, points] of months) {
    await writeIfChanged(join(root, 'data/openvsx', `${month}.json`), `[\n${points.map(point => `  ${JSON.stringify(point)}`).join(',\n')}\n]\n`);
  }
  await writeIfChanged(join(root, 'assets/openvsx-downloads.svg'), chart);
  await writeIfChanged(join(root, 'assets/openvsx-downloads.png'), lightPng);
  await writeIfChanged(join(root, 'assets/openvsx-downloads-dark.png'), darkPng);
  return history;
}

async function fetchSeries() {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(SOURCE_URL, {
        headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(30000)
      });
      if (!response.ok) throw new Error(`VSX Pulse returned HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      if (attempt === 3) throw error;
      await delay(attempt * 2000);
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length && !(args.length === 2 && args[0] === '--input')) {
    throw new Error('Usage: node scripts/update-download-history.mjs [--input pulse-response.json]');
  }
  const series = args.length ? JSON.parse(await readFile(resolve(args[1]), 'utf8')) : await fetchSeries();
  const history = await updateHistory(series);
  console.log(`Saved ${history.length} hourly observations: ${history[0].timestamp} → ${history.at(-1).timestamp}; chart: ${selectChartPoints(history).resolution}.`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
