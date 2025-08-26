'use client'

import CodeErrorBoundary from './CodeErrorBoundary'
import ClientMdxCodeRenderer from './ClientMdxCodeRenderer'

export default function ClientMdxCodeWrapper(props) {
  return (
    <CodeErrorBoundary>
      <ClientMdxCodeRenderer {...props} />
    </CodeErrorBoundary>
  )
}
