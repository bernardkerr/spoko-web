import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import { MDXRemote } from 'next-mdx-remote/rsc'
import NextLink from 'next/link'
import { Button, Box, Flex, Grid } from '@radix-ui/themes'
import STLViewer from '@/components/stl/STLViewer'
import MDXImage from '@/components/MDXImage'
import ClientMdxCodeRenderer from '@/components/mdx/ClientMdxCodeRenderer'
import ClientMdxCodeWrapper from '@/components/mdx/ClientMdxCodeWrapper'

// Rehype plugin: split content into sections at h1/h2 and move <img> elements
// into a right-hand column for each section. JSX components remain untouched.
function rehypeSideImagesSections() {
  return (tree) => {
    if (!tree || !Array.isArray(tree.children)) return

    const isHeading = (node) => node && node.type === 'element' && /^h[12]$/i.test(node.tagName || '')
    const isImg = (node) => node && node.type === 'element' && (node.tagName || '').toLowerCase() === 'img'

    function cloneNode(n) {
      return JSON.parse(JSON.stringify(n))
    }

    function extractImages(node, collected) {
      if (!node) return null
      if (isImg(node)) {
        collected.push(cloneNode(node))
        return null
      }
      if (node.children && Array.isArray(node.children)) {
        const nextChildren = []
        for (const child of node.children) {
          const cleaned = extractImages(child, collected)
          if (cleaned) nextChildren.push(cleaned)
        }
        // If element ends up empty and is a paragraph/div/etc., drop it
        const cleanedNode = { ...node, children: nextChildren }
        // Keep headings even if empty to preserve anchors
        if (nextChildren.length === 0 && !isHeading(node)) {
          // If it had properties/values other than children, we could keep; otherwise drop
          return null
        }
        return cleanedNode
      }
      return node
    }

    const sections = []
    let current = { text: [], images: [] }

    const pushSection = () => {
      if (current.text.length === 0 && current.images.length === 0) return
      sections.push(current)
      current = { text: [], images: [] }
    }

    for (const child of tree.children) {
      if (isHeading(child)) {
        pushSection()
      }
      const imgs = []
      const cleaned = extractImages(child, imgs)
      if (cleaned) current.text.push(cleaned)
      if (imgs.length) current.images.push(...imgs)
    }
    pushSection()

    // Build new children array with two-column rows
    const rows = []
    for (const sec of sections) {
      // Skip empty sections with no text but only images: render images full-width
      if (sec.text.length === 0 && sec.images.length > 0) {
        rows.push({
          type: 'element',
          tagName: 'div',
          properties: { className: ['sideimages-fullwidth'] },
          children: [
            {
              type: 'element',
              tagName: 'div',
              properties: { className: ['sideimages-imageStack', 'sideimages-fullwidthStack'] },
              children: sec.images.map((img) => ({
                ...img,
                properties: {
                  ...(img.properties || {}),
                  className: [
                    ...(((img.properties || {}).className) || []),
                    'sideimages-image',
                    'sideimages-image--full'
                  ]
                },
              })),
            },
          ],
        })
        continue
      }

      rows.push({
        type: 'element',
        tagName: 'div',
        properties: { className: ['sideimages-row'] },
        children: [
          {
            type: 'element',
            tagName: 'article',
            properties: { className: ['sideimages-text'] },
            children: sec.text.length ? sec.text : [{ type: 'text', value: '' }],
          },
          {
            type: 'element',
            tagName: 'aside',
            properties: { className: ['sideimages-aside'] },
            children: [
              {
                type: 'element',
                tagName: 'div',
                properties: { className: ['sideimages-imageStack'] },
                children: sec.images.map((img) => ({
                  ...img,
                  properties: {
                    ...(img.properties || {}),
                    className: [
                      ...(((img.properties || {}).className) || []),
                      'sideimages-image'
                    ]
                  },
                })),
              },
            ],
          },
        ],
      })
    }

    tree.children = rows
  }
}

