'use client'

import { useState } from 'react'
import { RefreshCw, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

type SyncStatus = 'idle' | 'loading' | 'success' | 'error'

type SupplierKey = 'dropxl' | 'droppery' | 'aw-dropship' | 'all'

export default function SincronizacionPage() {
  const [statusMap, setStatusMap] = useState<Record<SupplierKey, SyncStatus>>({
    dropxl: 'idle',
    droppery: 'idle',
    'aw-dropship': 'idle',
    all: 'idle',
  })
  const [results, setResults] = useState<Record<string, unknown> | null>(null)

  const setSupplierStatus = (supplier: SupplierKey, s: SyncStatus) => {
    setStatusMap((prev) => ({ ...prev, [supplier]: s }))
  }

  const handleSync = async (supplier: SupplierKey) => {
    setSupplierStatus(supplier, 'loading')
    setResults(null)

    try {
      const res = await fetch('/api/admin/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supplier }),
      })

      const data = await res.json()
      setResults(data)
      setSupplierStatus(supplier, res.ok ? 'success' : 'error')
    } catch {
      setSupplierStatus(supplier, 'error')
    }
  }

  const StatusIcon = ({ status }: { status: SyncStatus }) => {
    if (status === 'loading') return <Loader2 className="w-4 h-4 animate-spin" />
    if (status === 'success') return <CheckCircle className="w-4 h-4 text-[#27ae60]" />
    if (status === 'error') return <XCircle className="w-4 h-4 text-[#c0392b]" />
    return <RefreshCw className="w-4 h-4" />
  }

  const items: { supplier: Exclude<SupplierKey, 'all'>; name: string; desc: string }[] = [
    {
      supplier: 'dropxl',
      name: 'dropXL (vidaXL)',
      desc: 'Muebles, jardín y hogar en gran escala.',
    },
    {
      supplier: 'droppery',
      name: 'Droppery',
      desc: 'Selección boutique europea.',
    },
    {
      supplier: 'aw-dropship',
      name: 'AW Dropship',
      desc: 'Catálogo desde el CSV del panel (Ancient Wisdom).',
    },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-[#2a2a2a] mb-2">Sincronización de catálogo</h1>
      <p className="text-[#a08c7a] text-sm mb-8">
        Actualiza precios, stock e información. AW usa la variable{' '}
        <code className="text-xs bg-[#f9f6f1] px-1 rounded border">AW_DROPSHIP_FEED_URL</code> apuntando al
        CSV de tu cuenta.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {items.map((item) => (
          <div key={item.supplier} className="bg-white rounded-2xl border border-[#e8ddd0] p-5">
            <h3 className="font-semibold text-[#2a2a2a] mb-1">{item.name}</h3>
            <p className="text-xs text-[#a08c7a] mb-4">{item.desc}</p>
            <Button
              onClick={() => handleSync(item.supplier)}
              disabled={statusMap[item.supplier] === 'loading'}
              variant={statusMap[item.supplier] === 'success' ? 'secondary' : 'default'}
              size="sm"
              className="w-full gap-2"
            >
              <StatusIcon status={statusMap[item.supplier]} />
              {statusMap[item.supplier] === 'loading' ? 'Sincronizando...' : 'Sincronizar'}
            </Button>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-[#e8ddd0] p-5 mb-8">
        <h3 className="font-semibold text-[#2a2a2a] mb-1">Todos los proveedores</h3>
        <p className="text-xs text-[#a08c7a] mb-4">dropXL + Droppery + AW en una sola pasada.</p>
        <Button
          onClick={() => handleSync('all')}
          disabled={statusMap.all === 'loading'}
          variant={statusMap.all === 'success' ? 'secondary' : 'default'}
          size="sm"
          className="gap-2"
        >
          <StatusIcon status={statusMap.all} />
          {statusMap.all === 'loading' ? 'Sincronizando...' : 'Sincronizar todo'}
        </Button>
      </div>

      {results && (
        <div className="bg-white rounded-2xl border border-[#e8ddd0] p-6">
          <h3 className="font-semibold text-[#2a2a2a] mb-3">Resultado de la sincronización</h3>
          <pre className="text-xs bg-[#f9f6f1] rounded-lg p-4 overflow-x-auto text-[#2a2a2a]">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-8 bg-[#f9f6f1] border border-[#e8ddd0] rounded-2xl p-6">
        <h3 className="font-semibold text-[#2a2a2a] mb-2">Automatización con GitHub Actions</h3>
        <p className="text-sm text-[#6b5344] mb-4">
          La sincronización automática se ejecuta diariamente mediante GitHub Actions. El workflow llama al
          endpoint <code className="bg-white px-1.5 py-0.5 rounded text-xs border">/api/sync</code> con
          autorización Bearer.
        </p>
        <pre className="text-xs bg-[#2a2a2a] text-[#c9a84c] rounded-lg p-4 overflow-x-auto">
{`# Proveedor: all | dropxl | droppery | aw-dropship
curl -X POST "$SITE_URL/api/sync" \\
  -H "Authorization: Bearer $SYNC_SECRET" \\
  -H "Content-Type: application/json" \\
  -d '{"supplier":"all"}'`}
        </pre>
      </div>
    </div>
  )
}
