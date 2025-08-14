import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeStringify from 'rehype-stringify'

// Support both local `content/` and existing `content-submodule/`.
// Prefer `content/` for overrides.
const contentDirectories = [
  path.join(process.cwd(), 'content'),
  path.join(process.cwd(), 'content-submodule'),
]

// Custom rehype plugin to transform mermaid code blocks
function rehypeMermaid() {
  return (tree) => {
    const visit = (node, callback) => {
      callback(node)
      if (node.children) {
        node.children.forEach(child => visit(child, callback))
      }

// Transform simple HTML tags into styled components
// <buttons> -> <div class="..."> wrapper
// <button href="/path" variant="primary|secondary">Label</button> -> styled <a>
function rehypeSimpleComponents() {
  return (tree) => {
    const visit = (node, callback) => {
      callback(node)
      if (node.children) {
        node.children.forEach(child => visit(child, callback))
      }
    }

    visit(tree, (node) => {
      if (node.type !== 'element') return

      // Normalize tagName to lowercase; rehype-raw already lowercases HTML
      const tag = String(node.tagName || '').toLowerCase()

      if (tag === 'buttons') {
        node.tagName = 'div'
        node.properties = {
          ...(node.properties || {}),
          className: [
            'mt-12',
            'flex', 'flex-col', 'sm:flex-row',
            'gap-4', 'justify-center'
          ]
        }
      }

      // <cards> -> responsive grid wrapper
      if (tag === 'cards') {
        node.tagName = 'div'
        node.properties = {
          ...(node.properties || {}),
          className: [
            'mt-12',
            'grid', 'gap-6', 'md:grid-cols-2', 'lg:grid-cols-3'
          ]
        }
      }

      // <card title="...">children</card> -> styled card container
      if (tag === 'card') {
        const props = node.properties || {}
        const title = (props.title || '').toString()

        node.tagName = 'div'
        node.properties = {
          className: [
            'rounded-xl', 'border', 'bg-card', 'text-card-foreground', 'shadow'
          ]
        }

        const header = title
          ? [{
              type: 'element',
              tagName: 'div',
              properties: { className: ['p-6', 'pb-2'] },
              children: [{
                type: 'element',
                tagName: 'h3',
                properties: { className: ['text-xl', 'font-semibold', 'leading-none', 'tracking-tight'] },
                children: [{ type: 'text', value: title }]
              }]
            }]
          : []

        const content = [{
          type: 'element',
          tagName: 'div',
          properties: { className: ['p-6', title ? 'pt-2' : ''] },
          children: node.children || []
        }]

        node.children = [...header, ...content]
      }

      // <cards> -> responsive grid wrapper
      if (tag === 'cards') {
        node.tagName = 'div'
        node.properties = {
          ...(node.properties || {}),
          className: [
            'mt-12',
            'grid', 'gap-6', 'md:grid-cols-2', 'lg:grid-cols-3'
          ]
        }
      }

      // <card title="...">children</card> -> styled card container
      if (tag === 'card') {
        const props = node.properties || {}
        const title = (props.title || '').toString()

        node.tagName = 'div'
        node.properties = {
          className: [
            'rounded-xl', 'border', 'bg-card', 'text-card-foreground', 'shadow'
          ]
        }

        const header = title
          ? [{
              type: 'element',
              tagName: 'div',
              properties: { className: ['p-6', 'pb-2'] },
              children: [{
                type: 'element',
                tagName: 'h3',
                properties: { className: ['text-xl', 'font-semibold', 'leading-none', 'tracking-tight'] },
                children: [{ type: 'text', value: title }]
              }]
            }]
          : []

        const content = [{
          type: 'element',
          tagName: 'div',
          properties: { className: ['p-6', title ? 'pt-2' : ''] },
          children: node.children || []
        }]

        node.children = [...header, ...content]
      }

      if (tag === 'button') {
        const props = node.properties || {}
        const href = props.href || '#'
        const variant = (props.variant || 'primary').toString()
        // Extract text content
        const label = (node.children || [])
          .filter(c => c.type === 'text')
          .map(c => c.value)
          .join('')

        // Build classes based on variant
        const base = [
          'inline-flex', 'items-center', 'justify-center',
          'rounded-md', 'text-sm', 'font-medium', 'ring-offset-background',
          'transition-colors', 'focus-visible:outline-none',
          'focus-visible:ring-2', 'focus-visible:ring-ring',
          'focus-visible:ring-offset-2', 'h-10', 'px-6'
        ]
        const variantClasses = variant === 'secondary'
          ? ['border', 'border-input', 'bg-background', 'hover:bg-accent', 'hover:text-accent-foreground']
          : ['bg-primary', 'text-primary-foreground', 'hover:bg-primary/90']

        node.tagName = 'a'
        node.properties = {
          href,
          className: [...base, ...variantClasses]
        }
        node.children = [{ type: 'text', value: label }]
      }
    })
  }
}
    }

    visit(tree, (node) => {
      if (node.type === 'element' && 
          node.tagName === 'pre' && 
          node.children?.[0]?.tagName === 'code' &&
          node.children[0].properties?.className?.includes('language-mermaid')) {
        
        const code = node.children[0].children[0]?.value || ''
        
        // Replace with custom Mermaid component
        node.tagName = 'div'
        node.properties = { className: ['mermaid-wrapper'] }
        node.children = [{
          type: 'element',
          tagName: 'div',
          properties: { 
            className: ['mermaid'],
            'data-mermaid': code
          },
          children: []
        }]
      }
    })
  }
}

