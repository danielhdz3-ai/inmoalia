import { parse } from 'csv-parse/sync'

/** Fila normalizada lista para upsert en `products` (conflicto por `slug`). */
export type AwNormalizedProduct = {
  slug: string
  name: string
  description: string | null
  price: number
  cost_price: number | null
  images: string[]
  category: string
  subcategory: string | null
  tags: string[]
  sku: string
  supplier_sku: string
  supplier: 'aw-dropship'
  stock: number
  weight_kg: number | null
  dimensions: { width: number; height: number; depth: number; unit: string } | null
  material: string | null
  is_active: boolean
}

const HEADER_MARKER = '"Status","Product code"'

function extractCsvBody(raw: string): string {
  const trimmed = raw.trimStart()
  const idx = trimmed.indexOf(HEADER_MARKER)
  if (idx === -1) {
    const loose = trimmed.indexOf('"Product code"')
    if (loose !== -1) {
      const statusIdx = trimmed.lastIndexOf('"Status"', loose)
      if (statusIdx !== -1) return trimmed.slice(statusIdx)
    }
    return raw
  }
  return trimmed.slice(idx)
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function parseDecimal(v: string | undefined): number | null {
  if (v === undefined || v === null || String(v).trim() === '') return null
  const n = parseFloat(String(v).replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

function parseDimensionsCell(cell: string | undefined): AwNormalizedProduct['dimensions'] {
  if (!cell?.trim()) return null
  const m = cell.match(/(\d+(?:[.,]\d+)?)\s*x\s*(\d+(?:[.,]\d+)?)\s*x\s*(\d+(?:[.,]\d+)?)/i)
  if (!m) return null
  const unit = cell.toLowerCase().includes('cm') ? 'cm' : 'mm'
  return {
    width: parseFloat(m[1].replace(',', '.')),
    height: parseFloat(m[2].replace(',', '.')),
    depth: parseFloat(m[3].replace(',', '.')),
    unit,
  }
}

function slugFromProductCode(productCode: string): string {
  const code = productCode.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return `aw-${code || 'unknown'}`
}

function parseImageUrls(imagesCell: string | undefined): string[] {
  if (!imagesCell?.trim()) return []
  return imagesCell
    .split(',')
    .map((u) => u.trim())
    .filter(Boolean)
}

function computeStock(row: Record<string, string>): number {
  const flag = (row['Stock'] ?? '').trim().toLowerCase()
  if (flag === 'outofstock') return 0
  const qty = parseInt(row['Available Quantity'] ?? '', 10)
  if (Number.isFinite(qty) && qty >= 0) return qty
  return 0
}

function mapAwCategory(row: Record<string, string>): string {
  const code = (row['Department code'] ?? '').toLowerCase()
  const dept = (row['Department'] ?? '').toLowerCase()
  const sub = (row['Subdepartment'] ?? '').toLowerCase()
  const blob = `${code} ${dept} ${sub}`

  if (blob.includes('garden') || blob.includes('jardín') || blob.includes('jardin') || blob.includes('outdoor')) {
    return 'jardin'
  }
  if (
    blob.includes('furniture') ||
    blob.includes('mueble') ||
    blob.includes('-furniture') ||
    blob.includes('sd-furniture')
  ) {
    return 'muebles'
  }
  if (blob.includes('textile') || blob.includes('textil') || blob.includes('bolso') || blob.includes('ropa')) {
    return 'textil'
  }
  if (blob.includes('light') || blob.includes('lamp') || blob.includes('ilumin')) {
    return 'iluminacion'
  }
  if (blob.includes('table') || blob.includes('mesa')) {
    return 'mesas'
  }
  if (blob.includes('chair') || blob.includes('silla') || blob.includes('sofa')) {
    return 'sillas'
  }
  return 'decoracion'
}

function normalizeRow(row: Record<string, string>): AwNormalizedProduct | null {
  const productCode = (row['Product code'] ?? '').trim()
  const name = (row['Unit Name'] ?? '').trim()
  if (!productCode || !name) return null

  const status = (row['Status'] ?? '').trim().toLowerCase()

  let description = (row['Webpage description (plain text)'] ?? '').trim()
  if (!description) {
    const html = (row['Webpage description (html)'] ?? '').trim()
    if (html) description = stripHtml(html)
  }
  if (!description) description = null

  const rrp = parseDecimal(row['Unit RRP'])
  const wholesale = parseDecimal(row['Unit price']) ?? parseDecimal(row['Price'])
  const price = rrp ?? wholesale ?? 0

  const tags = [row['Family'], row['Department'], row['Subdepartment']]
    .map((t) => (t ?? '').trim())
    .filter(Boolean)

  return {
    slug: slugFromProductCode(productCode),
    name,
    description,
    price,
    cost_price: wholesale,
    images: parseImageUrls(row['Images']),
    category: mapAwCategory(row),
    subcategory: row['Subdepartment']?.trim() || null,
    tags,
    sku: `AW-${productCode}`,
    supplier_sku: productCode,
    supplier: 'aw-dropship',
    stock: computeStock(row),
    weight_kg: parseDecimal(row['Unit net weight']) ?? parseDecimal(row['Package weight (shipping)']),
    dimensions: parseDimensionsCell(row['Unit dimensions']),
    material: row['Materials/Ingredients']?.trim() || null,
    is_active: status === 'active',
  }
}

export function parseAwDropshipCsv(csvText: string): AwNormalizedProduct[] {
  const body = extractCsvBody(csvText)
  const records = parse(body, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
    trim: true,
    bom: true,
  }) as Record<string, string>[]

  const out: AwNormalizedProduct[] = []
  for (const row of records) {
    const p = normalizeRow(row)
    if (p) out.push(p)
  }
  return out
}

export async function fetchAwDropshipProducts(): Promise<AwNormalizedProduct[]> {
  const url = process.env.AW_DROPSHIP_FEED_URL?.trim()
  if (!url) {
    throw new Error('AW_DROPSHIP_FEED_URL no está definida')
  }

  const res = await fetch(url, {
    next: { revalidate: 0 },
    headers: {
      accept: 'text/csv,text/plain,*/*',
    },
  })

  if (!res.ok) {
    throw new Error(`AW Dropship feed HTTP ${res.status}`)
  }

  const text = await res.text()
  return parseAwDropshipCsv(text)
}
