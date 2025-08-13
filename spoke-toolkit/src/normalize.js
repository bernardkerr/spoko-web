import fs from 'fs/promises';
import path from 'path';

export async function loadRawTokens() {
  const inFile = path.resolve(process.cwd(), 'out', 'tokens.raw.json');
  const buf = await fs.readFile(inFile, 'utf-8');
  return JSON.parse(buf);
}

export async function normalize(raw) {
  const modes = [];
  // TODO: parse raw.variables.variableCollections/modes when available
  return {
    colors: {},
    typography: {},
    radii: {},
    spacing: {},
    shadows: {},
    modes,
  };
}
