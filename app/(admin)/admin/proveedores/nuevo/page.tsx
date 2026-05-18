import { SupplierEditor, SupplierEditorChrome } from '../SupplierEditor'

export const dynamic = 'force-dynamic'

export default function NuevoProveedorPage() {
  return (
    <SupplierEditorChrome title="Nuevo proveedor">
      <SupplierEditor />
    </SupplierEditorChrome>
  )
}
