import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import { MDXRemote } from 'next-mdx-remote/rsc'

// Render MDX in App Router (RSC) with our preferred plugins.
// Allows raw HTML inside MDX and adds heading ids/links.
export function Mdx({ source, components = {} }) {
  return (
    <MDXRemote
      source={source}
      components={components}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [
            rehypeSlug,
            [rehypeAutolinkHeadings, { behavior: 'wrap', properties: { className: ['anchor-link'] } }],
          ],
          // Allow raw HTML processing
          development: process.env.NODE_ENV !== 'production',
        },
      }}
    />
  )
}
