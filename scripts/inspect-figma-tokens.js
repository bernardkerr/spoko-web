#!/usr/bin/env node
/*
  Inspect Figma tokens via Variables API and print a concise summary.
  Env requirements (prefer .env.local at project root, gitignored):
    - FIGMA_PERSONAL_ACCESS_TOKEN
    - FIGMA_FILE_KEY
    - Optional: FIGMA_BRANCH

  Usage:
    node scripts/inspect-figma-tokens.js
*/
import dotenv from 'dotenv'
import axios from 'axios'
import http from 'node:http'
import https from 'node:https'

// Explicitly load .env.local first (if present), then fallback to .env
dotenv.config({ path: '.env.local' })
dotenv.config()

function mask(s) {
  if (!s) return ''
  if (s.length <= 4) return '****'
  return `${s.slice(0, 2)}****${s.slice(-2)}`
}

function logHeader(title) {
  console.log(`\n=== ${title} ===`)
}

const agentOpts = { keepAlive: true }
const httpAgent = new http.Agent(agentOpts)
const httpsAgent = new https.Agent(agentOpts)
const TIMEOUT_MS = Number(process.env.FIGMA_TIMEOUT_MS || 15000)
const API_BASE = process.env.FIGMA_API_BASE || 'https://api.figma.com'
const api = axios.create({
  baseURL: API_BASE,
  timeout: TIMEOUT_MS,
  httpAgent,
  httpsAgent,
  headers: { Accept: 'application/json' },
})

async function requestWithRetry(fn, { retries = 2, label = 'request' } = {}) {
  let attempt = 0
  let lastErr
  while (attempt <= retries) {
    try {
      return await fn()
    } catch (err) {
      lastErr = err
      const code = err?.code || err?.response?.status
      const retriable = ['ECONNABORTED', 'ETIMEDOUT', 'EAI_AGAIN', 'ENOTFOUND'].includes(code) || (typeof code === 'number' && code >= 500)
      if (!retriable || attempt === retries) break
      const delay = Math.min(2000 * Math.pow(2, attempt), 8000)
      console.warn(`${label} failed (attempt ${attempt + 1}/${retries + 1}):`, code, err.message, '— retrying in', delay, 'ms')
      await new Promise(r => setTimeout(r, delay))
      attempt++
    }
  }
  throw lastErr
}

async function fetchVariables({ token, fileKey, branch }) {
  const headers = { 'X-Figma-Token': token }
  const params = {}
  if (branch) params.branch = branch

  const url = `/v1/files/${fileKey}/variables`
  console.log('GET', `${API_BASE}${url}`, params.branch ? `(branch=${params.branch})` : '')
  const { data } = await requestWithRetry(() => api.get(url, { headers, params }), { label: 'variables' })
  return data
}

async function fetchFileMeta({ token, fileKey, branch }) {
  const headers = { 'X-Figma-Token': token }
  const params = {}
  if (branch) params.branch = branch
  const url = `/v1/files/${fileKey}`
  console.log('GET', `${API_BASE}${url}`, params.branch ? `(branch=${params.branch})` : '')
  const { data } = await requestWithRetry(() => api.get(url, { headers, params }), { label: 'file meta' })
  return data
}

function summarizeVariables(data) {
  const collectionsById = new Map()
  for (const col of data.variableCollections || []) {
    collectionsById.set(col.id, col)
  }

  const variables = data.variables || []

  // Group by collection
  const byCollection = {}
  for (const v of variables) {
    const col = collectionsById.get(v.variableCollectionId)
    const colName = col?.name || v.variableCollectionId || 'unknown-collection'
    if (!byCollection[colName]) byCollection[colName] = []
    byCollection[colName].push(v)
  }

  // Try to detect radix-like scales by prefix (e.g., "accent/1", "gray/12")
  const report = []
  for (const [colName, vars] of Object.entries(byCollection)) {
    const collection = collectionsById.get(vars[0]?.variableCollectionId)
    const modes = (collection?.modes || []).map((m) => m.name)

    const scales = {}
    for (const v of vars) {
      const name = v.name // e.g., "accent/1" or "radius/2"
      const [prefix, suffix] = name.split('/')
      if (!prefix || !suffix) continue
      const bucket = prefix.toLowerCase()
      if (!scales[bucket]) scales[bucket] = new Set()
      scales[bucket].add(suffix)
    }

    const lines = []
    lines.push(`Collection: ${colName}`)
    lines.push(`  Modes: ${modes.length ? modes.join(', ') : 'none'}`)

    const interesting = ['accent', 'gray', 'radius', 'space', 'font', 'surface', 'panel', 'focus']
    const scaleKeys = Object.keys(scales)
      .sort((a, b) => a.localeCompare(b))
      .filter((k) => interesting.includes(k) || /^(accent|gray|.*color.*)$/i.test(k))

    if (scaleKeys.length === 0) {
      // If nothing matched, print a few examples
      const examples = vars.slice(0, 8).map((v) => v.name).join(', ')
      lines.push(`  Examples: ${examples}`)
    } else {
      for (const key of scaleKeys) {
        const values = Array.from(scales[key])
        // Try to order numerically if possible
        values.sort((a, b) => {
          const na = Number(a)
          const nb = Number(b)
          if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb
          return a.localeCompare(b)
        })
        lines.push(`  ${key}: ${values[0]}..${values[values.length - 1]} (${values.length})`)
      }
    }

    report.push(lines.join('\n'))
  }

  return report.join('\n\n')
}

