'use client'

import React from 'react'
import { Box, Card, Heading, Text, Button } from '@radix-ui/themes'

export function DocsPanel({ title = 'Docs', source, height = 360, onClose, children }) {
  return (
    <Card>
      <Box p="4">
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Heading size="6">{title}</Heading>
          <Box style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {source ? <Text color="gray" size="2">Source: {source}</Text> : null}
            <Button variant="ghost" onClick={onClose}>Close</Button>
          </Box>
        </Box>
        <Box mt="3">
          {/* Child table/component controls its own scroll; enforce max height if provided */}
          <div style={{ height, overflow: 'auto' }}>
            {children}
          </div>
        </Box>
      </Box>
    </Card>
  )
}
