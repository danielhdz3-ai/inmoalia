import { createClient } from '@supabase/supabase-js'
import { notFound, redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { assertAdmin } from '@/lib/admin/assert-admin'
import { ProductImagesUrlsInput } from '@/components/admin/ProductImagesUrlsInput'
import type { Product } from '@/lib/supabase/types'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

function trimmedOrNull(v: FormDataEntryValue | null): string | null {
  if (v == null || typeof v !== 'string') return null
  const t = v.trim()
  return t === '' ? null : t
}

function parseOptionalFloat(formData: FormData, key: string): number | null {
  const v = formData.get(key)
  if (v == null || v === '') return null
  const n = parseFloat(String(v))
  return Number.isFinite(n) ? n : null
}

function dimField(product: Product | null, key: 'width' | 'height' | 'depth'): string {
  if (!product?.dimensions || typeof product.dimensions !== 'object') return ''
  const v = (product.dimensions as Record<string, unknown>)[key]
  return typeof v === 'number' && Number.isFinite(v) ? String(v) : ''
}

async function saveProduct(formData: FormData) {
  'use server'
  await assertAdmin()
  const supabase = createAdminClient()
  const id = formData.get('id') as string
  const isNew = id === 'nuevo'

  const name = (formData.get('name') as string).trim()
  const slugRaw = (formData.get('slug') as string).trim()
  const slug = slugRaw || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const dimW = parseOptionalFloat(formData, 'dim_width')
  const dimH = parseOptionalFloat(formData, 'dim_height')
  const dimD = parseOptionalFloat(formData, 'dim_depth')
  const dimensions =
    dimW != null && dimH != null && dimD != null
      ? ({ width: dimW, height: dimH, depth: dimD })
      : null

  const data = {
    name,
    slug,
    description: (formData.get('description') as string) || null,
    price: parseFloat(formData.get('price') as string) || 0,
    cost_price: parseOptionalFloat(formData, 'cost_price'),
    category: formData.get('category') as string,
    subcategory: (formData.get('subcategory') as string) || null,
    sku: trimmedOrNull(formData.get('sku')),
    supplier_sku: trimmedOrNull(formData.get('supplier_sku')),
    supplier: trimmedOrNull(formData.get('supplier')),
    supplier_product_url: trimmedOrNull(formData.get('supplier_product_url')),
    stock: parseInt(formData.get('stock') as string, 10) || 0,
    material: (formData.get('material') as string) || null,
    color: (formData.get('color') as string) || null,
    dimensions: dimensions as never,
    weight_kg: parseOptionalFloat(formData, 'weight_kg'),
    is_active: formData.get('is_active') === 'true',
    is_featured: formData.get('is_featured') === 'true',
    meta_title: (formData.get('meta_title') as string) || null,
    meta_desc: (formData.get('meta_desc') as string) || null,
    images: (formData.get('images') as string)
      .split('\n')
      .map((u) => u.trim())
      .filter(Boolean),
    tags: (formData.get('tags') as string)
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean),
  }

  if (isNew) {
    const { error } = await supabase.from('products').insert(data as never)
    if (error) throw new Error(error.message)
  } else {
    const { error } = await supabase.from('products').update(data as never).eq('id', id)
    if (error) throw new Error(error.message)
  }

  revalidatePath('/admin/productos')
  revalidatePath('/admin/inventario')
  revalidatePath('/admin/proveedores')
  revalidatePath(`/productos/${slug}`)
  redirect('/admin/productos')
}

const CATEGORIES = ['jardin', 'mesas', 'sillas', 'iluminacion', 'decoracion', 'textil', 'muebles', 'outlet']

