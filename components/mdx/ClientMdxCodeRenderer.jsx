'use client'

import dynamic from 'next/dynamic'

const CadBlock = dynamic(() => import('@/components/cad/CadBlock'), { ssr: false })

export default function ClientMdxCodeRenderer(props) {
  const { className, children, ...rest } = props || {}
  const lang = (className || '').replace(/^language-/, '')
  const code = typeof children === 'string' ? children : Array.isArray(children) ? children.join('') : ''
  if (lang === 'cadjs') {
    return <CadBlock code={code} />
  }
  return <code className={className} {...rest}>{children}</code>
}
