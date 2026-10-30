import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { downloadsInLast30Days, localDate, mergeHistory, parseSeries, readHistory, renderChart, selectChartPoints, updateHistory } from './update-download-history.mjs';

const point = (hour, downloads) => ({ timestamp: `${hour}:00:00.000Z`, downloads });

test('30-day downloads use the exact hourly boundary even when the chart uses daily points', () => {
  const history = [
    point('2025-09-01T04', 10),
    point('2026-09-30T03', 90),
    point('2026-09-30T04', 100),
    point('2026-09-30T05', 110),
    point('2026-10-30T04', 350)
  ];
  assert.equal(selectChartPoints(history).resolution, 'daily');
  assert.equal(downloadsInLast30Days(history), 250);
  assert.match(renderChart(history), /250 downloads in the last 30 days/);
});

test('30-day downloads remain unknown without an exact baseline', () => {
  for (const history of [
    [],
    [point('2026-10-01T04', 100), point('2026-10-30T04', 350)],
    [point('2026-09-30T03', 90), point('2026-09-30T05', 110), point('2026-10-30T04', 350)]
  ]) assert.equal(downloadsInLast30Days(history), null);
  assert.match(renderChart([point('2026-10-30T04', 350)]), /Last 30 days: insufficient data/);
});

test('30-day downloads preserve zero growth and downward corrections', () => {
  const baseline = point('2026-09-30T04', 100);
  assert.equal(downloadsInLast30Days([baseline, point('2026-10-30T04', 100)]), 0);
  assert.equal(downloadsInLast30Days([baseline, point('2026-10-30T04', 95)]), -5);
});

test('merge a rolling window without losing old hours; accept corrections and deduplicate', () => {
  const old = [point('2026-09-30T03', 2692), point('2026-10-01T03', 2800)];
  const incoming = parseSeries([
    { bucket: '2026-10-02T03', delta: 2850 },
    { bucket: '2026-10-01T03', delta: 2790 },
    { bucket: '2026-10-02T03', delta: 2850 }
  ]);
  const merged = mergeHistory(old, incoming);
  assert.deepEqual(merged, [old[0], point('2026-10-01T03', 2790), point('2026-10-02T03', 2850)]);
  assert.deepEqual(mergeHistory(merged, incoming), merged);
});

test('switch at the calendar anniversary, accounting for leap years', () => {
  const first = point('2023-10-30T03', 100);
  // 365 days have elapsed, but a leap day falls within this year.
  assert.equal(selectChartPoints([first, point('2024-10-29T03', 200)]).resolution, 'hourly');
  assert.equal(selectChartPoints([first, point('2024-10-30T03', 200)]).resolution, 'daily');
});

test('daily chart selects the last observation in Beijing time without changing the hourly archive', () => {
  const history = [
    point('2025-10-01T00', 10),
    point('2026-10-01T14', 100),
    point('2026-10-01T15', 110),
    point('2026-10-01T16', 115),
    point('2026-10-01T17', 120)
  ];
  assert.equal(localDate(history[3].timestamp), '2026-10-02');
  assert.deepEqual(selectChartPoints(history).points, [history[0], history[2], history[4]]);
  assert.equal(history.length, 5);
});

test('reject malformed, empty, or non-hourly source data rather than fabricate zero counts', () => {
  for (const payload of [
    [], null, { error: 'unavailable' },
    [{ bucket: '2026-10-01', delta: 10 }],
    [{ bucket: '2026-02-30T03', delta: 10 }],
    [{ bucket: '2026-10-01T03', delta: null }],
    [{ bucket: '2026-10-01T03', delta: -1 }],
    [{ bucket: '2026-10-01T03', delta: 1.5 }]
  ]) assert.throws(() => parseSeries(payload));
  assert.deepEqual(parseSeries([{ bucket: '2026-10-01T03', delta: 0 }]), [point('2026-10-01T03', 0)]);
});

test('chart breaks at missing hours, reports data time, and handles one observation', () => {
  const svg = renderChart([point('2026-10-01T00', 10), point('2026-10-01T01', 12), point('2026-10-01T03', 15)]);
  assert.equal((svg.match(/<path class="curve"/g) || []).length, 2);
  assert.match(svg, /Latest observation: 2026-10-01 11:00/);
  assert.doesNotMatch(renderChart([point('2026-10-01T00', 0)]), /NaN|Infinity/);
});

test('persist monthly history, rerun without changes, and keep every output on invalid input', async () => {
  const root = await mkdtemp(join(tmpdir(), 'copy-code-ref-history-'));
  const payload = [{ bucket: '2026-09-30T23', delta: 10 }, { bucket: '2026-10-01T00', delta: 12 }];
  await updateHistory(payload, root);
  const paths = ['data/openvsx/2026-09.json', 'data/openvsx/2026-10.json', 'assets/openvsx-downloads.svg', 'assets/openvsx-downloads.png', 'assets/openvsx-downloads-dark.png'];
  const before = await Promise.all(paths.map(path => readFile(join(root, path))));
  assert.deepEqual(await readHistory(root), parseSeries(payload));
  assert.notDeepEqual(before[3], before[4]);
  assert.equal(before[3].subarray(1, 4).toString(), 'PNG');
  await updateHistory(payload, root);
  assert.deepEqual(await Promise.all(paths.map(path => readFile(join(root, path)))), before);
  await assert.rejects(updateHistory([{ bucket: '2026-10-02T00', delta: null }], root));
  assert.deepEqual(await Promise.all(paths.map(path => readFile(join(root, path)))), before);
  await updateHistory([{ bucket: '2026-10-02T00', delta: 15 }], root);
  assert.equal((await readHistory(root)).length, 3);
});
