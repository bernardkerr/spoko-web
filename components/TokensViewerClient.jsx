'use client'

import { useMemo, useState } from 'react'
import { Tabs, Box, Heading, Text, Code, Grid, Card, Select, Flex, Separator } from '@radix-ui/themes'

function pretty(obj) {
  try {
    return JSON.stringify(obj, null, 2)
  } catch (e) {
    return String(obj)
  }
}

function parseCssVars(cssText) {
  if (!cssText) return []
  const lines = cssText.split(/\n|\r\n?/)
  const out = []
  for (const line of lines) {
    const m = line.match(/--([\w-]+)\s*:\s*([^;]+);/)
    if (m) {
      out.push({ name: `--${m[1]}`, value: m[2].trim() })
    }
  }
  return out
}

function groupTokens(themeObj) {
  const groups = { colors: {}, typography: {}, radius: {}, spacing: {}, panels: {} }
  if (!themeObj) return groups
  for (const [k, v] of Object.entries(themeObj)) {
    if (k.startsWith('colors') || k.startsWith('tokensColors')) {
      const key = k.replace(/^colors|^tokensColors/, '')
      const seg = key.replace(/^([A-Z][a-z]+)/, '$1')
      const head = seg.match(/^([A-Z][a-z]+)/)?.[1] || 'Misc'
      if (!groups.colors[head]) groups.colors[head] = []
      groups.colors[head].push({ key: k, value: v })
    } else if (k.startsWith('typography')) {
      const sub = k.replace('typography', '')
      const head = sub.match(/^([A-Z][a-z]+)/)?.[1] || 'Misc'
      if (!groups.typography[head]) groups.typography[head] = []
      groups.typography[head].push({ key: k, value: v })
    } else if (k.startsWith('radius')) {
      groups.radius[k] = v
    } else if (k.startsWith('spacing') || k.startsWith('tokensSpace')) {
      groups.spacing[k] = v
    } else if (k.startsWith('panel')) {
      groups.panels[k] = v
    }
  }
  return groups
}

function ColorSwatches({ colors }) {
  if (!colors) return null
  return (
    <Box>
      {Object.entries(colors).map(([group, items]) => (
        <Box key={group} mb="4">
          <Heading size="4" mb="2">{group}</Heading>
          <Grid columns={{ initial: '1', sm: '2', md: '3', lg: '5' }} gap="2">
            {items.map(({ key, value }) => (
              <Card key={key}>
                <Box p="3">
                  <Box mb="2" style={{ height: 40, borderRadius: 6, background: value, border: '1px solid rgba(0,0,0,0.08)' }} />
                  <Text as="div" size="2" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}>{key}</Text>
                  <Text as="div" size="2" color="gray">{String(value)}</Text>
                </Box>
              </Card>
            ))}
          </Grid>
        </Box>
      ))}
    </Box>
  )
}

function TypographyPreview({ typography }) {
  if (!typography) return null
  const families = {
    Text: typography?.Text?.[0]?.value || typography?.Text?.[0]?.value,
    Code: typography?.Code?.[0]?.value,
    Emphasis: typography?.Emphasis?.[0]?.value,
    Quote: typography?.Quote?.[0]?.value,
  }
  const sizes = Object.entries(typography.FontSize || {})
  const lineHeights = Object.fromEntries((typography.LineHeight || {}).map?.(({ key, value }) => [key, value]) || [])
  const weights = Object.entries(typography).filter(([k]) => k.startsWith('FontWeight'))
  const letters = Object.entries(typography).filter(([k]) => k.startsWith('LetterSpacing'))

  return (
    <Box>
      <Heading size="4" mb="2">Families</Heading>
      <Grid columns={{ initial: '1', sm: '2' }} gap="3" mb="4">
        {Object.entries(families).map(([name, val]) => (
          <Card key={name}><Box p="3"><Text as="div" color="gray" size="2">{name}</Text><Text as="div" style={{ fontFamily: val }}>The quick brown fox jumps over the lazy dog.</Text><Code>{String(val || '—')}</Code></Box></Card>
        ))}
      </Grid>

      <Heading size="4" mb="2">Sizes</Heading>
      <Grid columns={{ initial: '1' }} gap="2" mb="4">
        {sizes.map(([key, val]) => (
          <Card key={key}><Box p="3"><Text as="div" size="2" color="gray">{key}</Text><Text as="div" style={{ fontSize: Number(val), lineHeight: `${lineHeights[key]?.value || '1.2'}px` }}>The quick brown fox jumps over the lazy dog.</Text><Code>{String(val)}px</Code></Box></Card>
        ))}
      </Grid>

      {weights.length ? (
        <>
          <Heading size="4" mb="2">Weights</Heading>
          <Grid columns={{ initial: '1', sm: '2' }} gap="2" mb="4">
            {weights.map(([k, arr]) => (
              <Card key={k}><Box p="3"><Text as="div" size="2" color="gray">{k}</Text><Text as="div" style={{ fontWeight: String(arr?.[0]?.value || arr) }}>The quick brown fox.</Text><Code>{String(arr?.[0]?.value || arr)}</Code></Box></Card>
            ))}
          </Grid>
        </>
      ) : null}

      {letters.length ? (
        <>
          <Heading size="4" mb="2">Letter Spacing</Heading>
          <Grid columns={{ initial: '1', sm: '2' }} gap="2" mb="4">
            {letters.map(([k, arr]) => (
              <Card key={k}><Box p="3"><Text as="div" size="2" color="gray">{k}</Text><Text as="div" style={{ letterSpacing: `${arr?.[0]?.value || arr}px` }}>The quick brown fox.</Text><Code>{String(arr?.[0]?.value || arr)}px</Code></Box></Card>
            ))}
          </Grid>
        </>
      ) : null}
    </Box>
  )
}

