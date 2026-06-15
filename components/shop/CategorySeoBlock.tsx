import Link from 'next/link'
import { CATEGORY_META } from '@/lib/shop/category-meta'
import { CHAIR_SUBCATEGORY_LINKS } from '@/lib/shop/chair-seo'

type Props = {
  categoria: string
}

export default function CategorySeoBlock({ categoria }: Props) {
  const meta = CATEGORY_META[categoria]
  if (!meta) return null

  const showChairSubs =
    categoria === 'sillas' || categoria.startsWith('sillas-')

  return (
    <div className="mt-12 space-y-8">
      {showChairSubs && categoria === 'sillas' && (
        <div>
          <h2 className="text-lg font-semibold text-[#2a2a2a] mb-3">Tipos de sillas</h2>
          <div className="flex flex-wrap gap-2">
            {CHAIR_SUBCATEGORY_LINKS.map((sub) => (
              <Link
                key={sub.slug}
                href={`/categorias/${sub.slug}`}
                className="text-sm px-4 py-2 rounded-full border border-[#e8ddd0] bg-white text-[#2d4a3e] hover:bg-[#f9f6f1] transition-colors"
              >
                {sub.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {meta.seoContent && (
        <div className="p-6 rounded-2xl bg-[#f9f6f1] border border-[#e8ddd0]">
          <p className="text-sm text-[#6b5344] leading-relaxed">{meta.seoContent}</p>
        </div>
      )}

      {meta.relatedGuides && meta.relatedGuides.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-[#2a2a2a] mb-3">Guías de compra</h2>
          <ul className="space-y-2">
            {meta.relatedGuides.map((guide) => (
              <li key={guide.href}>
                <Link
                  href={guide.href}
                  className="text-sm text-[#2d4a3e] font-medium hover:underline"
                >
                  {guide.label} →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {categoria.startsWith('sillas-') && (
        <p className="text-xs text-[#a08c7a]">
          <Link href="/categorias/sillas" className="hover:text-[#2d4a3e] underline">
            Ver todas las sillas y butacas
          </Link>
        </p>
      )}
    </div>
  )
}
