import dotenv from 'dotenv';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

// Load env from .env.local first (if present), then fallback to .env
// This ensures scripts can read values commonly stored in Next.js projects.
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: true });
dotenv.config();

const FIGMA_API = process.env.FIGMA_API_BASE || 'https://api.figma.com/v1';

function maskToken(token) {
  if (!token) return 'MISSING';
  const len = token.length;
  if (len <= 6) return '*'.repeat(len);
  return `${token.slice(0, 3)}...${token.slice(-3)} (len:${len})`;
}

async function appendDebug(outDir, lines) {
  try {
    await fs.mkdir(outDir, { recursive: true });
    const logFile = path.join(outDir, 'fetch.debug.log');
    await fs.appendFile(logFile, lines.join('\n') + '\n', 'utf-8');
  } catch {}
}

function httpClient() {
  const pat = process.env.FIGMA_PAT || process.env.FIGMA_PERSONAL_ACCESS_TOKEN || process.env.FIGMA_ACCESS_TOKEN;
  if (!pat) throw new Error('Missing FIGMA_PAT (or FIGMA_PERSONAL_ACCESS_TOKEN/FIGMA_ACCESS_TOKEN) in environment');
  return axios.create({
    baseURL: FIGMA_API,
    headers: { 'X-Figma-Token': pat, 'Accept': 'application/json' },
    timeout: Number(process.env.FIGMA_TIMEOUT_MS || 20000),
    validateStatus: () => true,
  });
}

async function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

function buildPath(pathname, params = {}) {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') usp.append(k, String(v));
  }
  return usp.toString() ? `${pathname}?${usp.toString()}` : pathname;
}

async function getWithRetry(client, pathname, outDir, maxRetries = 3) {
  let attempt = 0;
  while (true) {
    attempt++;
    try {
      const res = await client.get(pathname);
      // Retry on 429
      if (res.status === 429 && attempt <= maxRetries) {
        const wait = Math.min(2000 * attempt, 8000);
        await appendDebug(outDir, [
          `429 on ${pathname}, retrying in ${wait}ms (attempt ${attempt}/${maxRetries})`,
        ]);
        await sleep(wait);
        continue;
      }
      return res;
    } catch (e) {
      if (attempt >= maxRetries) throw e;
      const wait = Math.min(1000 * attempt, 5000);
      await appendDebug(outDir, [
        `Network error on ${pathname}: ${e?.message || e}. Retrying in ${wait}ms (attempt ${attempt}/${maxRetries})`,
      ]);
      await sleep(wait);
    }
  }
}

async function ensureOutDir(outDir) {
  await fs.mkdir(outDir, { recursive: true });
}

