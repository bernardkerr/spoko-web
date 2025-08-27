'use client'

import React from 'react'
import { Box, Card, Heading, Text, Button } from '@radix-ui/themes'

// Generic editor card wrapper with a title, optional description, close button, content and actions area.
// Compose it with CodeEditor and action buttons from callers for maximum flexibility.
// Props:
// - title: string
// - onClose: () => void
// - description?: string | ReactNode
// - children: ReactNode (usually CodeEditor)
// - actions?: ReactNode (buttons row)
// - padding?: Radix spacing token (default '4')
export function EditorPanel({ title = 'Editor', onClose, description, children, actions, padding = '4' }) {
  return (
    <Card>
      <Box p={padding}>
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Heading size="6">{title}</Heading>
          {onClose && (
            <Button variant="ghost" onClick={onClose}>Close</Button>
          )}
        </Box>
        {description ? (
          <Text as="p" color="gray" size="2" style={{ marginTop: 6 }}>{description}</Text>
        ) : null}
        <Box mt="3">
          {children}
        </Box>
        {actions ? (
          <Box mt="3" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {actions}
          </Box>
        ) : null}
      </Box>
    </Card>
  )
}