// Render MDX in App Router (RSC) with our preferred plugins.
// Allows raw HTML inside MDX and adds heading ids/links.
export function Mdx({ source, components = {}, layout }) {
  // Default MDX components available in all MDX files.
  // - Button: Radix UI Button
  // - NextLink: next/link Link component
  // - LinkButton: convenience wrapper to render a Button that navigates

  const defaultComponents = {
    // Map markdown/MDX <img> to our path-aware component
    img: MDXImage,
    Button,
    Box,
    Flex,
    Grid,
    // Custom components available in MDX
    STLViewer,
    NextLink,
    LinkButton: function LinkButton({ href, children, prefetch, disabled, title, variant, color, ...buttonProps }) {
      // Disabled: render a non-link Button with gray/soft styling by default
      if (disabled) {
        const finalVariant = variant ?? 'soft'
        const finalColor = color ?? 'gray'
        return (
          <Button disabled aria-disabled title={title ?? 'Coming soon'} variant={finalVariant} color={finalColor} {...buttonProps}>
            {children}
          </Button>
        )
      }
      return (
        <Button asChild variant={variant} color={color} {...buttonProps}>
          <NextLink href={href} prefetch={prefetch}>
            {children}
          </NextLink>
        </Button>
      )
    },
    // MDX <code> blocks mapping handled in a client component with error boundary
    code: ClientMdxCodeWrapper,
    // Unwrap <pre> around cad blocks so our interactive component isn't trapped in a preformatted box
    pre: function PreWrapper(props) {
      const { children, ...rest } = props || {}
      // Expect children to be the <code> element MDX produces
      const child = Array.isArray(children) ? children[0] : children
      const className = child?.props?.className || ''
      const lang = (className || '').replace(/^language-/, '')
      const metastring = child?.props?.metastring || ''
      const isCad = (lang === 'cadjs') || (lang === 'js' && /(?:^|\s)cad(?:\s|$)/i.test(String(metastring)))
      const isD2 = (lang === 'd2') || (lang === 'js' && /(?:^|\s)d2(?:\s|$)/i.test(String(metastring)))
      const isD3 = (lang === 'd3') || (lang === 'js' && /(?:^|\s)d3(?:\s|$)/i.test(String(metastring)))
      const isSVG = (lang === 'svg') || (lang === 'js' && /(?:^|\s)svg(?:\s|$)/i.test(String(metastring)))
      const isThree = (lang === 'three') || (lang === 'js' && /(?:^|\s)three(?:\s|$)/i.test(String(metastring)))
      const isProcessing = (lang === 'processing') || (lang === 'js' && /(?:^|\s)processing(?:\s|$)/i.test(String(metastring)))
      if (isCad || isD2 || isD3 || isSVG || isThree || isProcessing) {
        // Let our code renderer render directly without a <pre> wrapper
        return <>{children}</>
      }
      return <pre {...rest}>{children}</pre>
    },
  }

  const rehypePlugins = [
    rehypeSlug,
    [rehypeAutolinkHeadings, { behavior: 'wrap', properties: { className: ['anchor-link'] } }],
  ]
  if (layout === 'sideImages') {
    rehypePlugins.push(rehypeSideImagesSections)
  }

  // Normalize void HTML tags to self-closing so MDX (JSX) parsing doesn't fail on raw HTML like <img>
  function normalizeVoidTags(input) {
    if (typeof input !== 'string') return input
    const voidTags = ['img', 'br', 'hr', 'input', 'area', 'base', 'col', 'embed', 'param', 'source', 'track', 'wbr']
    let out = input
    for (const tag of voidTags) {
      const re = new RegExp(`<${tag}([^<>]*?)(?<!/)>` , 'gi')
      out = out.replace(re, (_m, attrs) => `<${tag}${attrs} />`)
    }
    return out
  }

  const fixedSource = normalizeVoidTags(source)

  // Remark plugin to expose code fence metastring to the code component as a prop
  function remarkExposeCodeMeta() {
    return (tree) => {
      const visit = (node, cb) => {
        cb(node)
        if (node && node.children) node.children.forEach(child => visit(child, cb))
      }
      visit(tree, (node) => {
        if (!node || node.type !== 'code') return
        if (!node.meta) return
        node.data = node.data || {}
        node.data.hProperties = node.data.hProperties || {}
        node.data.hProperties.metastring = node.meta
      })
    }
  }

  return (
    <MDXRemote
      source={fixedSource}
      components={{ ...defaultComponents, ...components }}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm, remarkExposeCodeMeta],
          rehypePlugins,
          // Allow raw HTML processing
          development: process.env.NODE_ENV !== 'production',
        },
      }}
    />
  )
}
