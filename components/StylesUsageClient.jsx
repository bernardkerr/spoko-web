"use client"

import NextLink from 'next/link'
import { Box, Heading, Text, Code, Grid, Card } from '@radix-ui/themes'
import { useSearchParams } from 'next/navigation'

export default function StylesUsageClient({ usage }) {
  const searchParams = useSearchParams()
  const showUsage = searchParams.get('usage') !== '0' // default ON
  const showAll = searchParams.get('all') === '1'

  if (!showUsage) {
    return (
      <Box mt="7">
        <Text as="p" color="gray" size="3">
          Usage summary is hidden.{' '}
          <NextLink href="/styles" style={{ textDecoration: 'underline' }}>Show usage summary</NextLink>
        </Text>
      </Box>
    )
  }

  if (!usage) {
    return (
      <Box mt="8">
        <Heading size="7" mb="2">Curated Usage Summary</Heading>
        <Text as="p" color="gray" size="3">No usage report found. Generate with <Code>npm run tokens:usage</Code>.</Text>
      </Box>
    )
  }

  if (usage.__error) {
    return (
      <Box mt="8">
        <Heading size="7" mb="2">Curated Usage Summary</Heading>
        <Text as="p" color="red" size="3">Failed to read usage-report.json: {usage.__error}</Text>
      </Box>
    )
  }

  const allow = ['color-scheme', 'color', 'accent', 'gray', 'radius', 'space', 'panel', 'background', 'focus', 'surface']
  const top = (usage.topUsed || []).filter((it) => {
    if (showAll) return true
    const g = it.group || ''
    return allow.some((p) => g.startsWith(p))
  })
  const entries = Object.entries(usage.byGroup || {})
  const filteredGroups = showAll ? entries : entries.filter(([group]) => allow.some((p) => group.startsWith(p)))

  return (
    <Box mt="8">
      <Heading size="7" mb="2">Curated Usage Summary</Heading>
      <Text as="p" color="gray" size="2" mb="3">
        Files scanned: {usage.filesScanned} · Variables declared: {usage.varsDeclared} · Variables used: {usage.varsUsed}
      </Text>

      <Box mb="3" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        {showAll ? (
          <NextLink href="/styles" style={{ textDecoration: 'underline' }}>Show curated subset</NextLink>
        ) : (
          <NextLink href="/styles?all=1" style={{ textDecoration: 'underline' }}>Show all groups</NextLink>
        )}
        <NextLink href="/styles?usage=0" style={{ textDecoration: 'underline' }}>Hide usage</NextLink>
      </Box>

      <Heading size="5" mb="2">Top Used Variables</Heading>
      <Grid columns={{ initial: '1', sm: '2', lg: '3' }} gap="3" mb="5">
        {top.slice(0, 24).map((it) => (
          <Card key={it.var}>
            <Box p="3">
              <Text as="div" size="2" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace' }}>{it.var}</Text>
              <Box mt="2" mb="2" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 14, height: 14, borderRadius: 4, background: it.value || 'transparent', display: 'inline-block', border: '1px solid rgba(255,255,255,0.15)' }} />
                <Code>{it.value || '—'}</Code>
              </Box>
              <Text as="div" size="2" color="gray">count: {it.count} · files: {it.files?.length || 0}</Text>
            </Box>
          </Card>
        ))}
      </Grid>

      <Heading size="5" mb="2">By Group</Heading>
      <Grid columns={{ initial: '1', sm: '2', lg: '3' }} gap="3">
        {filteredGroups.slice(0, 12).map(([group, items]) => (
          <Card key={group}>
            <Box p="3">
              <Heading size="4" mb="2">{group}</Heading>
              <Box style={{ display: 'grid', gap: 8 }}>
                {items.slice(0, 8).map((it) => (
                  <Box key={it.var} style={{ display: 'grid', gap: 4 }}>
                    <Text as="div" size="2" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace' }}>{it.var}</Text>
                    <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 12, height: 12, borderRadius: 3, background: it.value || 'transparent', display: 'inline-block', border: '1px solid rgba(255,255,255,0.15)' }} />
                        <Code>{it.value || '—'}</Code>
                      </Box>
                      <Text size="2" color="gray">{it.count}×</Text>
                    </Box>
                  </Box>
                ))}
                {items.length > 8 && (
                  <Text size="2" color="gray">+{items.length - 8} more…</Text>
                )}
              </Box>
            </Box>
          </Card>
        ))}
      </Grid>
    </Box>
  )
}
