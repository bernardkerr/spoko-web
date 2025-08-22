import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const runtime = 'nodejs'
export const dynamic = 'force-static'
export const revalidate = 3600

// Serve files only from docs-test/models directory
const BASE_DIR = path.join(process.cwd(), 'docs-test', 'models')

// Enumerate all static params so this API route can be exported with output: 'export'
export async function generateStaticParams() {
  try {
    const entries = await fs.promises.readdir(BASE_DIR)
    // Only include files we intend to serve
    const allowed = new Set(['.stl', '.step', '.stp'])
    return entries
      .filter((name) => allowed.has(path.extname(name).toLowerCase()))
      .map((name) => ({ path: ['models', name] }))
  } catch {
    return []
  }
}

export async function GET(req, { params }) {
  try {
    const p = await params
    const segs = Array.isArray(p?.path) ? p.path : []
    // Require first segment to be 'models'
    if (segs.length === 0 || segs[0] !== 'models') {
      return new NextResponse('Not Found', { status: 404 })
    }
    const rel = segs.slice(1).join('/')
    // Resolve and ensure the resolved path stays under BASE_DIR
    const abs = path.resolve(BASE_DIR, rel)
    if (!abs.startsWith(BASE_DIR)) {
      return new NextResponse('Forbidden', { status: 403 })
    }
    await fs.promises.access(abs, fs.constants.R_OK)
    const stat = await fs.promises.stat(abs)
    if (!stat.isFile()) {
      return new NextResponse('Not Found', { status: 404 })
    }
    const ext = path.extname(abs).toLowerCase()
    const type = ext === '.stl' ? 'model/stl' : (ext === '.step' || ext === '.stp') ? 'application/step' : 'application/octet-stream'
    const data = await fs.promises.readFile(abs)
    return new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': type,
        'Content-Length': String(data.length),
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (e) {
    const msg = e?.message || 'Not Found'
    return new NextResponse(msg, { status: 404 })
  }
}
