# Open VSX download history

Hourly cumulative downloads for `ohEVE.copy-code-path-ref`, collected from [VSX Pulse](https://vsx-pulse.org/Extension/ohEVE.copy-code-path-ref).

Source: `https://vsx-pulse.org/api/series?id=ohEVE.copy-code-path-ref&metric=downloads&grain=hour`

- At this endpoint, `bucket` is a UTC hour and `delta` is the **cumulative** download count, including updates. It is not an hourly increment or a unique-user count.
- Files are partitioned by UTC month. Each record stores an explicit UTC `timestamp` and `downloads`. The initial archive begins on September 30, 2026, at the earliest observation available in the imported response; earlier history is unknown.
- Every run merges the full rolling response by timestamp. New readings are appended, overlapping readings can be corrected, and records outside the response window are retained. Repeated runs with the same response produce identical files.
- Empty or invalid responses fail the run before changing the archive or chart. Missing observations remain missing; the chart breaks the line across gaps. A source outage longer than its available history window may leave permanent gaps.
- All hourly records are retained. Before the first observation's one-year anniversary, the chart uses hourly points. At or after that anniversary, it uses the last available observation of each day in `Asia/Shanghai` (UTC+8). Daily counts are never summed or averaged. The latest day may be partial.
- The chart's latest-observation timestamp comes from the data, not the time the workflow ran. These are downloads recorded by a third party, not independently verified installations.

## Updating

Use Node.js 24 or newer and install the locked development dependencies with `npm ci --ignore-scripts`. The chart uses `@resvg/resvg-js` to produce PNG previews from SVG. No API keys are needed. These tools and the archive are excluded from the extension package.

```sh
npm run downloads:update
npm run downloads:test
```

For a saved response (including the initial backfill):

```sh
node scripts/update-download-history.mjs --input /path/to/pulse-response.json
```

The `Update Open VSX download history` workflow runs daily at approximately **10:17 Beijing time** and can also be started with **Run workflow** on the default branch. It commits only the monthly JSON files and the three generated chart files (`assets/openvsx-downloads.svg`, `assets/openvsx-downloads.png`, `assets/openvsx-downloads-dark.png`), and skips a commit when nothing changed. The README embeds PNGs because VS Code Marketplace restricts custom SVG images. No extension release is published.

The workflow must be present on the default branch to run on a schedule. It uses the built-in `GITHUB_TOKEN` with `contents: write`; repository rules must permit its normal push. A concurrent push to the branch can reject the bot's push; rerun the workflow to merge the latest readings into a fresh checkout. The workflow does not force-push or rewrite history.
