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

/** Primera celda no vacía entre variantes EN/ES de cabecera CSV AW. */
function cell(row: Record<string, string>, ...keys: string[]): string | undefined {
  for (const k of keys) {
    const v = row[k]
    if (v !== undefined && String(v).trim() !== '') return v
  }
  return undefined
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
  const flag = (cell(row, 'Stock', 'Existencias') ?? '').trim().toLowerCase()
  if (flag === 'outofstock') return 0
  const qty = parseInt(
    cell(row, 'Available Quantity', 'Cantidad disponible') ?? '',
    10,
  )
  if (Number.isFinite(qty) && qty >= 0) return qty
  return 0
}

function mapAwCategory(row: Record<string, string>): string {
  const code = (
    cell(row, 'Department code', 'Código departamento', 'Codigo departamento') ?? ''
  ).toLowerCase()
  const dept = (cell(row, 'Department', 'Departamento') ?? '').toLowerCase()
  const sub = (
    cell(row, 'Subdepartment', 'Subdepartamento', 'Sub departamento') ?? ''
  ).toLowerCase()
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
  const productCode = (cell(row, 'Product code', 'Código de producto', 'Codigo de producto') ?? '').trim()
  const name = (cell(row, 'Unit Name', 'Nombre de la unidad', 'Nombre unitario') ?? '').trim()
  if (!productCode || !name) return null

  const status = (cell(row, 'Status', 'Estado') ?? '').trim().toLowerCase()

  const description: string | null = ((): string | null => {
    const plainRaw = (
      cell(
        row,
        'Webpage description (plain text)',
        'Descripción página web (texto plano)',
      ) ?? ''
    ).trim()
    if (plainRaw) return plainRaw
    const htmlRaw = (
      cell(
        row,
        'Webpage description (html)',
        'Descripción página web (html)',
      ) ?? ''
    ).trim()
    if (!htmlRaw) return null
    const stripped = stripHtml(htmlRaw).trim()
    return stripped || null
  })()

  const rrp = parseDecimal(cell(row, 'Unit RRP', 'RRP unitario', 'PVR unitario'))
  const wholesale =
    parseDecimal(cell(row, 'Unit price', 'Precio unitario')) ??
    parseDecimal(cell(row, 'Price', 'Precio'))
  const price = rrp ?? wholesale ?? 0

  const deptName = cell(row, 'Department', 'Departamento') ?? ''
  const subName =
    cell(row, 'Subdepartment', 'Subdepartamento', 'Sub departamento') ?? ''
  const tags = [(cell(row, 'Family', 'Familia') ?? ''), deptName, subName]
    .map((t) => t.trim())
    .filter(Boolean)

  return {
    slug: slugFromProductCode(productCode),
    name,
    description,
    price,
    cost_price: wholesale,
    images: parseImageUrls(cell(row, 'Images', 'Imágenes', 'Imagenes')),
    category: mapAwCategory(row),
    subcategory: subName.trim() || null,
    tags,
    sku: `AW-${productCode}`,
    supplier_sku: productCode,
    supplier: 'aw-dropship',
    stock: computeStock(row),
    weight_kg:
      parseDecimal(cell(row, 'Unit net weight', 'Peso neto de la unidad')) ??
      parseDecimal(cell(row, 'Package weight (shipping)', 'Peso del paquete (envío)')),
    dimensions: parseDimensionsCell(
      cell(row, 'Unit dimensions', 'Dimensiones de la unidad'),
    ),
    material:
      (
        cell(
          row,
          'Materials/Ingredients',
          'Materiales/Ingredientes',
          'Materials',
        ) ?? ''
      ).trim() || null,
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
