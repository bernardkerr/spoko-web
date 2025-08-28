#!/usr/bin/env node
/**
 * Ingest local Figma exports from figma/exports/*.json and emit CSS custom properties.
 *
 * Input files look like a Variables collection export with shape:
 * {
 *   id, name, modes: {<modeId>: <modeName>, ...},
 *   variableIds: [...],
 *   variables: [
 *     { id, name, type: 'COLOR'|'FLOAT'|'STRING'|..., valuesByMode: {<modeId>: <value>}, resolvedValuesByMode: {<modeId>: { resolvedValue, alias } } }
  *   ]
  * }
  *
  * Output: styles/figma-tokens.css
  * - :root { --<collection>-<var-name>: value; }
  * - Picks the first mode in each collection, unless overridden with FIGMA_EXPORT_MODE="<Mode Name>"
  */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const EXPORTS_DIR = path.join(ROOT, 'figma', 'exports')
const OUT_CSS = path.join(ROOT, 'styles', 'figma-tokens.css')

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true })
}

function listJsonFiles(dir) {
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((f) => f.toLowerCase().endsWith('.json'))
    .map((f) => path.join(dir, f))
}

function readJson(file) {
  const raw = fs.readFileSync(file, 'utf8')
  try {
    return JSON.parse(raw)
  } catch (e) {
    throw new Error(`Failed to parse JSON: ${file}: ${e.message}`)
  }
}

function toKebab(s) {
  return String(s)
    // insert dash between camelCase boundaries and between letters/digits
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .replace(/([a-zA-Z])([0-9]+)/g, '$1-$2')
    .replace(/([0-9])([a-zA-Z])/g, '$1-$2')
    // normalize spaces and slashes to dashes
    .replace(/\s+/g, '-')
    .replace(/\//g, '-')
    // drop unsupported chars
    .replace(/[^a-zA-Z0-9_-]/g, '')
    // collapse multiple dashes
    .replace(/-+/g, '-')
    // trim leading/trailing dashes
    .replace(/^-/g, '')
    .replace(/-$/g, '')
    .toLowerCase()
}

function colorToCss(v) {
  // v can be object with r,g,b,a in 0..1 or string hex
  if (v && typeof v === 'object' && 'r' in v && 'g' in v && 'b' in v) {
    const r = Math.round((v.r ?? 0) * 255)
    const g = Math.round((v.g ?? 0) * 255)
    const b = Math.round((v.b ?? 0) * 255)
    const a = v.a == null ? 1 : Number(v.a)
    return `rgba(${r}, ${g}, ${b}, ${Number.isFinite(a) ? a : 1})`
  }
  if (typeof v === 'string') return v
  return String(v)
}

function floatToCss(v) {
  // Default to px for numeric values
  if (typeof v === 'number') return `${v}px`
  return String(v)
}

function pickMode(collection, preferredName) {
  const modes = collection.modes || {}
  const entries = Object.entries(modes)
  if (entries.length === 0) return null
  if (preferredName) {
    const found = entries.find(([, name]) => name === preferredName)
    if (found) return { id: found[0], name: found[1] }
  }
  // First mode as default
  return { id: entries[0][0], name: entries[0][1] }
}

function renderCollection(collection, preferredModeName, definedThemeVars) {
  const vars = collection.variables || []
  const mode = pickMode(collection, preferredModeName)
  const lines = []
  const colName = toKebab(collection.name || 'collection')
  lines.push(`  /* ${collection.name}${mode ? ` — mode: ${mode.name}` : ''} */`)

  for (const v of vars) {
    const varName = toKebab(v.name || v.id)
    let cssValue
    let raw
    if (mode) {
      const resolved = v.resolvedValuesByMode?.[mode.id]?.resolvedValue
      const base = v.valuesByMode?.[mode.id]
      raw = resolved ?? base
    } else {
      // No modes: try raw value
      raw = v.value ?? v.valuesByMode ?? v.resolvedValuesByMode ?? null
    }

    if (v.type === 'COLOR') {
      cssValue = colorToCss(raw)
    } else if (v.type === 'FLOAT' || typeof raw === 'number') {
      cssValue = floatToCss(raw)
    } else {
      cssValue = String(raw)
    }

    if (cssValue == null || cssValue === 'undefined') continue
    const cssVar = `--${colName}-${varName}`
    lines.push(`  ${cssVar}: ${cssValue};`)
    if (definedThemeVars && cssVar.startsWith('--theme-')) definedThemeVars.add(cssVar)
  }

  return lines
}

// Support for a simple tokens map format like:
// {
//   "themeA": { "colorsAccentAccent1": "#fff", "radius1": 3, ... },
//   "themeB": { ... }
// }
function isTokensMap(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return false
  // Heuristic: values are objects with primitive leaves
  return Object.values(data).every((v) => v && typeof v === 'object' && !Array.isArray(v))
}

function humanizeKey(k) {
  // e.g., themeA -> Theme A
  const withSpaces = String(k)
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[-_]+/g, ' ')
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1)
}

