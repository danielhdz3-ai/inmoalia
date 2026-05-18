'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { assertAdmin } from '@/lib/admin/assert-admin'

function db() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

function trim(formData: FormData, key: string): string | null {
  const v = formData.get(key)
  if (v == null || typeof v !== 'string') return null
  const t = v.trim()
  return t === '' ? null : t
}

function parseActive(formData: FormData): boolean {
  return formData.getAll('is_active').includes('true')
}

export async function createSupplierAction(formData: FormData) {
  await assertAdmin()
  const slugRaw = trim(formData, 'slug') ?? ''
  const slug = slugRaw.toLowerCase().replace(/\s+/g, '-')
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    throw new Error('Slug inválido: usa minúsculas, números y guiones.')
  }
  const name = (formData.get('name') as string)?.trim() ?? ''
  if (!name) throw new Error('El nombre comercial es obligatorio.')

  const payload = {
    slug,
    name,
    legal_name: trim(formData, 'legal_name'),
    contact_name: trim(formData, 'contact_name'),
    phone: trim(formData, 'phone'),
    email: trim(formData, 'email'),
    website: trim(formData, 'website'),
    shipping_info: trim(formData, 'shipping_info'),
    delivery_time: trim(formData, 'delivery_time'),
    notes: trim(formData, 'notes'),
    is_active: parseActive(formData),
  }

  const { error } = await db().from('suppliers').insert(payload as never)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/proveedores')
  revalidatePath('/admin/inventario')
  revalidatePath('/admin/productos')
  redirect('/admin/proveedores')
}

export async function updateSupplierAction(formData: FormData) {
  await assertAdmin()
  const id = (formData.get('id') as string)?.trim()
  if (!id) throw new Error('Identificador interno no válido.')

  const name = (formData.get('name') as string)?.trim() ?? ''
  if (!name) throw new Error('El nombre comercial es obligatorio.')

  const payload = {
    name,
    legal_name: trim(formData, 'legal_name'),
    contact_name: trim(formData, 'contact_name'),
    phone: trim(formData, 'phone'),
    email: trim(formData, 'email'),
    website: trim(formData, 'website'),
    shipping_info: trim(formData, 'shipping_info'),
    delivery_time: trim(formData, 'delivery_time'),
    notes: trim(formData, 'notes'),
    is_active: parseActive(formData),
  }

  const { error } = await db().from('suppliers').update(payload as never).eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/proveedores')
  revalidatePath('/admin/inventario')
  revalidatePath('/admin/productos')
  redirect('/admin/proveedores')
}
