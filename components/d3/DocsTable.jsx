"use client"

import { useEffect, useMemo, useState } from 'react'
import { Box, Card, Heading, Text, TextField, Code, Tooltip, IconButton, Flex } from '@radix-ui/themes'

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
  const lines = md.split(/\r?\n/)
  const tables = []
  let cur = null
  for (const ln of lines) {
    const isTableLine = ln.trim().startsWith('|')
    if (isTableLine) {
      if (!cur) cur = []
      cur.push(ln)
    } else if (cur) {
      if (cur.length >= 2) tables.push(cur)
      cur = null
    }
  }
  if (cur && cur.length >= 2) tables.push(cur)

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
    ['Name', 'Description', 'Signature', 'Docs'],
    ['Name', 'Description', 'Docs'],
    ['Base', 'Description', 'Signature', 'Docs'], // allow alternate header
  ]
  for (const t of tables) {
    const parsed = parseOne(t)
    for (const expected of expectedCandidates) {
      if (parsed.headers.length === expected.length && parsed.headers.every((h, i) => h === expected[i])) {
        return parsed
      }
    }
  }
  return tables.length ? parseOne(tables[0]) : { headers: [], rows: [] }
}

function normalizeRows(rows) {
  return rows.map((r) => ({
    name: r['Name'] || r['Base'] || '',
    description: r['Description'] || '',
    signature: r['Signature'] || '',
    docs: r['Docs'] || '',
  }))
}

export function DocsTable({ markdownUrl, height, showTitle = true }) {
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
    return () => { cancelled = true }
  }, [markdownUrl])

  const rows = useMemo(() => {
    const parsed = parseMarkdownTable(text)
    const normalized = normalizeRows(parsed.rows)
    if (!query) return normalized
    const q = query.toLowerCase()
    return normalized.filter((r) =>
      r.name.toLowerCase().includes(q) ||
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
      } catch {}
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

  function renderDocsCell(docs) {
    if (!docs) return ''
    const parts = docs.split(/,\s*/).filter(Boolean)
    return (
      <>
        {parts.map((p, i) => {
          const url = p.replace(/\[(.*?)\]\((.*?)\)/, '$2')
          const text = (() => {
            const m = p.match(/\[(.*?)\]\((.*?)\)/)
            if (m) return m[1]
            try { const u = new URL(url); return u.hostname.replace(/^www\./,'') } catch { return url }
          })()
          return (
            <a key={i} href={url} target="_blank" rel="noreferrer noopener" style={{ marginRight: 8 }}>{text}</a>
          )
        })}
      </>
    )
  }

  return (
    <Card>
      <Box p="4">
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {showTitle && (
            <Heading size="6">D3 Doc</Heading>
          )}
          <Text color="gray" size="2">Source: {markdownUrl}</Text>
        </Box>
        <Box mt="3">
          <TextField.Root placeholder="Search name / description / signature" value={query} onChange={(e) => setQuery(e.target.value)} />
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
                <th style={{ textAlign: 'left', padding: '8px' }}>Name</th>
                <th style={{ textAlign: 'left', padding: '8px' }}>Description</th>
                <th style={{ textAlign: 'left', padding: '8px' }}>Docs</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr key={idx}>
                  <td style={{ padding: '8px', borderTop: '1px solid var(--gray-a4)' }}>{r.name}</td>
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
                    {renderDocsCell(r.docs)}
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
