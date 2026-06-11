import Link from 'next/link'
import type { ReactNode } from 'react'
import { ChevronLeft } from 'lucide-react'
import type { Supplier } from '@/lib/supabase/types'
import { createSupplierAction, updateSupplierAction } from './actions'

function Field({
  label, name, type = 'text', defaultValue, placeholder, required, step,
}: {
  label: string
  name: string
  type?: string
  defaultValue?: string
  placeholder?: string
  required?: boolean
  step?: string
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
  label: string
  name: string
  defaultValue?: string
  placeholder?: string
  rows?: number
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#6b5344] mb-1.5">{label}</label>
      <textarea
        name={name}
        defaultValue={defaultValue ?? ''}
        placeholder={placeholder}
        rows={rows ?? 4}
        className="w-full px-3 py-2 rounded-lg border border-[#e8ddd0] bg-white text-sm text-[#2a2a2a] placeholder:text-[#c8bdb5] focus:outline-none focus:ring-2 focus:ring-[#2d4a3e]/30 resize-y min-h-[80px]"
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

export function SupplierEditor({ supplier }: { supplier?: Supplier | null }) {
  const isNew = !supplier
  const action = isNew ? createSupplierAction : updateSupplierAction

  return (
    <form action={action} className="space-y-8">
      {!isNew ? <input type="hidden" name="id" value={supplier!.id} /> : null}

      <section className="bg-white rounded-2xl border border-[#e8ddd0] p-6 space-y-5">
        <h2 className="font-semibold text-[#2a2a2a] text-sm uppercase tracking-wide">Identificación</h2>
        {isNew ? (
          <>
            <Field
              label="Slug (código interno) *"
              name="slug"
              placeholder="gruposdm"
              required
            />
            <p className="text-[11px] text-[#a08c7a] -mt-2">
              Debe coincidir con el campo «Proveedor» en cada producto (solo minúsculas y guiones).
            </p>
          </>
        ) : (
          <div>
            <p className="text-xs font-medium text-[#6b5344] mb-1">Slug (no editable)</p>
            <p className="text-sm font-mono text-[#2a2a2a] bg-[#f9f6f1] px-3 py-2 rounded-lg border border-[#e8ddd0]">{supplier!.slug}</p>
            <p className="text-[11px] text-[#a08c7a] mt-1">Para cambiar el slug habría que actualizar también todos los productos enlazados.</p>
          </div>
        )}
        <Field label="Nombre comercial *" name="name" defaultValue={supplier?.name} required />
        <Field label="Razón social" name="legal_name" defaultValue={supplier?.legal_name ?? ''} />
        <Field label="Persona de contacto / departamento" name="contact_name" defaultValue={supplier?.contact_name ?? ''} />
      </section>

      <section className="bg-white rounded-2xl border border-[#e8ddd0] p-6 space-y-5">
        <h2 className="font-semibold text-[#2a2a2a] text-sm uppercase tracking-wide">Contacto</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Teléfono" name="phone" defaultValue={supplier?.phone ?? ''} placeholder="+34 952 426 920" />
          <Field label="Email" name="email" type="email" defaultValue={supplier?.email ?? ''} />
        </div>
        <Field label="Web" name="website" defaultValue={supplier?.website ?? ''} placeholder="https://www.gruposdm.com" />
      </section>

      <section className="bg-white rounded-2xl border border-[#e8ddd0] p-6 space-y-5">
        <h2 className="font-semibold text-[#2a2a2a] text-sm uppercase tracking-wide">Logística y envío (referencia interna)</h2>
        <FieldTextarea
          label="Gastos de envío / condiciones"
          name="shipping_info"
          defaultValue={supplier?.shipping_info ?? ''}
          rows={5}
          placeholder="Ej. Política tienda: gratis desde 600 €; tramos por importe…"
        />
        <FieldTextarea
          label="Plazos de entrega"
          name="delivery_time"
          defaultValue={supplier?.delivery_time ?? ''}
          rows={3}
          placeholder="Ej. Preparación 24–48 h; entrega 4–8 días laborables…"
        />
        <FieldTextarea
          label="Notas"
          name="notes"
          defaultValue={supplier?.notes ?? ''}
          rows={3}
          placeholder="Condiciones B2B, área de servicio, etc."
        />
      </section>

      <section className="bg-white rounded-2xl border border-[#e8ddd0] p-6 space-y-4">
        <ToggleField label="Proveedor activo (visible al elegir en productos)" name="is_active" defaultValue={supplier?.is_active ?? true} />
      </section>

      <div className="flex gap-3 justify-end">
        <Link
          href="/admin/proveedores"
          className="px-5 py-2.5 rounded-lg border border-[#e8ddd0] text-sm text-[#6b5344] hover:bg-[#f9f6f1] transition-colors"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          className="px-6 py-2.5 rounded-lg bg-[#2d4a3e] text-white text-sm font-medium hover:bg-[#1e3329] transition-colors shadow-sm"
        >
          {isNew ? 'Crear proveedor' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  )
}

export function SupplierEditorChrome({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <Link
        href="/admin/proveedores"
        className="inline-flex items-center gap-1.5 text-sm text-[#a08c7a] hover:text-[#2d4a3e] transition-colors mb-6"
      >
        <ChevronLeft className="w-4 h-4" /> Proveedores
      </Link>
      <h1 className="text-2xl font-bold text-[#2a2a2a] mb-8">{title}</h1>
      {children}
    </div>
  )
}
