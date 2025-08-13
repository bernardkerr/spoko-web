import fs from 'fs/promises';
import path from 'path';
import { loadRawTokens, normalize } from './normalize.js';

function toCss(vars, selector = ':root') {
  const lines = Object.entries(vars).map(([k, v]) => `  ${k}: ${v};`);
  return `${selector} {\n${lines.join('\n')}\n}`;
}

async function readMapConfig() {
  const p = path.resolve(process.cwd(), 'src', 'config', 'map.config.json');
  const txt = await fs.readFile(p, 'utf-8');
  return JSON.parse(txt);
}

function applyMapping(norm, map, inferred) {
  const cssVars = {};

  const defaults = {
    '--background': '0 0% 100%',
    '--foreground': '222.2 84% 4.9%',
    '--card': '0 0% 100%',
    '--card-foreground': '222.2 84% 4.9%',
    '--popover': '0 0% 100%',
    '--popover-foreground': '222.2 84% 4.9%',
    '--primary': '222.2 47.4% 11.2%',
    '--primary-foreground': '210 40% 98%',
    '--secondary': '210 40% 96.1%',
    '--secondary-foreground': '222.2 47.4% 11.2%',
    '--muted': '210 40% 96.1%',
    '--muted-foreground': '215.4 16.3% 46.9%',
    '--accent': '210 40% 96.1%',
    '--accent-foreground': '222.2 47.4% 11.2%',
    '--destructive': '0 84.2% 60.2%',
    '--destructive-foreground': '210 40% 98%',
    '--border': '214.3 31.8% 91.4%',
    '--input': '214.3 31.8% 91.4%',
    '--ring': '215 20.2% 65.1%',
    '--radius': '0.5rem'
  };

  Object.assign(cssVars, defaults);

  const tailwindExtend = {
    colors: {
      border: `hsl(var(--border))`,
      input: `hsl(var(--input))`,
      ring: `hsl(var(--ring))`,
      background: `hsl(var(--background))`,
      foreground: `hsl(var(--foreground))`,
      primary: {
        DEFAULT: `hsl(var(--primary))`,
        foreground: `hsl(var(--primary-foreground))`,
      },
      secondary: {
        DEFAULT: `hsl(var(--secondary))`,
        foreground: `hsl(var(--secondary-foreground))`,
      },
      destructive: {
        DEFAULT: `hsl(var(--destructive))`,
        foreground: `hsl(var(--destructive-foreground))`,
      },
      muted: {
        DEFAULT: `hsl(var(--muted))`,
        foreground: `hsl(var(--muted-foreground))`,
      },
      accent: {
        DEFAULT: `hsl(var(--accent))`,
        foreground: `hsl(var(--accent-foreground))`,
      },
      popover: {
        DEFAULT: `hsl(var(--popover))`,
        foreground: `hsl(var(--popover-foreground))`,
      },
      card: {
        DEFAULT: `hsl(var(--card))`,
        foreground: `hsl(var(--card-foreground))`,
      },
    },
    borderRadius: {
      lg: 'var(--radius)',
      md: 'calc(var(--radius) - 2px)',
      sm: 'calc(var(--radius) - 4px)'
    }
  };

  // Merge inferred tokens if available
  if (inferred) {
    if (inferred.shadcnVars && typeof inferred.shadcnVars === 'object') {
      Object.assign(cssVars, inferred.shadcnVars);
    }
    if (inferred.tailwind && typeof inferred.tailwind === 'object') {
      // Merge fontFamily/fontSize if provided
      if (inferred.tailwind.fontFamily) {
        tailwindExtend.fontFamily = {
          ...(tailwindExtend.fontFamily || {}),
          ...inferred.tailwind.fontFamily,
        };
      }
      if (inferred.tailwind.fontSize) {
        tailwindExtend.fontSize = {
          ...(tailwindExtend.fontSize || {}),
          ...inferred.tailwind.fontSize,
        };
      }
    }
  }

  return { cssVars, tailwindExtend };
}

