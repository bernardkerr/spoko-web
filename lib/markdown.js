import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import { rehype } from 'rehype'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'

const contentDirectory = path.join(process.cwd(), 'content-submodule')

// Custom rehype plugin to transform mermaid code blocks
function rehypeMermaid() {
  return (tree) => {
    const visit = (node, callback) => {
      callback(node)
      if (node.children) {
        node.children.forEach(child => visit(child, callback))
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

export async function getMarkdownFiles() {
  if (!fs.existsSync(contentDirectory)) {
    return []
  }

  const files = []
  
  function walkDir(dir, basePath = '') {
    const items = fs.readdirSync(dir)
    
    for (const item of items) {
      const fullPath = path.join(dir, item)
      const relativePath = path.join(basePath, item)
      
      if (fs.statSync(fullPath).isDirectory()) {
        walkDir(fullPath, relativePath)
      } else if (item.endsWith('.md')) {
        files.push({
          slug: relativePath.replace(/\.md$/, '').replace(/\\/g, '/'),
          fullPath
        })
      }
    }
  }
  
  walkDir(contentDirectory)
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
  
  // Process markdown with remark and rehype
  const processedContent = await remark()
    .use(remarkGfm)
    .process(content)
  
  const htmlContent = await rehype()
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, {
      behavior: 'wrap',
      properties: {
        className: ['anchor-link']
      }
    })
    .use(rehypeMermaid)
    .process(processedContent.toString())
  
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