async function main() {
  let fileKey = process.env.FIGMA_FILE_KEY;
  const fileUrl = process.env.FIGMA_FILE_URL || '';
  if (!fileKey && fileUrl) {
    // Extract key from URLs like
    // https://www.figma.com/file/<KEY>/... or https://www.figma.com/design/<KEY>/...
    const m = fileUrl.match(/figma\.com\/(?:file|design)\/([A-Za-z0-9]+)\b/)
    if (m && m[1]) fileKey = m[1];
  }
  if (!fileKey) {
    throw new Error('Missing FIGMA_FILE_KEY in environment (or FIGMA_FILE_URL). Set FIGMA_FILE_KEY or FIGMA_FILE_URL in .env.local');
  }

  const outDir = path.resolve(process.cwd(), process.env.FIGMA_OUT_DIR || 'tmp/figma');
  await ensureOutDir(outDir);

  // Diagnostics header
  const pat = process.env.FIGMA_PAT || process.env.FIGMA_PERSONAL_ACCESS_TOKEN || process.env.FIGMA_ACCESS_TOKEN || '';
  const branch = process.env.FIGMA_BRANCH || '';
  const variablesFileKey = process.env.FIGMA_VARIABLES_FILE_KEY || fileKey;
  const debugLines = [
    '=== Spoke Toolkit Fetch Diagnostics ===',
    `node: ${process.version}`,
    `cwd: ${process.cwd()}`,
    `outDir: ${outDir}`,
    `FIGMA_FILE_KEY: ${fileKey} (len:${fileKey.length})`,
    variablesFileKey !== fileKey ? `FIGMA_VARIABLES_FILE_KEY: ${variablesFileKey}` : undefined,
    fileUrl ? `FIGMA_FILE_URL: ${fileUrl}` : undefined,
    `FIGMA_PAT: ${maskToken(pat)}`,
    branch ? `FIGMA_BRANCH: ${branch}` : undefined,
  ];
  await appendDebug(outDir, debugLines.filter(Boolean));

  const client = httpClient();

  const q = branch ? { branch } : {};
  const varsPath = buildPath(`/files/${variablesFileKey}/variables`, q);
  const stylesPath = buildPath(`/files/${fileKey}/styles`, q);
  const docPath = buildPath(`/files/${fileKey}`, q);

  console.log('Fetching variables...');
  let variablesRes;
  try {
    variablesRes = await getWithRetry(client, varsPath, outDir);
  } catch (e) {
    await appendDebug(outDir, [
      `ERROR requesting ${varsPath}: ${e?.message || e}`,
    ]);
    variablesRes = undefined;
  }
  await appendDebug(outDir, [
    `GET ${varsPath} -> status ${variablesRes.status}`,
    `x-rate-limit-remaining: ${variablesRes.headers?.['x-ratelimit-remaining'] ?? 'n/a'}`,
  ]);

  console.log('Fetching styles...');
  let stylesRes;
  try {
    stylesRes = await getWithRetry(client, stylesPath, outDir);
  } catch (e) {
    await appendDebug(outDir, [
      `ERROR requesting ${stylesPath}: ${e?.message || e}`,
    ]);
    stylesRes = undefined;
  }
  await appendDebug(outDir, [
    `GET ${stylesPath} -> status ${stylesRes.status}`,
    `x-rate-limit-remaining: ${stylesRes.headers?.['x-ratelimit-remaining'] ?? 'n/a'}`,
  ]);

  const fetchDocument = String(process.env.FIGMA_FETCH_DOCUMENT || 'false').toLowerCase() === 'true';
  let docRes;
  let documentStatus = 'skipped';
  let documentSummary;
  if (fetchDocument) {
    console.log('Fetching document (for node analysis)...');
    try {
      docRes = await getWithRetry(client, docPath, outDir);
      documentStatus = String(docRes?.status ?? 'no-response');
    } catch (e) {
      await appendDebug(outDir, [
        `ERROR requesting ${docPath}: ${e?.message || e}`,
      ]);
      docRes = undefined;
      documentStatus = 'error';
    }
    await appendDebug(outDir, [
      `GET ${docPath} -> status ${documentStatus}`,
      docRes?.headers?.['content-length'] ? `content-length: ${docRes.headers['content-length']}` : undefined,
    ].filter(Boolean));

    // Build a compact summary to avoid stringifying the full document (can be very large)
    const doc = docRes?.data;
    documentSummary = doc
      ? {
          name: doc.name,
          lastModified: doc.lastModified,
          version: doc.version,
          pages: Array.isArray(doc.document?.children) ? doc.document.children.length : undefined,
          rootId: doc.document?.id,
        }
      : undefined;
  } else {
    await appendDebug(outDir, [
      'Document fetch: skipped (set FIGMA_FETCH_DOCUMENT=true to enable)'
    ]);
  }

  const raw = {
    fetchedAt: new Date().toISOString(),
    fileKey,
    variables: variablesRes?.data,
    styles: stylesRes?.data,
    documentSummary,
  };

  const outFile = path.join(outDir, 'tokens.raw.json');
  try {
    await fs.writeFile(outFile, JSON.stringify(raw, null, 2), 'utf-8');
    console.log(`Wrote ${outFile}`);
  } catch (e) {
    console.error('Failed to write tokens.raw.json:', e?.message || e);
  }

  // Write separate response bodies for quick inspection
  const varsFile = path.join(outDir, 'tokens.variables.raw.json');
  const stylesFile = path.join(outDir, 'tokens.styles.raw.json');
  const docSummaryFile = path.join(outDir, 'document.summary.json');
  try { await fs.writeFile(varsFile, JSON.stringify(variablesRes?.data ?? { error: 'no-response' }, null, 2), 'utf-8'); } catch (e) { console.error('Failed to write tokens.variables.raw.json:', e?.message || e); }
  try { await fs.writeFile(stylesFile, JSON.stringify(stylesRes?.data ?? { error: 'no-response' }, null, 2), 'utf-8'); } catch (e) { console.error('Failed to write tokens.styles.raw.json:', e?.message || e); }
  // When document is fetched, write a compact document summary instead of full raw document
  if (fetchDocument) {
    try {
      const d = docRes?.data;
      const pages = Array.isArray(d?.document?.children) ? d.document.children : [];
      const summary = {
        name: d?.name,
        lastModified: d?.lastModified,
        version: d?.version,
        pageCount: pages.length,
        pages: pages.slice(0, 50).map(p => ({ id: p.id, name: p.name, type: p.type, childCount: Array.isArray(p.children) ? p.children.length : 0 })),
        note: pages.length > 50 ? 'truncated to first 50 pages' : undefined,
      };
      await fs.writeFile(docSummaryFile, JSON.stringify(summary, null, 2), 'utf-8');
    } catch (e) { console.error('Failed to write document.summary.json:', e?.message || e); }
  }

  // If we have a document, traverse to collect interesting node IDs and fetch their details
  let nodeDetails = {};
  if (fetchDocument && docRes?.data?.document) {
    const root = docRes.data.document;
    const ids = [];
    const stack = [root];
    const includeTypes = new Set(['TEXT','RECTANGLE','ELLIPSE','POLYGON','STAR','VECTOR','FRAME','COMPONENT','INSTANCE','GROUP','LINE'] );
    while (stack.length) {
      const n = stack.pop();
      if (!n) continue;
      if (n.type && includeTypes.has(n.type) && n.id) ids.push(n.id);
      if (n.children) {
        for (const c of n.children) stack.push(c);
      }
    }
    // De-dup and cap to avoid huge requests
    const uniqueIds = Array.from(new Set(ids));
    const cap = 1200;
    const toFetch = uniqueIds.slice(0, cap);
    const chunks = [];
    const size = 200; // Figma allows many ids; keep chunks reasonable
    for (let i = 0; i < toFetch.length; i += size) chunks.push(toFetch.slice(i, i + size));

    console.log(`Fetching node details in ${chunks.length} batch(es), ${toFetch.length} nodes...`);
    for (const batch of chunks) {
      const nodesPath = buildPath(`/files/${fileKey}/nodes`, { ids: batch.join(','), ...q });
      const res = await getWithRetry(client, nodesPath, outDir);
      if (res.status >= 200 && res.status < 300 && res.data?.nodes) {
        Object.assign(nodeDetails, res.data.nodes);
      } else {
        await appendDebug(outDir, [
          `Nodes batch failed status ${res.status}`,
        ]);
      }
    }
  }
  const nodesFile = path.join(outDir, 'nodes.details.raw.json');
  await fs.writeFile(nodesFile, JSON.stringify(nodeDetails, null, 2), 'utf-8');

  // Fail clearly if API returned non-2xx or error flag in body
  // Treat 404 on variables as non-fatal (file may not use Variables yet)
  const summary = [
    '=== Endpoint Summary ===',
    `variables: ${variablesRes ? variablesRes.status : 'no-response'}`,
    `styles: ${stylesRes ? stylesRes.status : 'no-response'}`,
    `document: ${fetchDocument ? (docRes ? docRes.status : 'no-response') : 'skipped'}`,
    `nodes: ${Object.keys(nodeDetails).length}`,
  ];
  console.log(summary.join('\n'));
  await appendDebug(outDir, summary);

  const varsBad = !variablesRes || variablesRes.status >= 400 || variablesRes.data?.error;
  const varsFatal = !variablesRes || ((variablesRes.status >= 400 && variablesRes.status !== 404) || variablesRes.data?.error);
  const stylesBad = !stylesRes || stylesRes.status >= 400 || stylesRes.data?.error;
  if (stylesBad) {
    console.error('Error: /styles did not succeed. Check out/tokens.styles.raw.json and fetch.debug.log');
    process.exit(2);
  }
  if (varsFatal) {
    console.error('Warning: /variables failed (non-404). Proceeding with styles only.');
  } else if (varsBad) {
    console.warn('Info: /variables returned 404 (no Variables found). Proceeding with styles only.');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
