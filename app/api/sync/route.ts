import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { syncDropXLProducts } from '@/lib/providers/dropxl'
import { syncDropperyProducts } from '@/lib/providers/droppery'
import { slugify } from '@/lib/utils'

export const runtime = 'nodejs'
export const maxDuration = 300

export async function POST(req: NextRequest) {
  // Verificar que la llamada viene de GitHub Actions o cron autorizado
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.SYNC_SECRET_KEY}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { supplier } = await req.json()
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const startedAt = new Date().toISOString()
  let productsUpserted = 0
  const errors: string[] = []

  if (supplier === 'dropxl' || supplier === 'all') {
    try {
      const products = await syncDropXLProducts()

      for (const p of products) {
        const slug = slugify(p.name)
        const { error } = await supabase.from('products').upsert(
          {
            slug,
            name: p.name,
            description: p.description,
            price: p.price,
            cost_price: p.cost_price,
            images: p.images,
            category: mapCategory(p.category),
            sku: `DXL-${p.sku}`,
            supplier_sku: p.sku,
            supplier: 'dropxl',
            stock: p.stock,
            weight_kg: p.weight_kg,
            dimensions: p.dimensions,
            material: p.material,
            is_active: true,
          } as never,
          { onConflict: 'supplier_sku' }
        )
        if (error) errors.push(`DropXL ${p.sku}: ${error.message}`)
        else productsUpserted++
      }
    } catch (err) {
      errors.push(`DropXL sync failed: ${err}`)
    }
  }

  if (supplier === 'droppery' || supplier === 'all') {
    try {
      const products = await syncDropperyProducts()

      for (const p of products) {
        const slug = slugify(p.name)
        const { error } = await supabase.from('products').upsert(
          {
            slug,
            name: p.name,
            description: p.description,
            price: p.retail_price,
            cost_price: p.wholesale_price,
            images: p.images,
            category: mapCategory(p.category),
            tags: p.tags,
            sku: `DRP-${p.sku}`,
            supplier_sku: p.sku,
            supplier: 'droppery',
            stock: p.stock_quantity,
            weight_kg: p.weight,
            material: p.material,
            color: p.color,
            is_active: true,
          } as never,
          { onConflict: 'supplier_sku' }
        )
        if (error) errors.push(`Droppery ${p.sku}: ${error.message}`)
        else productsUpserted++
      }
    } catch (err) {
      errors.push(`Droppery sync failed: ${err}`)
    }
  }

  // Guardar log
  await supabase.from('sync_logs').insert({
    supplier: supplier,
    status: errors.length === 0 ? 'success' : 'error',
    products_synced: productsUpserted,
    errors: errors.length > 0 ? errors : null,
    started_at: startedAt,
    finished_at: new Date().toISOString(),
  } as never)

  return NextResponse.json({
    success: true,
    products_synced: productsUpserted,
    errors: errors.length > 0 ? errors : null,
  })
}

function mapCategory(supplierCategory: string): string {
  const lower = supplierCategory.toLowerCase()
  if (lower.includes('garden') || lower.includes('outdoor') || lower.includes('exterior')) return 'jardin'
  if (lower.includes('table') || lower.includes('mesa')) return 'mesas'
  if (lower.includes('chair') || lower.includes('silla') || lower.includes('sofa')) return 'sillas'
  if (lower.includes('light') || lower.includes('lamp') || lower.includes('iluminacion')) return 'iluminacion'
  if (lower.includes('decor') || lower.includes('decoracion') || lower.includes('mirror')) return 'decoracion'
  if (lower.includes('textile') || lower.includes('textil') || lower.includes('rug')) return 'textil'
  return 'muebles'
}
