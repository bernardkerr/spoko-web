import { Section, Box, Heading, Text } from '@radix-ui/themes'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { Mermaid } from '@/components/Mermaid'
import FloatingTOC from '@/components/FloatingTOC'
import styles from './SideImagesDoc.module.css'

// Splits content into sections by <h1>/<h2> and groups images per section.
// Renders each section as a two-column row (text left, images right).
export default function SideImagesDoc({ title, description, html, originPath }) {
  const sections = splitIntoSections(html)

  return (
    <>
      <Section size="4">
        <Box mx="auto" style={{ maxWidth: 1200, width: '100%' }}>
          <Box mb="5">
            <Heading size="9">{title}</Heading>
            {description && (
              <Text as="p" color="gray" size="4">{description}</Text>
            )}
          </Box>

          <div className={styles.sections}>
            {sections.map((sec, idx) => {
              const hasText = hasTextContent(sec.textHtml)
              if (!hasText && sec.images.length > 0) {
                // Image-only section: render images full-width, not in two-column layout
                return (
                  <div key={idx}>
                    <div className={styles.imageStack} style={{ maxWidth: 900, margin: '0 auto' }}>
                      {sec.images.map((img, i) => {
                        const { style, class: classAttr, className, width, height, ...rest } = img.props || {}
                        const cleanRest = { ...rest }
                        delete cleanRest.width
                        delete cleanRest.height
                        const src = cleanRest.src
                        const alt = cleanRest.alt || ''
                        const back = originPath || ''
                        const backLabel = title || ''
                        const href = src
                          ? `/image-viewer?src=${encodeURIComponent(src)}&alt=${encodeURIComponent(alt)}&back=${encodeURIComponent(back)}&backLabel=${encodeURIComponent(backLabel)}`
                          : undefined
                        return href ? (
                          <Link key={i} href={href} title={alt || 'Open full size'} className={styles.imageLinkWrap}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              {...cleanRest}
                              style={{
                                display: 'block',
                                maxWidth: '100%',
                                width: '100%',
                                height: 'auto',
                                maxHeight: '50vh',
                                objectFit: 'contain',
                                borderRadius: 6
                              }}
                            />
                            <div className={styles.zoomOverlay} aria-hidden>
                              <Search size={24} />
                            </div>
                          </Link>
                        ) : null
                      })}
                    </div>
                  </div>
                )
              }

              return (
                <div key={idx} className={styles.row}>
                  <article className={styles.textCol}>
                    {/* eslint-disable-next-line react/no-danger */}
                    <div dangerouslySetInnerHTML={{ __html: sec.textHtml }} />
                  </article>
                  <aside className={styles.imageCol} style={{ maxWidth: 440 }}>
                    <div className={styles.imageStack}>
                      {sec.images.map((img, i) => {
                        const { style, class: classAttr, className, width, height, ...rest } = img.props || {}
                        const cleanRest = { ...rest }
                        // Drop raw width/height to rely on our sizing
                        delete cleanRest.width
                        delete cleanRest.height
                        const src = cleanRest.src
                        const alt = cleanRest.alt || ''
                        const back = originPath || ''
                        const backLabel = title || ''
                        const href = src
                          ? `/image-viewer?src=${encodeURIComponent(src)}&alt=${encodeURIComponent(alt)}&back=${encodeURIComponent(back)}&backLabel=${encodeURIComponent(backLabel)}`
                          : undefined
                        return href ? (
                          <Link key={i} href={href} title={alt || 'Open full size'} className={styles.imageLinkWrap}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              {...cleanRest}
                              style={{
                                display: 'block',
                                maxWidth: '100%',
                                width: '100%',
                                height: 'auto',
                                maxHeight: '40vh',
                                objectFit: 'contain',
                                borderRadius: 6
                              }}
                            />
                            <div className={styles.zoomOverlay} aria-hidden>
                              <Search size={22} />
                            </div>
                          </Link>
                        ) : null
                      })}
                    </div>
                  </aside>
                </div>
              )
            })}
          </div>
          <Mermaid autoRender={true} />
        </Box>
      </Section>
      <FloatingTOC />
    </>
  )
}

function splitIntoSections(html) {
  // Split at <h1 ...> or <h2 ...> boundaries but keep the delimiter in the following chunk
  const parts = html
    .split(/(?=<h[12]\b[^>]*>)/i)
    .filter(Boolean)

  const sections = []
  for (const chunk of parts.length ? parts : [html]) {
    const { textHtml, images } = extractImages(chunk)
    sections.push({ textHtml, images })
  }
  return sections
}

function hasTextContent(html) {
  const text = (html || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
  return text.length > 0
}

function extractImages(htmlChunk) {
  // Find all <img ...> tags
  const imgRegex = /<img\s+([^>]*?)\s*\/?>/gi
  const images = []
  let match
  let stripped = htmlChunk

  while ((match = imgRegex.exec(htmlChunk)) !== null) {
    const attrs = match[1] || ''
    const props = parseAttributes(attrs)
    images.push({ props })
  }

  // Remove images from text chunk
  stripped = stripped.replace(imgRegex, '')

  return { textHtml: stripped, images }
}

function parseAttributes(attrString) {
  // Very naive HTML attribute parser sufficient for typical <img> usage
  const props = {}
  const attrRegex = /(\w[\w:-]*)\s*=\s*"([^"]*)"/g
  let m
  while ((m = attrRegex.exec(attrString)) !== null) {
    props[m[1]] = m[2]
  }
  return props
}
