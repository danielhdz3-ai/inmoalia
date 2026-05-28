import fs from 'fs'

const base = 'c:/Users/Daniel HDZ/OneDrive/Operativas Sniper'
const files = [
  ['Soft 404 (1)', `${base}/inmoalia.com-Coverage-Drilldown-2026-05-28 (1)/Tabla.csv`],
  ['Sin indexar', `${base}/inmoalia.com-Coverage-Drilldown-2026-05-28 (2)/Tabla.csv`],
  ['noindex', `${base}/inmoalia.com-Coverage-Drilldown-2026-05-28 (3)/Tabla.csv`],
  ['Canonical OK', `${base}/inmoalia.com-Coverage-Drilldown-2026-05-28 (4)/Tabla.csv`],
  ['Duplicada sin canonical', `${base}/inmoalia.com-Coverage-Drilldown-2026-05-28 (5)/Tabla.csv`],
  ['Soft 404 (6)', `${base}/inmoalia.com-Coverage-Drilldown-2026-05-28 (6)/Tabla.csv`],
].filter(([, p]) => fs.existsSync(p))

function parseUrls(text) {
  const urls = []
  for (const line of text.split('\n')) {
    const m = line.match(/https?:\/\/[^\s,]+/)
    if (m) urls.push(m[0].replace(/^"|"$/g, ''))
  }
  return urls
}

function classify(url) {
  const path = url.replace(/^https?:\/\/(www\.)?inmoalia\.com/, '')
  if (path.startsWith('/buscar')) return 'buscar'
  if (path.startsWith('/productos?')) return 'productos-filtros'
  if (path.startsWith('/productos/')) return 'producto-slug'
  if (path.startsWith('/categorias/') && path.includes('?')) return 'categorias-filtros'
  if (path.startsWith('/categorias')) return 'categorias'
  if (path.includes('?')) return `${path.split('?')[0]}?`
  return path.split('?')[0] || 'otro'
}

const allUrls = new Set()
const byIssue = {}

for (const [issue, file] of files) {
  const urls = parseUrls(fs.readFileSync(file, 'utf8'))
  byIssue[issue] = urls
  urls.forEach((u) => allUrls.add(u))
  console.log(`\n=== ${issue}: ${urls.length} URLs ===`)
  const counts = {}
  for (const u of urls) counts[classify(u)] = (counts[classify(u)] || 0) + 1
  Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([k, v]) => console.log(`  ${v}\t${k}`))
}

console.log(`\n=== Total únicas: ${allUrls.size} ===`)
const global = {}
for (const u of allUrls) global[classify(u)] = (global[classify(u)] || 0) + 1
Object.entries(global)
  .sort((a, b) => b[1] - a[1])
  .forEach(([k, v]) => console.log(`  ${v}\t${k}`))

const slugs = [...allUrls].filter((u) => u.includes('/productos/') && !u.includes('?'))
console.log(`\n=== Productos slug únicos (${slugs.length}) ===`)
for (const u of slugs.slice(0, 40)) console.log(' ', u.replace(/.*inmoalia\.com/, ''))
if (slugs.length > 40) console.log(`  ... y ${slugs.length - 40} más`)

const staticPages = [...allUrls].filter((u) => !u.includes('?') && !u.includes('/productos/'))
console.log(`\n=== Páginas estáticas en informes (${staticPages.length}) ===`)
for (const u of staticPages) console.log(' ', u)
