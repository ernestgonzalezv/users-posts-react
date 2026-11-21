#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."
summary=coverage/coverage-summary.json
[ -f "$summary" ] || { echo "run npm run test:coverage first ($summary missing)" >&2; exit 1; }
node - "$summary" <<'NODE'
const fs = require('node:fs')
const { total } = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'))
const pct = total.lines.pct
const label = 'coverage'
const value = `${pct.toFixed(1)}%`
const color = pct >= 95 ? '#2f7a47' : pct >= 85 ? '#c07a1c' : '#b42318'
const w1 = 62
const w2 = 7 * value.length + 14
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w1 + w2}" height="20" role="img" aria-label="${label}: ${value}">
<title>${label}: ${value}</title>
<linearGradient id="s" x2="0" y2="100%"><stop offset="0" stop-color="#fff" stop-opacity=".7"/><stop offset=".1" stop-color="#aaa" stop-opacity=".1"/><stop offset=".9" stop-color="#000" stop-opacity=".3"/><stop offset="1" stop-color="#000" stop-opacity=".5"/></linearGradient>
<clipPath id="r"><rect width="${w1 + w2}" height="20" rx="3" fill="#fff"/></clipPath>
<g clip-path="url(#r)"><rect width="${w1}" height="20" fill="#555"/><rect x="${w1}" width="${w2}" height="20" fill="${color}"/><rect width="${w1 + w2}" height="20" fill="url(#s)"/></g>
<g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">
<text x="${w1 / 2}" y="15" fill="#010101" fill-opacity=".3">${label}</text><text x="${w1 / 2}" y="14">${label}</text>
<text x="${w1 + w2 / 2}" y="15" fill="#010101" fill-opacity=".3">${value}</text><text x="${w1 + w2 / 2}" y="14">${value}</text>
</g></svg>
`
fs.writeFileSync('coverage/badge.svg', svg)
console.log(`coverage badge: ${value} -> coverage/badge.svg`)
NODE
