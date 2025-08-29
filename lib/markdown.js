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

// Support local `content/`, new `docs-submodules/`, and legacy `docs-test/`.
// Priority order: content/ (highest), then docs-submodules/, then docs-test/ (lowest, legacy).
const contentDirectories = [
  path.join(process.cwd(), 'content'),
  path.join(process.cwd(), 'docs-submodules'),
  path.join(process.cwd(), 'docs-test'),
]

// Client-only strategy: leave mermaid code blocks untouched in HTML.
// This plugin is now a no-op so SSR does not attempt rendering.
function rehypeMermaid() {
  return (tree) => tree
}

// Return only markdown files that contain at least one Processing code fence
// Supported patterns:
// - ```processing
// - ```js processing {...}
export async function getMarkdownFilesWithProcessingFromRoots(roots) {
  const files = await getMarkdownFilesFromRoots(roots)
  const filtered = []
  for (const f of files) {
    try {
      const txt = fs.readFileSync(f.fullPath, 'utf8')
      const hasProcessing = /```\s*processing(\s|\n)/i.test(txt)
      const hasJsProcessing = /```\s*(js|javascript)\s+processing(\s|\n|\{|$)/i.test(txt)
      if (hasProcessing || hasJsProcessing) filtered.push(f)
    } catch {}
  }
  return filtered
}

// Parameterized versions that take explicit roots (absolute or relative to cwd)
function normalizeRoots(roots) {
  return (roots || []).map(r => path.isAbsolute(r) ? r : path.join(process.cwd(), r))
}

export async function getMarkdownFilesFromRoots(roots) {
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

  const normalized = normalizeRoots(roots)
  for (const dir of normalized) {
    walkDir(dir)
  }

  const seen = new Set()
  const files = []
  for (const f of discovered) {
    if (seen.has(f.slug)) continue
    seen.add(f.slug)
    files.push({ slug: f.slug, fullPath: f.fullPath })
  }
  return files
}

// Return only markdown files that contain at least one ```cadjs code fence
export async function getMarkdownFilesWithCadjsFromRoots(roots) {
  const files = await getMarkdownFilesFromRoots(roots)
  const filtered = []
  for (const f of files) {
    try {
      const txt = fs.readFileSync(f.fullPath, 'utf8')
      // Back-compat: ```cadjs
      // New preferred: ```js cad {...}
      const hasCadjs = /```\s*cadjs(\s|\n)/i.test(txt)
      const hasJsCad = /```\s*(js|javascript)\s+cad(\s|\n|\{|$)/i.test(txt)
      if (hasCadjs || hasJsCad) {
        filtered.push(f)
      }
    } catch {
      // ignore unreadable files
    }
  }
  return filtered
}

export async function getMarkdownFrontmatterFromRoots(slug, roots) {
  const files = await getMarkdownFilesFromRoots(roots)
  const file = files.find(f => f.slug === slug)
  if (!file) return null
  const fileContents = fs.readFileSync(file.fullPath, 'utf8')
  const { data } = matter(fileContents)
  return { slug, frontmatter: data }
}

export async function getMarkdownContentFromRoots(slug, roots) {
  const files = await getMarkdownFilesFromRoots(roots)
  const file = files.find(f => f.slug === slug)
  if (!file) return null

  const fileContents = fs.readFileSync(file.fullPath, 'utf8')
  const { data, content } = matter(fileContents)

  const htmlContent = await remark()
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, {
      behavior: 'wrap',
      properties: { className: ['anchor-link'] }
    })
    .use(rehypeMermaid)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(content)

  return { slug, frontmatter: data, content: htmlContent.toString() }
}

export async function getAllMarkdownSlugsFromRoots(roots) {
  const files = await getMarkdownFilesFromRoots(roots)
  return files.map(file => ({ slug: file.slug.split('/') }))
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

      // no-op: custom HTML transforms removed (using MDX instead)
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

  // Deduplicate by slug, preferring earlier roots (content over docs-test).
  const seen = new Set()
  const files = []
  for (const f of discovered) {
    if (seen.has(f.slug)) continue
    seen.add(f.slug)
    files.push({ slug: f.slug, fullPath: f.fullPath })
  }
  return files
}

export async function getMarkdownFrontmatter(slug) {
  const files = await getMarkdownFiles()
  const file = files.find(f => f.slug === slug)
  if (!file) return null
  const fileContents = fs.readFileSync(file.fullPath, 'utf8')
  const { data } = matter(fileContents)
  return { slug, frontmatter: data }
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

export async function getTopLevelContentFiles() {
  const contentDir = path.join(process.cwd(), 'content')
  if (!fs.existsSync(contentDir)) return []
  
  const items = fs.readdirSync(contentDir)
  const topLevelFiles = []
  
  for (const item of items) {
    const fullPath = path.join(contentDir, item)
    if (fs.statSync(fullPath).isFile() && (item.endsWith('.md') || item.endsWith('.mdx'))) {
      const slug = item.replace(/\.(md|mdx)$/, '')
      
      // Exclude "home" files since they're handled by other code
      if (slug.toLowerCase() === 'home') {
        continue
      }
      
      // Read frontmatter to get title and navigation order
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const { data } = matter(fileContents)
      
      topLevelFiles.push({ 
        slug, 
        fullPath,
        title: data.title || slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        order: data.navOrder || 999,
        hidden: data.hidden || false
      })
    }
  }
  
  // Sort by navOrder, then by title
  return topLevelFiles
    .filter(file => !file.hidden)
    .sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order
      return a.title.localeCompare(b.title)
    })
}

export async function getTopLevelContentSlugs() {
  const files = await getTopLevelContentFiles()
  return files.map(file => ({ slug: file.slug }))
}
