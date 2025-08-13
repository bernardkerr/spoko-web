import 'dotenv/config';
import axios from 'axios';

const FIGMA_API = 'https://api.figma.com/v1';

function client() {
  const pat = process.env.FIGMA_PAT;
  if (!pat) throw new Error('Missing FIGMA_PAT');
  return axios.create({
    baseURL: FIGMA_API,
    headers: { 'X-Figma-Token': pat },
    validateStatus: () => true,
  });
}

async function main() {
  const fileKey = process.env.FIGMA_FILE_KEY;
  if (!fileKey) throw new Error('Missing FIGMA_FILE_KEY');
  const c = client();

  const steps = [
    { name: 'me', path: '/me' },
    { name: 'file', path: `/files/${fileKey}` },
    { name: 'variables', path: `/files/${fileKey}/variables` },
    { name: 'styles', path: `/files/${fileKey}/styles` },
  ];

  for (const s of steps) {
    try {
      const r = await c.get(s.path);
      console.log(`${s.name.toUpperCase()}: status ${r.status}`);
      if (r.status >= 400) {
        console.log(JSON.stringify(r.data, null, 2));
      }
    } catch (e) {
      console.log(`${s.name.toUpperCase()}: ERROR ${e?.message || e}`);
    }
  }

  console.log('\nDiagnostics hints:');
  console.log('- 401/403: check PAT scopes (files:read) and that PAT user has access to the file.');
  console.log('- 404 on variables: file may not use Variables or endpoint unavailable for the file.');
  console.log('- Ensure FILE KEY is from the Figma URL (after /file/).');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