function renderTokensMap(data, preferredModeName, definedThemeVars) {
  const entries = Object.entries(data)
  if (entries.length === 0) return []

  let chosen = entries[0]
  if (preferredModeName) {
    const found = entries.find(([key]) => key === preferredModeName || humanizeKey(key) === preferredModeName)
    if (found) chosen = found
  }

  const [modeKey, tokens] = chosen
  const lines = []
  const colName = 'theme' // fixed collection name for tokens maps
  lines.push(`  /* Theme — mode: ${humanizeKey(modeKey)} */`)

  for (const [rawKey, rawVal] of Object.entries(tokens)) {
    const varName = toKebab(rawKey)
    let cssValue
    if (typeof rawVal === 'number') {
      cssValue = floatToCss(rawVal)
    } else {
      cssValue = colorToCss(rawVal)
    }
    if (cssValue == null || cssValue === 'undefined') continue
    const cssVar = `--${colName}-${varName}`
    lines.push(`  ${cssVar}: ${cssValue};`)
    if (definedThemeVars && cssVar.startsWith('--theme-')) definedThemeVars.add(cssVar)
  }

  return lines
}

function scanUsedThemeVars(rootDir) {
  const used = new Set()
  const exts = new Set(['.css', '.scss', '.sass', '.less', '.js', '.jsx', '.ts', '.tsx', '.md', '.mdx', '.html'])
  const skip = new Set(['node_modules', '.git', '.next', 'out', 'dist', 'build'])
  const re = /var\(\s*(--theme-[a-zA-Z0-9_-]+)\b/g

  function walk(dir) {
    let entries
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true })
    } catch {
      return
    }
    for (const ent of entries) {
      if (skip.has(ent.name)) continue
      const full = path.join(dir, ent.name)
      if (ent.isDirectory()) {
        walk(full)
      } else {
        const ext = path.extname(ent.name)
        if (!exts.has(ext)) continue
        let text = ''
        try {
          text = fs.readFileSync(full, 'utf8')
        } catch {
          continue
        }
        let m
        while ((m = re.exec(text)) !== null) {
          used.add(m[1])
        }
      }
    }
  }

  walk(rootDir)
  return used
}

function main() {
  const files = listJsonFiles(EXPORTS_DIR)
  if (files.length === 0) {
    console.error(`No JSON exports found in ${EXPORTS_DIR}. Place your collection exports there.`)
    process.exit(1)
  }

  const preferredMode = process.env.FIGMA_EXPORT_MODE || ''

  const chunks = []
  chunks.push('/* Generated from figma/exports by scripts/ingest_figma_exports.js */')
  chunks.push(':root {')
  const definedThemeVars = new Set()

  for (const file of files) {
    const data = readJson(file)
    if (data && data.variables) {
      chunks.push(...renderCollection(data, preferredMode, definedThemeVars))
      continue
    }
    if (isTokensMap(data)) {
      chunks.push(...renderTokensMap(data, preferredMode, definedThemeVars))
      continue
    }
    // Unknown format: skip
  }

  chunks.push('}')
  chunks.push('')

  ensureDir(path.dirname(OUT_CSS))
  fs.writeFileSync(OUT_CSS, chunks.join('\n') + '\n', 'utf8')
  console.log(`Wrote ${path.relative(ROOT, OUT_CSS)}`)

  // Emit warnings for theme vars used but not defined by tokens
  const usedThemeVars = scanUsedThemeVars(ROOT)
  const missing = [...usedThemeVars].filter((v) => !definedThemeVars.has(v)).sort()
  if (missing.length > 0) {
    console.warn(`\n[figma:ingest] WARNING: ${missing.length} theme token(s) used but not defined:`)
    for (const v of missing) {
      console.warn(`  - ${v} (add to figma exports or provide a fallback in styles/globals.css)`) 
    }
  }
}

main()
