import 'dotenv/config';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

const FIGMA_API = 'https://api.figma.com/v1';

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
  const pat = process.env.FIGMA_PAT;
  if (!pat) throw new Error('Missing FIGMA_PAT in environment');
  return axios.create({
    baseURL: FIGMA_API,
    headers: { 'X-Figma-Token': pat },
    validateStatus: () => true,
  });
}

async function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

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
  const fileKey = process.env.FIGMA_FILE_KEY;
  if (!fileKey) throw new Error('Missing FIGMA_FILE_KEY in environment');

  const outDir = path.resolve(process.cwd(), 'out');
  await ensureOutDir(outDir);

  // Diagnostics header
  const pat = process.env.FIGMA_PAT || '';
  const debugLines = [
    '=== Spoke Toolkit Fetch Diagnostics ===',
    `node: ${process.version}`,
    `cwd: ${process.cwd()}`,
    `outDir: ${outDir}`,
    `FIGMA_FILE_KEY: ${fileKey} (len:${fileKey.length})`,
    `FIGMA_PAT: ${maskToken(pat)}`,
  ];
  await appendDebug(outDir, debugLines);

  const client = httpClient();

  const varsPath = `/files/${fileKey}/variables`;
  const stylesPath = `/files/${fileKey}/styles`;
  const docPath = `/files/${fileKey}`;

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

  console.log('Fetching document (for node analysis)...');
  let docRes;
  try {
    docRes = await getWithRetry(client, docPath, outDir);
  } catch (e) {
    await appendDebug(outDir, [
      `ERROR requesting ${docPath}: ${e?.message || e}`,
    ]);
    docRes = undefined;
  }
  await appendDebug(outDir, [
    `GET ${docPath} -> status ${docRes?.status ?? 'no-response'}`,
  ]);

  const raw = {
    fetchedAt: new Date().toISOString(),
    fileKey,
    variables: variablesRes?.data,
    styles: stylesRes?.data,
    document: docRes?.data,
  };

  const outFile = path.join(outDir, 'tokens.raw.json');
  await fs.writeFile(outFile, JSON.stringify(raw, null, 2), 'utf-8');
  console.log(`Wrote ${outFile}`);

  // Write separate response bodies for quick inspection
  const varsFile = path.join(outDir, 'tokens.variables.raw.json');
  const stylesFile = path.join(outDir, 'tokens.styles.raw.json');
  const docFile = path.join(outDir, 'document.raw.json');
  await fs.writeFile(varsFile, JSON.stringify(variablesRes?.data ?? { error: 'no-response' }, null, 2), 'utf-8');
  await fs.writeFile(stylesFile, JSON.stringify(stylesRes?.data ?? { error: 'no-response' }, null, 2), 'utf-8');
  await fs.writeFile(docFile, JSON.stringify(docRes?.data ?? { error: 'no-response' }, null, 2), 'utf-8');

  // If we have a document, traverse to collect interesting node IDs and fetch their details
  let nodeDetails = {};
  if (docRes?.data?.document) {
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
      const nodesPath = `/files/${fileKey}/nodes?ids=${encodeURIComponent(batch.join(','))}`;
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
    `document: ${docRes ? docRes.status : 'no-response'}`,
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
