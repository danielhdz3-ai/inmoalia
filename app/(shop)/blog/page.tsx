import type { Metadata } from 'next'
import Link from 'next/link'
import { Calendar, Clock, ArrowRight } from 'lucide-react'
import { BLOG_POSTS } from '@/lib/content/blog-posts'
import { absoluteUrl } from '@/lib/site'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Blog — Sillas de oficina y guías hogar',
    description:
      'Consejos sobre sillas ergonómicas, teletrabajo, salón y decoración. Guías de compra INMOALIA.',
    alternates: { canonical: absoluteUrl('/blog') },
  }
}

export default function BlogPage() {
  const posts = [...BLOG_POSTS].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  )

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 md:py-16">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-[#2a2a2a] mb-2">Blog INMOALIA</h1>
        <p className="text-[#a08c7a]">
          Guías de sillas de oficina, teletrabajo y decoración para tu hogar.
        </p>
      </div>

      <div className="space-y-6">
        {posts.map((post) => (
          <article
            key={post.slug}
            className="bg-white rounded-2xl border border-[#e8ddd0] p-6 md:p-8 hover:shadow-md transition-shadow"
          >
            <p className="text-xs font-medium text-[#2d4a3e] uppercase tracking-wide mb-2">{post.category}</p>
            <h2 className="text-xl md:text-2xl font-bold text-[#2a2a2a] mb-2">
              <Link href={`/blog/${post.slug}`} className="hover:text-[#2d4a3e] transition-colors">
                {post.title}
              </Link>
            </h2>
            <p className="text-[#6b5344] text-sm leading-relaxed mb-4">{post.excerpt}</p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-[#a08c7a] mb-4">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(post.publishedAt).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {post.readingMinutes} min lectura
              </span>
            </div>
            <Link
              href={`/blog/${post.slug}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#2d4a3e] hover:text-[#1e3329]"
            >
              Leer artículo <ArrowRight className="w-4 h-4" />
            </Link>
          </article>
        ))}
      </div>

      <div className="mt-12 p-6 rounded-2xl bg-[#f9f6f1] border border-[#e8ddd0]">
        <h3 className="font-semibold text-[#2a2a2a] mb-2">¿Buscas silla de oficina?</h3>
        <p className="text-sm text-[#6b5344] mb-4">Explora nuestra colección con envío en 2–5 días.</p>
        <Link
          href="/colecciones/sillas-oficina"
          className="inline-flex items-center gap-2 bg-[#2d4a3e] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#1e3329]"
        >
          Ver sillas de oficina
        </Link>
      </div>
    </div>
  )
}
