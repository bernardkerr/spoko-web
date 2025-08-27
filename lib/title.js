// Utilities for extracting and optionally removing the first H1 title
// from HTML (remark/rehype output) or raw MD/MDX source.

function normalizeHeadingText(text) {
  if (!text) return ''
  return String(text).replace(/\s+/g, ' ').trim().toLowerCase()
}

export function extractAndMaybeRemoveFirstH1FromHtml(html, frontmatterTitle) {
  let outHtml = html || ''
  const m = outHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)
  if (!m) {
    return { html: outHtml, title: frontmatterTitle, removed: false }
  }
  const h1Full = m[0]
  const h1Text = (m[1] || '').replace(/<[^>]+>/g, '').trim()

  const normFm = normalizeHeadingText(frontmatterTitle)
  const normH1 = normalizeHeadingText(h1Text)

  // Remove first H1 if:
  // - no frontmatter title provided (use H1 as the page title), OR
  // - frontmatter title matches the H1 text (to avoid duplication)
  if (!normFm || normFm === normH1) {
    outHtml = outHtml.replace(h1Full, '')
    return { html: outHtml, title: frontmatterTitle || h1Text, removed: true }
  }

  // Keep the H1 in body if it's different from the page title
  return { html: outHtml, title: frontmatterTitle || h1Text, removed: false }
}

export function extractAndMaybeRemoveFirstH1FromMdxSource(source, frontmatterTitle) {
  let src = source || ''

  // Very lightweight scan for a top-level markdown H1: a line starting with "# "
  // We ignore lines inside fenced code blocks by tracking simple backtick fences.
  const lines = src.split(/\r?\n/)
  let inFence = false
  let h1LineIdx = -1
  let h1Text = ''

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    // toggle code fence state on lines that start with ```
    if (/^```/.test(line)) {
      inFence = !inFence
      continue
    }
    if (inFence) continue

    const m = line.match(/^#\s+(.+?)\s*$/)
    if (m) {
      h1LineIdx = i
      h1Text = m[1]
      break
    }
  }

  if (h1LineIdx === -1) {
    return { source: src, title: frontmatterTitle, removed: false }
  }

  const normFm = normalizeHeadingText(frontmatterTitle)
  const normH1 = normalizeHeadingText(h1Text)

  if (!normFm || normFm === normH1) {
    // Remove the H1 line
    lines.splice(h1LineIdx, 1)
    // Also remove a following empty line to avoid extra gap
    if (h1LineIdx < lines.length && /^\s*$/.test(lines[h1LineIdx] || '')) {
      lines.splice(h1LineIdx, 1)
    }
    src = lines.join('\n')
    return { source: src, title: frontmatterTitle || h1Text, removed: true }
  }

  return { source: src, title: frontmatterTitle || h1Text, removed: false }
}
