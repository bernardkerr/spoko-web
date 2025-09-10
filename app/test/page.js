import NextLink from 'next/link'
import DocCard from '@/components/DocCard'
import FloatingTOC from '@/components/FloatingTOC'
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
    <>
    <Section size="4">
      <Box className="container">
        <Box mb="5">
          <Heading size="9">Test</Heading>
          <Text as="p" color="gray" size="4">These pages highlight the capabilities of the site.</Text>
        </Box>

        {/* CAD */}
        <Box mt="6" mb="3">
          <Heading size="6">CAD</Heading>
        </Box>
        <Grid data-toc-exclude columns={{ initial: '1', sm: '2', lg: '3', xl: '5' }} gap="4">
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
        </Grid>

        <Separator my="5" size="4" />

        {/* STL Viewer */}
        <Box mt="6" mb="3">
          <Heading size="6">STL Viewer</Heading>
        </Box>
        <Grid data-toc-exclude columns={{ initial: '1', sm: '2', lg: '3', xl: '5' }} gap="4">
          <DocCard>
            <Heading size="4" mb="1">STL Viewer Demo</Heading>
            <Text color="gray" size="2" mb="3">Lightweight Three.js STL viewer with view controls and download.</Text>
            <Button asChild>
              <NextLink href="/test/stl">Open STL Viewer</NextLink>
            </Button>
          </DocCard>

          <DocCard>
            <Heading size="4" mb="1">STL in Markdown</Heading>
            <Text color="gray" size="2" mb="3">Markdown page demonstrating embedded <code>&lt;STLViewer /&gt;</code> components.</Text>
            <Button asChild>
              <NextLink href="/test/docs/stl-viewers">Open STL-MD</NextLink>
            </Button>
          </DocCard>
        </Grid>

        <Separator my="5" size="4" />

        {/* SVG */}
        <Box mt="6" mb="3">
          <Heading size="6">SVG</Heading>
        </Box>
        <Grid data-toc-exclude columns={{ initial: '1', sm: '2', lg: '3', xl: '5' }} gap="4">
          <DocCard>
            <Heading size="4" mb="1">SVG.js Playground</Heading>
            <Text color="gray" size="2" mb="3">Interactive SVG.js workbench for live SVG shapes, text, and animation.</Text>
            <Button asChild>
              <NextLink href="/test/svg">Open SVG Workbench</NextLink>
            </Button>
          </DocCard>

          <DocCard>
            <Heading size="4" mb="1">SVG in Markdown</Heading>
            <Text color="gray" size="2" mb="3">Markdown pages that embed live SVG.js workbenches via <Code>```svg</Code> or <Code>```js svg</Code> blocks.</Text>
            <Button asChild>
              <NextLink href="/test/docs/svg-basic-test">Open SVG-MD</NextLink>
            </Button>
          </DocCard>

          <DocCard>
            <Heading size="4" mb="1">SVG Docs Helper</Heading>
            <Text color="gray" size="2" mb="3">Quick local API notes and examples for SVG.js used by the editor.</Text>
            <Button asChild>
              <NextLink href="/test/svg-doc">Open SVG Docs</NextLink>
            </Button>
          </DocCard>
        </Grid>

        <Separator my="5" size="4" />

        {/* Processing.js */}
        <Box mt="6" mb="3">
          <Heading size="6">Processing.js</Heading>
        </Box>
        <Grid data-toc-exclude columns={{ initial: '1', sm: '2', lg: '3', xl: '5' }} gap="4">
          <DocCard>
            <Heading size="4" mb="1">Processing Playground</Heading>
            <Text color="gray" size="2" mb="3">Interactive Processing.js workbench for live sketch coding.</Text>
            <Button asChild>
              <NextLink href="/test/processing">Open Processing</NextLink>
            </Button>
          </DocCard>

          <DocCard>
            <Heading size="4" mb="1">Processing Examples</Heading>
            <Text color="gray" size="2" mb="3">Curated examples rendered as live Processing workbenches.</Text>
            <Button asChild>
              <NextLink href="/test/processing-examples">Open Examples</NextLink>
            </Button>
          </DocCard>

          <DocCard>
            <Heading size="4" mb="1">Processing Docs Helper</Heading>
            <Text color="gray" size="2" mb="3">Quick API reference used by the Processing editor.</Text>
            <Button asChild>
              <NextLink href="/test/processing-doc">Open Processing Docs</NextLink>
            </Button>
          </DocCard>
        </Grid>

        <Separator my="5" size="4" />

        {/* D3 */}
        <Box mt="6" mb="3">
          <Heading size="6">D3</Heading>
        </Box>
        <Grid data-toc-exclude columns={{ initial: '1', sm: '2', lg: '3', xl: '5' }} gap="4">
          <DocCard>
            <Heading size="4" mb="1">D3 Playground</Heading>
            <Text color="gray" size="2" mb="3">Interactive D3 + ElkJS workbench for live SVG experiments.</Text>
            <Button asChild>
              <NextLink href="/test/d3">Open D3 Workbench</NextLink>
            </Button>
          </DocCard>

          <DocCard>
            <Heading size="4" mb="1">D3 in Markdown</Heading>
            <Text color="gray" size="2" mb="3">Markdown pages that embed live D3 workbenches via <Code>```d3</Code> or <Code>```js d3</Code> blocks.</Text>
            <Button asChild>
              <NextLink href="/test/docs/d3-basic-test">Open D3-MD</NextLink>
            </Button>
          </DocCard>

          <DocCard>
            <Heading size="4" mb="1">D3 Doc</Heading>
            <Text color="gray" size="2" mb="3">Searchable D3 reference table used by the D3 editor.</Text>
            <Button asChild>
              <NextLink href="/test/d3-doc">Open D3 Doc</NextLink>
            </Button>
          </DocCard>
        </Grid>

        <Separator my="5" size="4" />

        {/* Three.js */}
        <Box mt="6" mb="3">
          <Heading size="6">Three.js</Heading>
        </Box>
        <Grid data-toc-exclude columns={{ initial: '1', sm: '2', lg: '3', xl: '5' }} gap="4">
          <DocCard>
            <Heading size="4" mb="1">Three.js Playground</Heading>
            <Text color="gray" size="2" mb="3">Interactive 3D graphics playground powered by Three.js and React Three Fiber.</Text>
            <Button asChild>
              <NextLink href="/test/three">Open Three.js</NextLink>
            </Button>
          </DocCard>

          <DocCard>
            <Heading size="4" mb="1">Three in Markdown</Heading>
            <Text color="gray" size="2" mb="3">Markdown pages that embed live Three workbenches via <Code>```three</Code> or <Code>```js three</Code> blocks.</Text>
            <Button asChild>
              <NextLink href="/test/docs/three-basic-test">Open Three-MD</NextLink>
            </Button>
          </DocCard>
        </Grid>

        <Separator my="5" size="4" />

        {/* Theme (formerly Figma) */}
        <Box mt="6" mb="3">
          <Heading size="6">Theme</Heading>
        </Box>
        <Grid data-toc-exclude columns={{ initial: '1', sm: '2', lg: '3', xl: '5' }} gap="4">
          <DocCard>
            <Heading size="4" mb="1">Style Inspector</Heading>
            <Text color="gray" size="2" mb="3">Inspect exported design tokens from figma/exports and plan curated views.</Text>
            <Button asChild>
              <NextLink href="/test/styles">Open Inspector</NextLink>
            </Button>
          </DocCard>

          <DocCard>
            <Heading size="4" mb="1">Radix Design Showcase</Heading>
            <Text color="gray" size="2" mb="3">Components built with @radix-ui/themes demonstrating the site theme.</Text>
            <Button asChild>
              <NextLink href="/test/radix">View Showcase</NextLink>
            </Button>
          </DocCard>
        </Grid>

        <Separator my="5" size="4" />

        {/* Misc */}
        <Box mt="6" mb="3">
          <Heading size="6">Misc</Heading>
        </Box>
        <Grid data-toc-exclude columns={{ initial: '1', sm: '2', lg: '3', xl: '5' }} gap="4">
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
        </Grid>

        <Separator my="5" size="4" />

        {/* D2 */}
        <Box mt="6" mb="3">
          <Heading size="6">D2</Heading>
        </Box>
        <Grid data-toc-exclude columns={{ initial: '1', sm: '2', lg: '3', xl: '5' }} gap="4">
          <DocCard>
            <Heading size="4" mb="1">D2 Diagrams</Heading>
            <Text color="gray" size="2" mb="3">Live-coded D2 diagrams with themed rendering via the D2 Workbench.</Text>
            <Button asChild>
              <NextLink href="/test/d2">Open D2 Workbench</NextLink>
            </Button>
          </DocCard>

          <DocCard>
            <Heading size="4" mb="1">D2 in Markdown</Heading>
            <Text color="gray" size="2" mb="3">Markdown pages that embed live D2 workbenches via <Code>```d2</Code> blocks.</Text>
            <Button asChild>
              <NextLink href="/test/docs/d2-basic-test">Open D2-MD</NextLink>
            </Button>
          </DocCard>
        </Grid>

      </Box>
    </Section>
    <FloatingTOC />
    </>
  )
}