function RadiusPreview({ radius }) {
  if (!radius) return null
  const entries = Object.entries(radius)
  return (
    <Grid columns={{ initial: '1', sm: '1', lg: '2' }} gap="3">
      {entries.map(([k, v]) => (
        <Card key={k}><Box p="3"><Text as="div" size="2" color="gray">{k}</Text><Box mt="2" style={{ width: '100%', height: 60, background: 'var(--color-panel-solid)', borderRadius: Number(v) }} /><Code>{String(v)}px</Code></Box></Card>
      ))}
    </Grid>
  )
}

function SpacingPreview({ spacing }) {
  if (!spacing) return null
  const entries = Object.entries(spacing)
  return (
    <Grid columns={{ initial: '1', sm: '1', lg: '2' }} gap="3">
      {entries.map(([k, v]) => (
        <Card key={k}><Box p="3"><Text as="div" size="2" color="gray">{k}</Text><Box mt="2" style={{ width: '100%', height: Number(v), background: 'var(--color-panel-surface)', borderRadius: 6 }} /><Code>{String(v)}px</Code></Box></Card>
      ))}
    </Grid>
  )
}

function PanelsPreview({ panels }) {
  if (!panels) return null
  const entries = Object.entries(panels)
  return (
    <Grid columns={{ initial: '1', sm: '1', lg: '2' }} gap="3">
      {entries.map(([k, v]) => (
        <Card key={k}><Box p="3"><Text as="div" size="2" color="gray">{k}</Text><Box mt="2" style={{ width: '100%', height: 60, background: String(v), borderRadius: 10, border: '1px solid rgba(0,0,0,0.08)' }} /><Code>{String(v)}</Code></Box></Card>
      ))}
    </Grid>
  )
}

export default function TokensViewerClient({ tokensJson, cssVarsText }) {
  const themeNames = useMemo(() => Object.keys(tokensJson || {}), [tokensJson])
  const [selected, setSelected] = useState(themeNames[0] || '')
  const themeObj = tokensJson?.[selected] || null
  const grouped = useMemo(() => groupTokens(themeObj), [themeObj])
  const cssVars = useMemo(() => parseCssVars(cssVarsText), [cssVarsText])

  return (
    <Box>
      <Flex align="center" justify="between" mb="4" gap="3">
        <Heading size="8">Style Inspector</Heading>
        <Text as="p" color="gray" size="2" mb="3">Inspect exported design tokens in figma/exports and plan curated views.</Text>
        <Flex align="center" gap="2">
          {themeNames.length > 1 ? (
            <Select.Root value={selected} onValueChange={setSelected}>
              <Select.Trigger placeholder="Select theme" />
              <Select.Content>
                {themeNames.map((name) => (
                  <Select.Item key={name} value={name}>{name}</Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          ) : (
            <Text color="gray" size="2">Theme: {selected || '—'}</Text>
          )}
        </Flex>
      </Flex>

      <Tabs.Root defaultValue="tokens">
        <Tabs.List>
          <Tabs.Trigger value="raw">Raw JSON</Tabs.Trigger>
          <Tabs.Trigger value="tokens">Tokens (Visual)</Tabs.Trigger>
          <Tabs.Trigger value="css">CSS Variables</Tabs.Trigger>
        </Tabs.List>

        <Separator my="3" />


        <Tabs.Content value="tokens">
          {!themeObj ? (
            <Text color="red">No tokens theme loaded.</Text>
          ) : (
            <Box pr="3">
              <Heading size="6" mb="3">Colors</Heading>
              <ColorSwatches colors={grouped.colors} />

              <Heading size="6" mb="3" mt="5">Typography</Heading>
              <TypographyPreview typography={grouped.typography} />

              <Heading size="6" mb="3" mt="5">Radius</Heading>
              <RadiusPreview radius={grouped.radius} />

              <Heading size="6" mb="3" mt="5">Spacing</Heading>
              <SpacingPreview spacing={grouped.spacing} />

              <Heading size="6" mb="3" mt="5">Panels</Heading>
              <PanelsPreview panels={grouped.panels} />
            </Box>
          )}
        </Tabs.Content>

        <Tabs.Content value="raw">
          <Card>
            <Box p="3">
              <Text as="p" color="gray" size="2" mb="2">Pretty-printed JSON for the selected theme.</Text>
              <pre style={{ margin: 0 }}><code>{pretty(themeObj)}</code></pre>
            </Box>
          </Card>
        </Tabs.Content>

        <Tabs.Content value="css">
          <Card>
            <Box p="3">
              <Text as="p" color="gray" size="2" mb="2">Variables from figma-tokens.css</Text>
              <Grid columns={{ initial: '1', sm: '2', lg: '3' }} gap="2">
                {cssVars.map(({ name, value }) => {
                  const isColor = /^#|rgb|hsl|var\(/.test(value)
                  const isFont = /font|family|mono|serif|sans/i.test(value)
                  const sample = isColor ? (
                    <span style={{ display: 'inline-block', width: 24, height: 24, background: value, borderRadius: 4, border: '1px solid rgba(0,0,0,0.1)' }} />
                  ) : isFont ? (
                    <span style={{ fontFamily: value }}>Ag</span>
                  ) : (
                    <span>{value}</span>
                  )
                  return (
                    <Card key={name}>
                      <Box p="3">
                        <Text as="div" size="2" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}>{name}</Text>
                        <Box mt="2" mb="2" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{sample}<Code>{value}</Code></Box>
                      </Box>
                    </Card>
                  )
                })}
              </Grid>
            </Box>
          </Card>
        </Tabs.Content>

      </Tabs.Root>
    </Box>
  )
}
