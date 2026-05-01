'use client'

import { useState } from 'react'
import { RefreshCw, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

type SyncStatus = 'idle' | 'loading' | 'success' | 'error'

export default function SincronizacionPage() {
  const [dropxlStatus, setDropxlStatus] = useState<SyncStatus>('idle')
  const [dropperyStatus, setDropperyStatus] = useState<SyncStatus>('idle')
  const [allStatus, setAllStatus] = useState<SyncStatus>('idle')
  const [results, setResults] = useState<Record<string, unknown> | null>(null)

  const handleSync = async (supplier: 'dropxl' | 'droppery' | 'all') => {
    const setStatus = supplier === 'dropxl' ? setDropxlStatus : supplier === 'droppery' ? setDropperyStatus : setAllStatus
    setStatus('loading')
    setResults(null)

    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SYNC_SECRET ?? 'dev-secret'}`,
        },
        body: JSON.stringify({ supplier }),
      })

      const data = await res.json()
      setResults(data)
      setStatus(res.ok ? 'success' : 'error')
    } catch {
      setStatus('error')
    }
  }

  const StatusIcon = ({ status }: { status: SyncStatus }) => {
    if (status === 'loading') return <Loader2 className="w-4 h-4 animate-spin" />
    if (status === 'success') return <CheckCircle className="w-4 h-4 text-[#27ae60]" />
    if (status === 'error') return <XCircle className="w-4 h-4 text-[#c0392b]" />
    return <RefreshCw className="w-4 h-4" />
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-[#2a2a2a] mb-2">Sincronización de catálogo</h1>
      <p className="text-[#a08c7a] text-sm mb-8">
        Sincroniza el catálogo de productos con los proveedores dropXL y Droppery. Esta operación actualiza precios, stock e información de productos.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          {
            supplier: 'dropxl' as const,
            name: 'dropXL (vidaXL)',
            desc: 'Proveedor principal de volumen. Muebles, jardín y hogar en gran escala.',
            status: dropxlStatus,
          },
          {
            supplier: 'droppery' as const,
            name: 'Droppery',
            desc: 'Proveedor boutique europeo. Productos seleccionados de calidad premium.',
            status: dropperyStatus,
          },
          {
            supplier: 'all' as const,
            name: 'Todos los proveedores',
            desc: 'Sincroniza dropXL y Droppery en una sola operación.',
            status: allStatus,
          },
        ].map((item) => (
          <div key={item.supplier} className="bg-white rounded-2xl border border-[#e8ddd0] p-5">
            <h3 className="font-semibold text-[#2a2a2a] mb-1">{item.name}</h3>
            <p className="text-xs text-[#a08c7a] mb-4">{item.desc}</p>
            <Button
              onClick={() => handleSync(item.supplier)}
              disabled={item.status === 'loading'}
              variant={item.status === 'success' ? 'secondary' : 'default'}
              size="sm"
              className="w-full gap-2"
            >
              <StatusIcon status={item.status} />
              {item.status === 'loading' ? 'Sincronizando...' : 'Sincronizar'}
            </Button>
          </div>
        ))}
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
          La sincronización automática se ejecuta diariamente a las 6:00 AM mediante GitHub Actions.
          El workflow llama al endpoint <code className="bg-white px-1.5 py-0.5 rounded text-xs border">/api/sync</code> con autorización Bearer.
        </p>
        <pre className="text-xs bg-[#2a2a2a] text-[#c9a84c] rounded-lg p-4 overflow-x-auto">
{`# .github/workflows/sync.yml
name: Daily Catalog Sync
on:
  schedule:
    - cron: '0 6 * * *'
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Sync catalog
        run: |
          curl -X POST "$SITE_URL/api/sync" \\
            -H "Authorization: Bearer $SYNC_SECRET" \\
            -H "Content-Type: application/json" \\
            -d '{"supplier":"all"}'`}
        </pre>
      </div>
    </div>
  )
}
