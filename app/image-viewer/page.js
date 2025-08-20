"use client"
import Link from 'next/link'
import { Suspense, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { Section, Box, Button, Text } from '@radix-ui/themes'

function ImageViewerContent() {
  const sp = useSearchParams()
  const { src, alt, back, backLabel } = useMemo(() => {
    const src = sp.get('src') || ''
    const alt = sp.get('alt') || ''
    const back = sp.get('back') || '/'
    const backLabel = sp.get('backLabel') || 'Back'
    return { src, alt, back, backLabel }
  }, [sp])
  const imageLabel = useMemo(() => (alt && alt.trim()) ? alt : '', [alt])

  return (
    <Section size="4">
      <Box mx="auto" style={{ maxWidth: 1400, width: '100%' }}>
        <Box mb="4" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Button asChild variant="soft" color="gray">
            <Link href={back}>← {backLabel}</Link>
          </Button>
          {imageLabel && <Text color="gray" size="2">{imageLabel}</Text>}
        </Box>

        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '70vh',
            borderRadius: 8,
            background: 'var(--color-panel-solid)',
            padding: 16,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {src ? (
            <img
              src={src}
              alt={alt}
              style={{
                maxWidth: '100%',
                maxHeight: '80vh',
                width: 'auto',
                height: 'auto',
                objectFit: 'contain',
                borderRadius: 6,
                boxShadow: '0 0 0 1px var(--gray-a6), 0 10px 30px var(--black-a6)'
              }}
            />
          ) : (
            <Text size="3" color="gray">No image provided.</Text>
          )}
        </Box>
      </Box>
    </Section>
  )
}

export default function ImageViewerPage() {
  return (
    <Suspense
      fallback={(
        <Section size="4">
          <Box mx="auto" style={{ maxWidth: 1400, width: '100%' }}>
            <Box
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '70vh',
                borderRadius: 8,
                background: 'var(--color-panel-solid)',
                padding: 16,
              }}
            >
              <Text size="3" color="gray">Loading image…</Text>
            </Box>
          </Box>
        </Section>
      )}
    >
      <ImageViewerContent />
    </Suspense>
  )
}
