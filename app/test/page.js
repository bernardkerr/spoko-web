import NextLink from 'next/link'
import DocCard from '@/components/DocCard'
import {
  Section,
  Box,
  Flex,
  Heading,
  Text,
  Separator,
  Code,
  Grid,
  Card,
  Button,
} from '@radix-ui/themes'

export default function TestPage() {
  return (
    <Section size="4">
      <Box mx="auto" style={{ maxWidth: 1200, width: '100%' }}>
        <Box mb="5">
          <Heading size="9">Test</Heading>
          <Text as="p" color="gray" size="4">These pages highlight the capabilities of the site.</Text>
        </Box>

        <Grid columns={{ initial: '1', sm: '2', lg: '3', xl: '5' }} gap="4">
          <DocCard>
            <Heading size="4" mb="1">CAD Playground</Heading>
            <Text color="gray" size="2" mb="3">Interactive CAD viewer with sample shapes and operations.</Text>
            <Button asChild>
              <NextLink href="/test/cad">Open CAD</NextLink>
            </Button>
          </DocCard>

          <DocCard>
            <Heading size="4" mb="1">CAD in Markdown</Heading>
            <Text color="gray" size="2" mb="3">Markdown pages that embed live CAD workbenches via <Code>```js cad</Code> blocks (back-compat for <Code>```cadjs</Code>).</Text>
            <Button asChild>
              <NextLink href="/test/cad-md">Browse CAD-MD</NextLink>
            </Button>
          </DocCard>

          <DocCard>
            <Heading size="4" mb="1">CAD Docs Helper</Heading>
            <Text color="gray" size="2" mb="3">Searchable OCJS reference table used by the CAD editor.</Text>
            <Button asChild>
              <NextLink href="/test/cad-doc">Open Docs</NextLink>
            </Button>
          </DocCard>

          <DocCard>
            <Heading size="4" mb="1">Three.js Examples</Heading>
            <Text color="gray" size="2" mb="3">Interactive 3D graphics and animations powered by Three.js and React Three Fiber.</Text>
            <Button asChild>
              <NextLink href="/test/three">View Examples</NextLink>
            </Button>
          </DocCard>

          <DocCard>
            <Heading size="4" mb="1">Mermaid Diagrams</Heading>
            <Text color="gray" size="2" mb="3">Beautiful diagrams and flowcharts with site-themed Mermaid integration.</Text>
            <Button asChild>
              <NextLink href="/test/mermaid">View Diagrams</NextLink>
            </Button>
          </DocCard>

          <DocCard>
            <Heading size="4" mb="1">Documentation</Heading>
            <Text color="gray" size="2" mb="3">Markdown-based documentation with support for Git submodules and rich typography.</Text>
            <Button asChild>
              <NextLink href="/test/docs">Read Docs</NextLink>
            </Button>
          </DocCard>

          <DocCard>
            <Heading size="4" mb="1">Radix Design Showcase</Heading>
            <Text color="gray" size="2" mb="3">Components built with @radix-ui/themes demonstrating the site theme.</Text>
            <Button asChild>
              <NextLink href="/test/radix">View Showcase</NextLink>
            </Button>
          </DocCard>

          <DocCard>
            <Heading size="4" mb="1">Style Inspector</Heading>
            <Text color="gray" size="2" mb="3">Inspect exported design tokens from figma/exports and plan curated views.</Text>
            <Button asChild>
              <NextLink href="/test/styles">Open Inspector</NextLink>
            </Button>
          </DocCard>
        </Grid>
      </Box>
    </Section>
  )
}
