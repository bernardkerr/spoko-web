"use client"

import { useEffect, useMemo, useState } from 'react'
import { Box, Card, Heading, Text, TextField, Code, Tooltip, IconButton, Flex } from '@radix-ui/themes'

// Inline minimal SVG icons to avoid external dependency on @radix-ui/react-icons
function ClipboardCopyIcon(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" {...props}>
      <path d="M9 3H7a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2v-1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 3h6v4H9V3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="13" y="9" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="2"/>
    </svg>
  )
}

function CheckIcon(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" {...props}>
      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function parseMarkdownTable(md) {
  // Extract all markdown tables, then pick the one with expected headers
  const lines = md.split(/\r?\n/)
  const tables = []
  let current = null
  for (const ln of lines) {
    const isTableLine = ln.trim().startsWith('|')
    if (isTableLine) {
      if (!current) current = []
      current.push(ln)
    } else if (current) {
      if (current.length >= 2) tables.push(current)
      current = null
    }
  }
  if (current && current.length >= 2) tables.push(current)

  const parseOne = (tableLines) => {
    const headerLine = tableLines[0]
    const headers = headerLine.split('|').slice(1, -1).map((h) => h.trim())
    const rows = []
    for (let i = 2; i < tableLines.length; i++) {
      const parts = tableLines[i].split('|').slice(1, -1).map((c) => c.trim())
      if (parts.length !== headers.length) continue
      rows.push(Object.fromEntries(headers.map((h, idx) => [h, parts[idx]])))
    }
    return { headers, rows }
  }

  const expectedCandidates = [
    ['Base', 'Description', 'Signature', 'JS Docs', 'C++ Docs'],
    ['Base', 'Description', 'JS Docs', 'C++ Docs'],
  ]
  for (const t of tables) {
    const parsed = parseOne(t)
    for (const expected of expectedCandidates) {
      if (parsed.headers.length === expected.length && parsed.headers.every((h, i) => h === expected[i])) {
        return parsed
      }
    }
  }
  // Fallback to first table if nothing matches
  return tables.length ? parseOne(tables[0]) : { headers: [], rows: [] }
}

function normalizeRows(rows) {
  // Ensure consistent fields; keep original order
  return rows.map((r) => ({
    base: r['Base'] || '',
    description: r['Description'] || '',
    signature: r['Signature'] || '',
    jsDocUrl: r['JS Docs'] || '',
    cppDocUrl: r['C++ Docs'] || '',
  }))
}

export function DocsTable({ markdownUrl, height }) {
  const [text, setText] = useState('')
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setError(null)
        const res = await fetch(markdownUrl, { cache: 'no-store' })
        if (!res.ok) throw new Error(`Failed to load ${markdownUrl}: ${res.status}`)
        const t = await res.text()
        if (!cancelled) setText(t)
      } catch (e) {
        if (!cancelled) setError(e?.message || String(e))
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [markdownUrl])

  const rows = useMemo(() => {
    const parsed = parseMarkdownTable(text)
    const normalized = normalizeRows(parsed.rows)
    if (!query) return normalized
    const q = query.toLowerCase()
    return normalized.filter((r) =>
      r.base.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.signature.toLowerCase().includes(q)
    )
  }, [text, query])

  function SignatureChip({ value }) {
    const [copied, setCopied] = useState(false)

    if (!value) return null

    const doCopy = async () => {
      try {
        await navigator.clipboard.writeText(value)
        setCopied(true)
        setTimeout(() => setCopied(false), 1200)
      } catch {
        // noop
      }
    }

    return (
      <Flex align="center" gap="2" asChild={false} style={{ maxWidth: '100%' }}>
        <Tooltip content={<Text size="2" style={{ fontFamily: 'var(--code-font-family, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace)' }}>{value}</Text>} side="top" align="start">
          <Code
            variant="soft"
            highContrast
            size="2"
            style={{
              display: 'inline-block',
              // Responsive width: min(cell width minus button, but not smaller than 24ch, and can grow with viewport)
              maxWidth: 'clamp(24ch, 50vw, calc(100% - 32px))',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              verticalAlign: 'middle',
            }}
            title={value}
          >
            {value}
          </Code>
        </Tooltip>
        <IconButton size="1" variant="soft" color={copied ? 'green' : 'gray'} aria-label="Copy signature" onClick={doCopy}>
          {copied ? <CheckIcon /> : <ClipboardCopyIcon />}
        </IconButton>
      </Flex>
    )
  }

  return (
    <Card>
      <Box p="4">
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Heading size="6">OCJS Docs Helper</Heading>
          <Text color="gray" size="2">Source: {markdownUrl}</Text>
        </Box>
        <Box mt="3">
          <TextField.Root placeholder="Search base / variation / description" value={query} onChange={(e) => setQuery(e.target.value)} />
        </Box>
        {error && (
          <Box mt="3">
            <Text color="red" size="2">{error}</Text>
          </Box>
        )}
        <Box mt="3" style={{ ...(height ? { height, overflow: 'auto' } : {}), border: '1px solid var(--gray-a6)', borderRadius: 8 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px' }}>Base</th>
                <th style={{ textAlign: 'left', padding: '8px' }}>Description</th>
                <th style={{ textAlign: 'left', padding: '8px' }}>JS Docs</th>
                <th style={{ textAlign: 'left', padding: '8px' }}>C++ Docs</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr key={idx}>
                  <td style={{ padding: '8px', borderTop: '1px solid var(--gray-a4)' }}>{r.base}</td>
                  <td style={{ padding: '8px', borderTop: '1px solid var(--gray-a4)' }}>
                    <div>
                      <span style={{ display: 'inline' }}>{r.description}</span>
                      {r.signature && (
                        <div style={{ marginTop: '4px' }}>
                          <SignatureChip value={r.signature} />
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '8px', borderTop: '1px solid var(--gray-a4)' }}>
                    {r.jsDocUrl ? <a href={r.jsDocUrl} target="_blank" rel="noreferrer noopener">JS</a> : ''}
                  </td>
                  <td style={{ padding: '8px', borderTop: '1px solid var(--gray-a4)' }}>
                    {r.cppDocUrl && r.cppDocUrl !== '-' ? <a href={r.cppDocUrl} target="_blank" rel="noreferrer noopener">C++</a> : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </Box>
    </Card>
  )
}
