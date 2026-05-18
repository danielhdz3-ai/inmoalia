import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import type { Supplier } from '@/lib/supabase/types'
import { SupplierEditor, SupplierEditorChrome } from '../SupplierEditor'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
}

function adminDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export default async function EditarProveedorPage({ params }: Props) {
  const { slug: raw } = await params
  const slug = decodeURIComponent(raw)

  const { data } = await adminDb().from('suppliers').select('*').eq('slug', slug).single()
  if (!data) notFound()
  const supplier = data as unknown as Supplier

  return (
    <SupplierEditorChrome title={`Editar · ${supplier.name}`}>
      <SupplierEditor supplier={supplier} />
    </SupplierEditorChrome>
  )
}