async function writeOutputs(cssVars, tailwindExtend, hasDark = false) {
  const outDir = path.resolve(process.cwd(), 'out');
  await fs.mkdir(outDir, { recursive: true });

  const cssSelector = ':root';
  let css = toCss(cssVars, cssSelector);

  if (hasDark) {
    const dark = { ...cssVars };
    css += `\n\n` + toCss(dark, '[data-theme="dark"]');
  }

  const cssFile = path.join(outDir, 'globals.css');
  await fs.writeFile(cssFile, css, 'utf-8');

  const twFile = path.join(outDir, 'tailwind.extend.json');
  await fs.writeFile(twFile, JSON.stringify(tailwindExtend, null, 2), 'utf-8');

  const figmaTokens = {
    version: 1,
    collections: [
      {
        name: 'Spoke',
        modes: hasDark ? ['light', 'dark'] : ['light'],
        tokens: cssVars,
      }
    ]
  };
  const figmaFile = path.join(outDir, 'tokens.for-figma.json');
  await fs.writeFile(figmaFile, JSON.stringify(figmaTokens, null, 2), 'utf-8');

  console.log('Wrote outputs:');
  console.log(' -', cssFile);
  console.log(' -', twFile);
  console.log(' -', figmaFile);
}

async function writeOutputsToDir(targetDir, cssVars, tailwindExtend, hasDark = false) {
  await fs.mkdir(targetDir, { recursive: true });

  const cssSelector = ':root';
  let css = toCss(cssVars, cssSelector);
  if (hasDark) {
    const dark = { ...cssVars };
    css += `\n\n` + toCss(dark, '[data-theme="dark"]');
  }

  const cssFile = path.join(targetDir, 'globals.css');
  await fs.writeFile(cssFile, css, 'utf-8');

  const twFile = path.join(targetDir, 'tailwind.extend.json');
  await fs.writeFile(twFile, JSON.stringify(tailwindExtend, null, 2), 'utf-8');

  const figmaTokens = {
    version: 1,
    collections: [
      { name: 'Spoke', modes: hasDark ? ['light','dark'] : ['light'], tokens: cssVars }
    ]
  };
  const figmaFile = path.join(targetDir, 'tokens.for-figma.json');
  await fs.writeFile(figmaFile, JSON.stringify(figmaTokens, null, 2), 'utf-8');
}

async function main() {
  const raw = await loadRawTokens();
  const norm = await normalize(raw);
  const map = await readMapConfig();

  // Load inferred tokens if present
  let inferred;
  try {
    const inferredPath = path.resolve(process.cwd(), 'out', 'inferred.tokens.json');
    const txt = await fs.readFile(inferredPath, 'utf-8');
    inferred = JSON.parse(txt);
  } catch (_) {
    inferred = undefined;
  }

  const { cssVars, tailwindExtend } = applyMapping(norm, map, inferred);
  await writeOutputs(cssVars, tailwindExtend, (norm.modes || []).includes('dark'));

  // Per-frame themed outputs if available
  try {
    const byFramePath = path.resolve(process.cwd(), 'out', 'inferred.by-frame.json');
    const txt = await fs.readFile(byFramePath, 'utf-8');
    const byFrame = JSON.parse(txt);
    const baseOut = path.resolve(process.cwd(), 'out', 'themes');
    await fs.mkdir(baseOut, { recursive: true });
    const hasDark = (norm.modes || []).includes('dark');
    for (const slug of Object.keys(byFrame)) {
      const frame = byFrame[slug];
      const frameDir = path.join(baseOut, slug);
      // Merge global cssVars with frame overrides
      const frameVars = { ...cssVars, ...(frame.shadcnVars || {}) };
      const frameTw = { ...tailwindExtend };
      if (frame.tailwind) {
        if (frame.tailwind.fontFamily) {
          frameTw.fontFamily = { ...(frameTw.fontFamily || {}), ...frame.tailwind.fontFamily };
        }
        if (frame.tailwind.fontSize) {
          frameTw.fontSize = { ...(frameTw.fontSize || {}), ...frame.tailwind.fontSize };
        }
        if (frame.tailwind.spacing) {
          frameTw.spacing = { ...(frameTw.spacing || {}), ...frame.tailwind.spacing };
        }
      }
      await writeOutputsToDir(frameDir, frameVars, frameTw, hasDark);
    }
    console.log('Wrote per-frame themed outputs to out/themes/');
  } catch (_) {
    // no per-frame data; skip
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