async function main() {
  const token = process.env.FIGMA_PERSONAL_ACCESS_TOKEN
  const fileKey = process.env.FIGMA_FILE_KEY
  const branch = process.env.FIGMA_BRANCH
  const variablesFileKey = process.env.FIGMA_VARIABLES_FILE_KEY || fileKey

  if (!token || !fileKey) {
    console.error('Missing FIGMA_PERSONAL_ACCESS_TOKEN or FIGMA_FILE_KEY in env. Create a .env.local at repo root and set them.')
    process.exit(1)
  }

  logHeader('Env')
  console.log('FIGMA_PERSONAL_ACCESS_TOKEN:', mask(token))
  console.log('FIGMA_FILE_KEY:', mask(fileKey))
  if (variablesFileKey !== fileKey) console.log('FIGMA_VARIABLES_FILE_KEY:', mask(variablesFileKey))
  if (branch) console.log('FIGMA_BRANCH:', branch)

  try {
    logHeader('Fetching variables from Figma')
    // Preflight: ensure main file exists and is accessible
    try {
      const meta = await fetchFileMeta({ token, fileKey, branch })
      console.log('File OK:', meta.name)
    } catch (e) {
      console.error('Could not access file metadata. Check FIGMA_FILE_KEY and PAT access.')
      if (axios.isAxiosError(e)) {
        console.error('Meta Status:', e.response?.status)
        console.error('Meta Data  :', e.response?.data)
        console.error('Meta Error :', e.code, e.message)
      }
      throw e
    }

    // Preflight: ensure variables file exists (can be the same as fileKey)
    if (variablesFileKey !== fileKey) {
      try {
        const metaVars = await fetchFileMeta({ token, fileKey: variablesFileKey, branch })
        console.log('Variables File OK:', metaVars.name)
      } catch (e) {
        console.error('Could not access variables file metadata. Check FIGMA_VARIABLES_FILE_KEY and access.')
        if (axios.isAxiosError(e)) {
          console.error('Vars Meta Status:', e.response?.status)
          console.error('Vars Meta Data  :', e.response?.data)
          console.error('Vars Meta Error :', e.code, e.message)
        }
        throw e
      }
    }

    const data = await fetchVariables({ token, fileKey: variablesFileKey, branch })

    logHeader('Summary')
    const summary = summarizeVariables(data)
    console.log(summary)

    logHeader('Notes')
    console.log('- This is a structural summary. Values per mode are present in the API response but not printed here.')
    console.log('- After we confirm naming (e.g., accent/1..12, gray/1..12, radius/1..4), we will map these to Radix CSS vars.')
  } catch (err) {
    console.error('\nError fetching variables:')
    if (axios.isAxiosError(err)) {
      console.error('Status:', err.response?.status)
      console.error('Data  :', err.response?.data)
      console.error('Code  :', err.code)
      console.error('Msg   :', err.message)
      if (err.response?.status === 404) {
        console.error('\nTroubleshooting:')
        console.error('- Verify FIGMA_FILE_KEY is correct (copy from https://www.figma.com/file/<FILE_KEY>/...)')
        console.error('- Ensure the file is a Figma Design file (not FigJam) and you have access with this PAT user')
        console.error('- If your tokens live in a specific branch, set FIGMA_BRANCH to that branch name')
        console.error('- The Variables API returns 404 if variables are unavailable for this file/version/branch')
      } else if (err.code === 'ECONNABORTED') {
        console.error('- Request timed out. Check your network and try again.')
      } else if (err.code === 'ENOTFOUND') {
        console.error('- DNS resolution failed. Are you offline or behind a proxy?')
      }
    } else {
      console.error(err)
    }
    process.exit(1)
  }
}

main()