// Transform simple HTML tags into styled components (top-level)
// <buttons> -> flex wrapper; <button href variant> -> styled <a>
function rehypeSimpleComponents() {
  return (tree) => {
    const visit = (node, callback) => {
      callback(node)
      if (node.children) {
        node.children.forEach(child => visit(child, callback))
      }
    }

    visit(tree, (node) => {
      if (node.type !== 'element') return

      const tag = String(node.tagName || '').toLowerCase()

      if (tag === 'buttons') {
        node.tagName = 'div'
        node.properties = {
          ...(node.properties || {}),
          className: [
            'mt-12',
            'flex', 'flex-col', 'sm:flex-row',
            'gap-4', 'justify-center'
          ]
        }
      }

      if (tag === 'button') {
        const props = node.properties || {}
        const href = props.href || '#'
        const variant = (props.variant || 'primary').toString()
        const label = (node.children || [])
          .filter(c => c.type === 'text')
          .map(c => c.value)
          .join('')

        const base = [
          'inline-flex', 'items-center', 'justify-center',
          'rounded-md', 'text-sm', 'font-medium', 'ring-offset-background',
          'transition-colors', 'focus-visible:outline-none',
          'focus-visible:ring-2', 'focus-visible:ring-ring',
          'focus-visible:ring-offset-2', 'h-10', 'px-6'
        ]
        const variantClasses = variant === 'secondary'
          ? ['border', 'border-input', 'bg-background', 'hover:bg-accent', 'hover:text-accent-foreground']
          : ['bg-primary', 'text-primary-foreground', 'hover:bg-primary/90']

        node.tagName = 'a'
        node.properties = { href, className: [...base, ...variantClasses] }
        node.children = [{ type: 'text', value: label }]
      }
    })
  }
}

export async function getMarkdownFiles() {
  const discovered = []

  function walkDir(dir, basePath = '') {
    if (!fs.existsSync(dir)) return
    const items = fs.readdirSync(dir)
    for (const item of items) {
      const fullPath = path.join(dir, item)
      const relativePath = path.join(basePath, item)
      if (fs.statSync(fullPath).isDirectory()) {
        walkDir(fullPath, relativePath)
      } else if (item.endsWith('.md')) {
        discovered.push({
          slug: relativePath.replace(/\.md$/, '').replace(/\\/g, '/'),
          fullPath,
          root: dir,
        })
      }
    }
  }

  // Walk both roots; earlier roots have higher priority.
  for (const dir of contentDirectories) {
    walkDir(dir)
  }

  // Deduplicate by slug, preferring earlier roots (content over content-submodule).
  const seen = new Set()
  const files = []
  for (const f of discovered) {
    if (seen.has(f.slug)) continue
    seen.add(f.slug)
    files.push({ slug: f.slug, fullPath: f.fullPath })
  }
  return files
}

export async function getMarkdownContent(slug) {
  const files = await getMarkdownFiles()
  const file = files.find(f => f.slug === slug)
  
  if (!file) {
    return null
  }
  
  const fileContents = fs.readFileSync(file.fullPath, 'utf8')
  const { data, content } = matter(fileContents)
  
  // Process markdown to HTML with unified pipeline
  // Allow raw HTML blocks so simple tags like <BUTTON>, <a>, etc. are preserved.
  const htmlContent = await remark()
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw) // parse and include raw HTML from markdown
    .use(rehypeSimpleComponents)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, {
      behavior: 'wrap',
      properties: {
        className: ['anchor-link']
      }
    })
    .use(rehypeMermaid)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(content)
  
  return {
    slug,
    frontmatter: data,
    content: htmlContent.toString()
  }
}

export async function getAllMarkdownSlugs() {
  const files = await getMarkdownFiles()
  return files.map(file => ({ slug: file.slug.split('/') }))
}
