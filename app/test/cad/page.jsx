'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Section, Box, Button, Heading, Text } from '@radix-ui/themes'
import { CadWorkbench } from '@/components/cad/CadWorkbench'
import { getDefaultModelCode } from '@/components/cad/OcModelBuilder'

export default function CadTestPage() {
  const [_, setDummy] = useState(false) // placeholder to keep consistent client component
  return (
    <Section size="4">
      <Box mx="auto" style={{ maxWidth: 1200, width: '100%' }}>
        <Box mb="5" style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <Heading size="9">CAD Viewer (Test)</Heading>
            <Text as="p" color="gray" size="4">Reusable workbench demo.</Text>
          </div>
          <Button asChild variant="soft">
            <Link href="/test">Back to Tests</Link>
          </Button>
        </Box>

        <CadWorkbench
          id="test-cad"
          initialCode={getDefaultModelCode()}
          autoRun={true}
          showEditorDefault={false}
          initialViewer={{ spinEnabled: true, frameMode: 'HIDE', shadingMode: 'GRAY', originVisible: false }}
        />
      </Box>
    </Section>
  )
}
