'use client'

import React from 'react'

export default class CodeErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(err) {
    return { hasError: true, message: err?.message || 'Render error' }
  }

  componentDidCatch(error, info) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('Code block render error:', error, info)
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <code style={{ display: 'block', color: 'var(--red-11)' }}>
          Code block failed to render: {this.state.message}
        </code>
      )
    }
    return this.props.children
  }
}
