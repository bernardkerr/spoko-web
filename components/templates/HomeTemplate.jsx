import { getBasePath } from '@/lib/paths'

export default function HomeTemplate({ html }) {
  const base = getBasePath()
  const processed = base
    ? html.replace(/href=\"\//g, `href=\"${base}/`)
    : html

  return (
    <main className="container py-16">
      {/* eslint-disable-next-line react/no-danger */}
      <article className="prose prose-lg dark:prose-invert mx-auto">
        <div dangerouslySetInnerHTML={{ __html: processed }} />
      </article>
    </main>
  )
}
