import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const runtime = 'nodejs'

// Serve files only from docs-test/models directory
const BASE_DIR = path.join(process.cwd(), 'docs-test', 'models')

export async function GET(req, { params }) {
  try {
    const segs = Array.isArray(params?.path) ? params.path : []
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