export default async function EditProductPage({ params }: Props) {
  const { id } = await params
  const isNew = id === 'nuevo'

  let product: Product | null = null

  if (!isNew) {
    const supabase = createAdminClient()
    const { data } = await supabase.from('products').select('*').eq('id', id).single()
    if (!data) notFound()
    product = data as unknown as Product
  }

  const { data: rawSupplierRows } = await createAdminClient()
    .from('suppliers')
    .select('slug,name')
    .eq('is_active', true)
    .order('name', { ascending: true })
  const supplierRows = (rawSupplierRows as { slug: string; name: string }[] | null) ?? []
  const supplierSlugs = new Set(supplierRows.map((r) => r.slug))
  const orphanSupplier =
    !isNew && product?.supplier && !supplierSlugs.has(product.supplier) ? product.supplier : null

  const title = isNew ? 'Nuevo producto' : 'Editar producto'

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <Link
        href="/admin/productos"
        className="inline-flex items-center gap-1.5 text-sm text-[#a08c7a] hover:text-[#2d4a3e] transition-colors mb-6"
      >
        <ChevronLeft className="w-4 h-4" /> Volver a productos
      </Link>

      <h1 className="text-2xl font-bold text-[#2a2a2a] mb-8">{title}</h1>

      <form action={saveProduct} className="space-y-8">
        <input type="hidden" name="id" value={id} />

        {/* Información básica */}
        <section className="bg-white rounded-2xl border border-[#e8ddd0] p-6 space-y-5">
          <h2 className="font-semibold text-[#2a2a2a] text-sm uppercase tracking-wide">Información básica</h2>

          <Field label="Nombre del producto *" name="name" defaultValue={product?.name} required />

          <div className="grid grid-cols-2 gap-4">
            <Field label="Slug (URL)" name="slug" defaultValue={product?.slug} placeholder="silla-madera-natural" />
            <Field label="SKU" name="sku" defaultValue={product?.sku ?? ''} />
          </div>

          <FieldTextarea label="Descripción" name="description" defaultValue={product?.description ?? ''} rows={4} />
        </section>

        {/* Precio y stock */}
        <section className="bg-white rounded-2xl border border-[#e8ddd0] p-6 space-y-5">
          <h2 className="font-semibold text-[#2a2a2a] text-sm uppercase tracking-wide">Precio y stock</h2>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Precio venta (€) *" name="price" type="number" step="0.01" defaultValue={String(product?.price ?? '')} required />
            <Field label="Coste proveedor (€)" name="cost_price" type="number" step="0.01" defaultValue={product?.cost_price != null ? String(product.cost_price) : ''} />
            <Field label="Stock" name="stock" type="number" defaultValue={String(product?.stock ?? 0)} />
          </div>
          <Field label="Peso (kg)" name="weight_kg" type="number" step="0.01" defaultValue={product?.weight_kg != null ? String(product.weight_kg) : ''} />

          <p className="text-xs font-medium text-[#6b5344]">Dimensiones paquete (cm)</p>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Ancho" name="dim_width" type="number" step="0.1" defaultValue={dimField(product, 'width')} />
            <Field label="Alto" name="dim_height" type="number" step="0.1" defaultValue={dimField(product, 'height')} />
            <Field label="Fondo" name="dim_depth" type="number" step="0.1" defaultValue={dimField(product, 'depth')} />
          </div>
          <p className="text-[11px] text-[#a08c7a] -mt-2">Dejar las tres vacías para no guardar dimensiones.</p>
        </section>

        {/* Proveedor */}
        <section className="bg-white rounded-2xl border border-[#e8ddd0] p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h2 className="font-semibold text-[#2a2a2a] text-sm uppercase tracking-wide">Proveedor</h2>
            <Link href="/admin/proveedores" className="text-xs text-[#2d4a3e] hover:underline font-medium">
              Directorio de proveedores →
            </Link>
          </div>
          <p className="text-xs text-[#a08c7a]">
            Elige el proveedor del catálogo interno (slug guardado en el producto). SKU y URL de ficha del mayorista siguen abajo.
          </p>
          <div>
            <label className="block text-xs font-medium text-[#6b5344] mb-1.5">Proveedor del catálogo</label>
            <select
              name="supplier"
              defaultValue={
                product?.supplier ??
                (supplierRows.some((r) => r.slug === 'gruposdm') ? 'gruposdm' : supplierRows[0]?.slug ?? '')
              }
              className="w-full h-10 px-3 rounded-lg border border-[#e8ddd0] bg-white text-sm text-[#2a2a2a] focus:outline-none focus:ring-2 focus:ring-[#2d4a3e]/30"
            >
              <option value="">— Sin proveedor —</option>
              {supplierRows.map((r) => (
                <option key={r.slug} value={r.slug}>
                  {r.name} ({r.slug})
                </option>
              ))}
              {orphanSupplier ? (
                <option value={orphanSupplier}>
                  {orphanSupplier} (no está en el directorio; edita o crea la ficha)
                </option>
              ) : null}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="SKU proveedor" name="supplier_sku" defaultValue={product?.supplier_sku ?? ''} placeholder="Ej. 290.SVENE2SNE" />
            <Field
              label="URL ficha proveedor"
              name="supplier_product_url"
              defaultValue={product?.supplier_product_url ?? ''}
              placeholder="https://gruposdm.com/..."
            />
          </div>
        </section>

        {/* Categoría y atributos */}
        <section className="bg-white rounded-2xl border border-[#e8ddd0] p-6 space-y-5">
          <h2 className="font-semibold text-[#2a2a2a] text-sm uppercase tracking-wide">Categoría y atributos</h2>

          <div>
            <label className="block text-xs font-medium text-[#6b5344] mb-1.5">Categoría *</label>
            <select
              name="category"
              defaultValue={product?.category ?? 'muebles'}
              required
              className="w-full h-10 px-3 rounded-lg border border-[#e8ddd0] bg-white text-sm text-[#2a2a2a] focus:outline-none focus:ring-2 focus:ring-[#2d4a3e]/30"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Subcategoría" name="subcategory" defaultValue={product?.subcategory ?? ''} placeholder="ej: Conjuntos exterior" />
            <Field label="Material" name="material" defaultValue={product?.material ?? ''} placeholder="ej: Ratán natural" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Color" name="color" defaultValue={product?.color ?? ''} placeholder="ej: Beige natural" />
            <Field label="Tags (separados por coma)" name="tags" defaultValue={product?.tags?.join(', ') ?? ''} placeholder="exterior, ratán, natural" />
          </div>
        </section>

        {/* Imágenes */}
        <section className="bg-white rounded-2xl border border-[#e8ddd0] p-6 space-y-4">
          <h2 className="font-semibold text-[#2a2a2a] text-sm uppercase tracking-wide">Imágenes</h2>
          <ProductImagesUrlsInput defaultValue={product?.images?.join('\n') ?? ''} />
        </section>

        {/* SEO */}
        <section className="bg-white rounded-2xl border border-[#e8ddd0] p-6 space-y-5">
          <h2 className="font-semibold text-[#2a2a2a] text-sm uppercase tracking-wide">SEO</h2>
          <Field label="Meta título" name="meta_title" defaultValue={product?.meta_title ?? ''} placeholder="Dejar vacío para usar el nombre del producto" />
          <FieldTextarea label="Meta descripción" name="meta_desc" defaultValue={product?.meta_desc ?? ''} rows={2} placeholder="Máximo 160 caracteres" />
        </section>

        {/* Visibilidad */}
        <section className="bg-white rounded-2xl border border-[#e8ddd0] p-6 space-y-4">
          <h2 className="font-semibold text-[#2a2a2a] text-sm uppercase tracking-wide">Visibilidad</h2>
          <div className="flex items-center gap-8">
            <ToggleField label="Producto activo (visible en tienda)" name="is_active" defaultValue={product?.is_active ?? true} />
            <ToggleField label="Producto destacado (aparece en home)" name="is_featured" defaultValue={product?.is_featured ?? false} />
          </div>
        </section>

        <div className="flex gap-3 justify-end">
          <Link
            href="/admin/productos"
            className="px-5 py-2.5 rounded-lg border border-[#e8ddd0] text-sm text-[#6b5344] hover:bg-[#f9f6f1] transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg bg-[#2d4a3e] text-white text-sm font-medium hover:bg-[#1e3329] transition-colors shadow-sm"
          >
            {isNew ? 'Crear producto' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({
  label, name, type = 'text', defaultValue, placeholder, required, step,
}: {
  label: string; name: string; type?: string; defaultValue?: string; placeholder?: string; required?: boolean; step?: string
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#6b5344] mb-1.5">{label}</label>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue ?? ''}
        placeholder={placeholder}
        required={required}
        step={step}
        className="w-full h-10 px-3 rounded-lg border border-[#e8ddd0] bg-white text-sm text-[#2a2a2a] placeholder:text-[#c8bdb5] focus:outline-none focus:ring-2 focus:ring-[#2d4a3e]/30"
      />
    </div>
  )
}

function FieldTextarea({
  label, name, defaultValue, placeholder, rows,
}: {
  label: string; name: string; defaultValue?: string; placeholder?: string; rows?: number
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#6b5344] mb-1.5">{label}</label>
      <textarea
        name={name}
        defaultValue={defaultValue ?? ''}
        placeholder={placeholder}
        rows={rows ?? 3}
        className="w-full px-3 py-2 rounded-lg border border-[#e8ddd0] bg-white text-sm text-[#2a2a2a] placeholder:text-[#c8bdb5] focus:outline-none focus:ring-2 focus:ring-[#2d4a3e]/30 resize-none"
      />
    </div>
  )
}

function ToggleField({ label, name, defaultValue }: { label: string; name: string; defaultValue: boolean }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <input type="hidden" name={name} value="false" />
      <input
        type="checkbox"
        name={name}
        value="true"
        defaultChecked={defaultValue}
        className="w-4 h-4 accent-[#2d4a3e]"
      />
      <span className="text-sm text-[#2a2a2a]">{label}</span>
    </label>
  )
}
