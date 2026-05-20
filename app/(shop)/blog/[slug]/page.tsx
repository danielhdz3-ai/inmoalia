import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { JsonLd } from '@/components/seo/JsonLd'
import BlogMarkdown from '@/components/blog/BlogMarkdown'
import { getAllBlogSlugs, getBlogPost } from '@/lib/content/blog-posts'
import { articleJsonLd } from '@/lib/seo/jsonld-builders'
import { absoluteUrl } from '@/lib/site'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getBlogPost(slug)
  if (!post) return { title: 'Artículo no encontrado' }
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: absoluteUrl(`/blog/${slug}`) },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      url: absoluteUrl(`/blog/${slug}`),
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = getBlogPost(slug)
  if (!post) notFound()

  return (
    <>
      <JsonLd data={articleJsonLd(post)} />

      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10 md:py-16">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-[#a08c7a] hover:text-[#2d4a3e] mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al blog
        </Link>

        <p className="text-xs font-medium text-[#2d4a3e] uppercase tracking-wide mb-2">{post.category}</p>
        <h1 className="text-2xl md:text-4xl font-bold text-[#2a2a2a] mb-4 leading-tight">{post.title}</h1>
        <p className="text-[#a08c7a] text-sm mb-10">
          {new Date(post.publishedAt).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
          {' · '}
          {post.readingMinutes} min lectura
        </p>

        <BlogMarkdown content={post.content} />

        {post.relatedLinks.length > 0 && (
          <aside className="mt-12 pt-8 border-t border-[#e8ddd0]">
            <h2 className="text-sm font-semibold text-[#2a2a2a] uppercase tracking-wide mb-4">Enlaces útiles</h2>
            <ul className="space-y-2">
              {post.relatedLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-[#2d4a3e] hover:underline text-sm">
                    {link.label} →
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </article>
    </>
  )
}
