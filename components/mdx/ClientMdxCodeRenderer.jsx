'use client'

import dynamic from 'next/dynamic'

const CadBlock = dynamic(() => import('@/components/cad/CadBlock'), { ssr: false })

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

  // Back-compat: ```cadjs fences
  if (lang === 'cadjs') {
    return <CadBlock code={code} />
  }

  // New: ```js cad {...}
  if (lang === 'js' && typeof metastring === 'string' && /(?:^|\s)cad(?:\s|$)/i.test(metastring)) {
    const params = parseCadParams(metastring)
    return <CadBlock code={code} params={params} />
  }

  return <code className={className} {...rest}>{children}</code>
}
