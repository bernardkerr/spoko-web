'use client'

import dynamic from 'next/dynamic'

const CadBlock = dynamic(() => import('@/components/cad/CadBlock'), { ssr: false })
const D2Block = dynamic(() => import('@/components/d2/D2Block'), { ssr: false })
const D3Block = dynamic(() => import('@/components/d3/D3Block'), { ssr: false })
const SVGBlock = dynamic(() => import('@/components/svg/SVGBlock'), { ssr: false })
const ThreeBlock = dynamic(() => import('@/components/three/ThreeBlock'), { ssr: false })

export default function ClientMdxCodeRenderer(props) {
  const { className, children, metastring, ...rest } = props || {}
  const lang = (className || '').replace(/^language-/, '')
  const code = typeof children === 'string' ? children : Array.isArray(children) ? children.join('') : ''

  // Helper: parse parameters after the "cad" marker in metastring
  function parseCadParams(meta) {
    if (!meta || typeof meta !== 'string') return {}
    // Look for a standalone "cad" token, then capture the rest
    const m = meta.match(/(?:^|\s)cad(?:\s+|$)(.*)$/i)
    if (!m) return {}
    const tail = (m[1] || '').trim()
    if (!tail) return { cad: true }
    // JSON object style
    const jsonMatch = tail.match(/\{[\s\S]*\}$/)
    if (jsonMatch) {
      try {
        return { cad: true, ...JSON.parse(jsonMatch[0]) }
      } catch {}
    }
    // Fallback: key=value pairs (quoted or unquoted)
    const out = { cad: true }
    const kvRe = /(\w+)=(("[^"]*")|('[^']*')|([^\s]+))/g
    let mm
    while ((mm = kvRe.exec(tail))) {
      const k = mm[1]
      let v = mm[3] || mm[4] || mm[5] || ''
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1)
      }
      out[k] = v
    }
    return out
  }

  // Helper: parse parameters for SVG fences; supports JSON object or key=value pairs
  function parseSVGParams(meta) {
    if (!meta || typeof meta !== 'string') return {}
    const trimmed = meta.trim()
    const jsonMatch = trimmed.match(/^\{[\s\S]*\}$/)
    if (jsonMatch) {
      try { return JSON.parse(jsonMatch[0]) } catch {}
    }
    const out = {}
    const kvRe = /(\w+)=(("[^"]*")|('[^']*')|([^\s]+))/g
    let mm
    while ((mm = kvRe.exec(trimmed))) {
      const k = mm[1]
      let v = mm[3] || mm[4] || mm[5] || ''
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1)
      }
      out[k] = v
    }
    return out
  }

  // Helper: parse parameters for Three fences; supports JSON object or key=value pairs
  function parseThreeParams(meta) {
    if (!meta || typeof meta !== 'string') return {}
    const trimmed = meta.trim()
    const jsonMatch = trimmed.match(/^\{[\s\S]*\}$/)
    if (jsonMatch) {
      try { return JSON.parse(jsonMatch[0]) } catch {}
    }
    const out = {}
    const kvRe = /(\w+)=(("[^"]*")|('[^']*')|([^\s]+))/g
    let mm
    while ((mm = kvRe.exec(trimmed))) {
      const k = mm[1]
      let v = mm[3] || mm[4] || mm[5] || ''
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1)
      }
      out[k] = v
    }
    return out
  }

  // Helper: parse parameters for D3 fences; supports JSON object or key=value pairs
  function parseD3Params(meta) {
    if (!meta || typeof meta !== 'string') return {}
    const trimmed = meta.trim()
    const jsonMatch = trimmed.match(/^\{[\s\S]*\}$/)
    if (jsonMatch) {
      try { return JSON.parse(jsonMatch[0]) } catch {}
    }
    const out = {}
    const kvRe = /(\w+)=(("[^"]*")|('[^']*')|([^\s]+))/g
    let mm
    while ((mm = kvRe.exec(trimmed))) {
      const k = mm[1]
      let v = mm[3] || mm[4] || mm[5] || ''
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1)
      }
      out[k] = v
    }
    return out
  }

  // Helper: parse parameters for D2 from metastring of a ```d2 fence.
  // Supports either a JSON object or key=value pairs.
  function parseD2Params(meta) {
    if (!meta || typeof meta !== 'string') return {}
    const trimmed = meta.trim()
    // JSON object style
    const jsonMatch = trimmed.match(/^\{[\s\S]*\}$/)
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0])
      } catch {}
    }
    // Fallback: key=value pairs (quoted or unquoted)
    const out = {}
    const kvRe = /(\w+)=(("[^"]*")|('[^']*')|([^\s]+))/g
    let mm
    while ((mm = kvRe.exec(trimmed))) {
      const k = mm[1]
      let v = mm[3] || mm[4] || mm[5] || ''
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1)
      }
      out[k] = v
    }
    return out
  }

  try {
    // Back-compat: ```cadjs fences
    if (lang === 'cadjs') {
      return <CadBlock code={code} />
    }

    // New: ```js cad {...}
    if (lang === 'js' && typeof metastring === 'string' && /(?:^|\s)cad(?:\s|$)/i.test(metastring)) {
      const params = parseCadParams(metastring)
      return <CadBlock code={code} params={params} />
    }

    // New: ```d2 {...}
    if (lang === 'd2') {
      const params = parseD2Params(metastring)
      return <D2Block code={code} params={params} />
    }

    // New: ```js d2 {...}
    if (lang === 'js' && typeof metastring === 'string' && /(?:^|\s)d2(?:\s|$)/i.test(metastring)) {
      const params = parseD2Params(metastring.replace(/(?:^|\s)d2(?:\s|$)/i, '').trim())
      return <D2Block code={code} params={params} />
    }

    // New: ```d3 {...}
    if (lang === 'd3') {
      const params = parseD3Params(metastring)
      return <D3Block code={code} params={params} />
    }

    // New: ```js d3 {...}
    if (lang === 'js' && typeof metastring === 'string' && /(?:^|\s)d3(?:\s|$)/i.test(metastring)) {
      const params = parseD3Params(metastring.replace(/(?:^|\s)d3(?:\s|$)/i, '').trim())
      return <D3Block code={code} params={params} />
    }

    // New: ```svg {...}
    if (lang === 'svg') {
      const params = parseSVGParams(metastring)
      return <SVGBlock code={code} params={params} />
    }

    // New: ```js svg {...}
    if (lang === 'js' && typeof metastring === 'string' && /(?:^|\s)svg(?:\s|$)/i.test(metastring)) {
      const params = parseSVGParams(metastring.replace(/(?:^|\s)svg(?:\s|$)/i, '').trim())
      return <SVGBlock code={code} params={params} />
    }

    // New: ```three {...}
    if (lang === 'three') {
      const params = parseThreeParams(metastring)
      return <ThreeBlock code={code} params={params} />
    }

    // New: ```js three {...}
    if (lang === 'js' && typeof metastring === 'string' && /(?:^|\s)three(?:\s|$)/i.test(metastring)) {
      const params = parseThreeParams(metastring.replace(/(?:^|\s)three(?:\s|$)/i, '').trim())
      return <ThreeBlock code={code} params={params} />
    }
  } catch (e) {
    // Swallow and fall back to raw code on any unexpected error
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn('ClientMdxCodeRenderer fallback due to error:', e?.message)
    }
  }

  return <code className={className} {...rest}>{children}</code>
}
