import { Section, Box, Heading, Text } from '@radix-ui/themes'
// This page is fully self-contained and does not load external MDX content

export const metadata = {
  title: 'Under Development',
}

export default async function UnderDevelopmentPage() {
  // In development, disable caching so markdown edits reflect immediately
  if (process.env.NODE_ENV !== 'production') {
    const { unstable_noStore } = await import('next/cache')
    unstable_noStore()
  }

  const pageTitle = 'Under Development'
  const description = 'This section is currently being worked on.'

  return (
    <Section size="4">
      <Box mx="auto" style={{ maxWidth: 900, width: '100%' }}>
        <Box mb="5">
          <Heading size="9">{pageTitle}</Heading>
          <Text as="p" color="gray" size="4">{description}</Text>
        </Box>

      </Box>
    </Section>
  )
}
