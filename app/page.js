import Link from 'next/link'
import { getAssetPath } from '@/lib/paths'
import ClientHomeContent from '@/components/ClientHomeContent'
// Note: Using static export. Avoid force-dynamic/noStore to keep compatibility.
import { Section, Box, Heading, Text, Button, Flex } from '@radix-ui/themes'
import NextLink from 'next/link'

export default async function Home() {
  // In development, disable caching so markdown edits reflect immediately.
  if (process.env.NODE_ENV !== 'production') {
    const { unstable_noStore } = await import('next/cache')
    unstable_noStore()
    const { headers } = await import('next/headers')
    headers() // trigger dynamic rendering in dev
  }
  try {
    // Render MDX as first-class module for proper HMR
    if (process.env.NODE_ENV !== 'production') {
      console.log('[Home] rendering MDX module: Home')
    }
    return (
      <Section size="4">
        <Box mx="auto" style={{ maxWidth: 1440, width: '100%' }}>
          <ClientHomeContent />
        </Box>
      </Section>
    )
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[Home] markdown render error:', e)
    }
    // fall through to JSX fallback
  }

  // Fallback to existing hard-coded content
  return (
    <Section size="4">
      <Box mx="auto" style={{ maxWidth: 1440, width: '100%' }}>
        {process.env.NODE_ENV !== 'production' && (
          <Text size="1" color="gray" mb="2">[Dev] Fallback homepage JSX</Text>
        )}
        <Box style={{ textAlign: 'center' }}>
          <Heading size="9" mb="2">Welcome to Spoko</Heading>
          <Text as="p" size="4" color="gray">
            A modern design system and development toolkit.
          </Text>
          <Flex mt="6" gap="3" justify="center" wrap="wrap">
            <Button asChild>
              <NextLink href={getAssetPath('/test')}>Go to Test</NextLink>
            </Button>
            <Button asChild variant="soft">
              <NextLink href={getAssetPath('/docs')}>View Documentation</NextLink>
            </Button>
          </Flex>
        </Box>
      </Box>
    </Section>
  )
}
