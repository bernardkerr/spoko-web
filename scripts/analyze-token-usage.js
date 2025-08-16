#!/usr/bin/env node
/**
 * Scan the codebase for CSS variable usage (var(--...)) and generate a usage report
 * that maps to variables declared in styles/figma-tokens.css.
 *
 * Output: figma/usage-report.json
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const TOKENS_CSS = path.join(ROOT, 'styles', 'figma-tokens.css')
const SEARCH_DIRS = [
  path.join(ROOT, 'app'),
  path.join(ROOT, 'components'),
  path.join(ROOT, 'styles'),
  path.join(ROOT, 'lib'),
]
const OUTPUT = path.join(ROOT, 'figma', 'usage-report.json')

function readFileSafe(p) {
  try { return fs.readFileSync(p, 'utf-8') } catch { return null }
}

function walk(dir) {
  const out = []
  const stack = [dir]
  while (stack.length) {
    const cur = stack.pop()
    let entries
    try { entries = fs.readdirSync(cur, { withFileTypes: true }) } catch { continue }
    for (const e of entries) {
      const full = path.join(cur, e.name)
      if (e.isDirectory()) {
        // skip some noisy dirs
        if (e.name === 'node_modules' || e.name === '.next' || e.name === 'public') continue
        stack.push(full)
      } else if (e.isFile()) {
        // include common code/text files
        if (/\.(js|jsx|ts|tsx|css|md|mdx|mjs|cjs|json|html)$/i.test(e.name)) out.push(full)
      }
    }
  }
  return out
}

function parseCssVars(css) {
  // very simple parser: --var-name: value;
  const map = {}
  const re = /--([a-zA-Z0-9_-]+)\s*:\s*([^;]+);/g
  let m
  while ((m = re.exec(css))) {
    const name = `--${m[1]}`
    const value = m[2].trim()
    map[name] = value
  }
  return map
}

function scanUsage(files) {
  const usage = new Map() // varName -> { count, files: Set }
  const re = /var\(\s*(--[a-zA-Z0-9_-]+)\s*(?:,[^)]+)?\)/g
  for (const file of files) {
    const text = readFileSafe(file)
    if (!text) continue
    let m
    const seenVarsInFile = new Set()
    while ((m = re.exec(text))) {
      const v = m[1]
      const rec = usage.get(v) || { count: 0, files: new Set() }
      rec.count++
      seenVarsInFile.add(v)
      usage.set(v, rec)
    }
    // attach files where seen
    for (const varName of seenVarsInFile) {
      const rec = usage.get(varName)
      if (rec) rec.files.add(file)
    }
  }
  // serialize sets
  const out = {}
  for (const [k, v] of usage.entries()) {
    out[k] = { count: v.count, files: Array.from(v.files) }
  }
  return out
}

function groupByPrefix(varName) {
  // heuristic: take first 2 segments after removing leading --
  const base = varName.replace(/^--/, '')
  const parts = base.split('-')
  if (parts.length >= 3) return `${parts[0]}-${parts[1]}-${parts[2]}`
  if (parts.length >= 2) return `${parts[0]}-${parts[1]}`
  return parts[0] || base
}

function buildReport() {
  const css = readFileSafe(TOKENS_CSS) || ''
  const decls = parseCssVars(css)

  // gather files
  const files = SEARCH_DIRS.flatMap((d) => walk(d))
  const usage = scanUsage(files)

  // enrich
  const items = Object.keys(usage).map((varName) => ({
    var: varName,
    value: decls[varName] || null,
    group: groupByPrefix(varName),
    count: usage[varName].count,
    files: usage[varName].files,
    declared: Object.prototype.hasOwnProperty.call(decls, varName),
  }))

  // group by group
  const groups = {}
  for (const it of items) {
    if (!groups[it.group]) groups[it.group] = []
    groups[it.group].push(it)
  }
  for (const g of Object.keys(groups)) {
    groups[g].sort((a, b) => b.count - a.count)
  }

  // top summary
  const top = [...items].sort((a, b) => b.count - a.count).slice(0, 50)

  const report = {
    generatedAt: new Date().toISOString(),
    searchedDirs: SEARCH_DIRS.map((p) => path.relative(ROOT, p)),
    filesScanned: files.length,
    varsDeclared: Object.keys(decls).length,
    varsUsed: items.length,
    topUsed: top,
    byGroup: groups,
  }

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true })
  fs.writeFileSync(OUTPUT, JSON.stringify(report, null, 2))
  console.log(`Wrote ${path.relative(ROOT, OUTPUT)} (varsUsed=${items.length}, filesScanned=${files.length})`)
}

buildReport()
