#!/usr/bin/env node
import fs from 'fs'
import path from 'path'

const SRC_DIR = path.join(process.cwd(), 'content', 'images')
const DEST_DIR = path.join(process.cwd(), 'public', 'content', 'images')

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return
  fs.mkdirSync(dest, { recursive: true })
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name)
    const d = path.join(dest, entry.name)
    if (entry.isDirectory()) {
      copyDir(s, d)
    } else if (entry.isFile()) {
      fs.copyFileSync(s, d)
    }
  }
}

try {
  copyDir(SRC_DIR, DEST_DIR)
  console.log(`[sync-content-images] Synced ${SRC_DIR} -> ${DEST_DIR}`)
} catch (e) {
  console.error('[sync-content-images] Error:', e)
  process.exitCode = 1
}
