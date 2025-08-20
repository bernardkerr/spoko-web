#!/usr/bin/env node
import fs from 'fs'
import path from 'path'

const SRC_DIRS = [
  // Legacy test images
  path.join(process.cwd(), 'docs-test', 'images'),
  // All submodule images: docs-submodules/<repo>/images
  // We'll expand this glob-like path at runtime
  path.join(process.cwd(), 'docs-submodules'),
  // Local content images override everything
  path.join(process.cwd(), 'content', 'images'),
]
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
  for (const src of SRC_DIRS) {
    // If src is the docs-submodules root, iterate its children and copy their images/ folders
    const docsSubmodulesRoot = path.join(process.cwd(), 'docs-submodules')
    if (src === docsSubmodulesRoot && fs.existsSync(docsSubmodulesRoot)) {
      for (const entry of fs.readdirSync(docsSubmodulesRoot, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue
        const imagesDir = path.join(docsSubmodulesRoot, entry.name, 'images')
        if (fs.existsSync(imagesDir)) {
          copyDir(imagesDir, DEST_DIR)
          console.log(`[sync-content-images] Synced ${imagesDir} -> ${DEST_DIR}`)
        }
      }
      continue
    }

    // Otherwise, copy the src directory directly if it exists
    copyDir(src, DEST_DIR)
    console.log(`[sync-content-images] Synced ${src} -> ${DEST_DIR}`)
  }
} catch (e) {
  console.error('[sync-content-images] Error:', e)
  process.exitCode = 1
}
