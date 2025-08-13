import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function toHslStr({ r, g, b }) {
  // r,g,b in 0..1 -> h in 0..360, s,l in 0..100
  const R = r, G = g, B = b;
  const max = Math.max(R, G, B), min = Math.min(R, G, B);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case R: h = (G - B) / d + (G < B ? 6 : 0); break;
      case G: h = (B - R) / d + 2; break;
      case B: h = (R - G) / d + 4; break;
    }
    h = h / 6;
  }
  const H = Math.round(h * 360);
  const S = Math.round(s * 1000) / 10;
  const L = Math.round(l * 1000) / 10;
  return `${H} ${S}% ${L}%`;
}

function parseHsl(hslStr) {
  // "H S% L%" -> {h,s,l}
  if (!hslStr) return null;
  const m = String(hslStr).match(/^(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%$/);
  if (!m) return null;
  return { h: parseFloat(m[1]), s: parseFloat(m[2]), l: parseFloat(m[3]) };
}

function chooseReadableForeground(bgHslStr) {
  const p = parseHsl(bgHslStr);
  if (!p) return '0 0% 100%';
  // Simple heuristic: light backgrounds -> dark text, dark backgrounds -> white text
  return p.l >= 60 ? '222.2 84% 4.9%' : '0 0% 100%';
}

function collectColorsFromFills(fills) {
  const colors = [];
  if (!Array.isArray(fills)) return colors;
  for (const f of fills) {
    if (f?.type === 'SOLID' && f?.visible !== false && f?.color) {
      colors.push(toHslStr(f.color));
    }
  }
  return colors;
}

function pxToRem(px, base = 16) {
  return `${Math.round((px / base) * 100) / 100}rem`;
}

function clusterSizes(values, tolerance = 1) {
  // Cluster numeric values by closeness within tolerance (px)
  const sorted = values.slice().sort((a, b) => b - a); // desc for headings
  const clusters = [];
  for (const v of sorted) {
    let placed = false;
    for (const c of clusters) {
      if (Math.abs(c.center - v) <= tolerance) {
        c.items.push(v);
        c.center = c.items.reduce((s, x) => s + x, 0) / c.items.length;
        placed = true;
        break;
      }
    }
    if (!placed) clusters.push({ center: v, items: [v] });
  }
  return clusters.sort((a, b) => b.center - a.center);
}

function slugify(name) {
  return (
    String(name || 'theme')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'theme'
  );
}

function matchAnyRegex(name, patterns) {
  if (!patterns || !patterns.length) return true;
  return patterns.some((p) => {
    try { return new RegExp(p, 'i').test(name); } catch { return false; }
  });
}

async function main() {
  const outDir = path.resolve(process.cwd(), 'out');
  const nodesPath = path.join(outDir, 'nodes.details.raw.json');
  const docPath = path.join(outDir, 'document.raw.json');

  const nodesText = await fs.readFile(nodesPath, 'utf-8').catch(() => '{}');
  const docText = await fs.readFile(docPath, 'utf-8').catch(() => '{}');
  const nodes = JSON.parse(nodesText || '{}');
  const doc = JSON.parse(docText || '{}');

  // Build a map of frame -> descendant ids using document tree
  const includePatterns = process.env.INFER_INCLUDE_FRAMES
    ? String(process.env.INFER_INCLUDE_FRAMES)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const frameDescendants = new Map(); // id -> {name, ids:Set}
  const allIncludeIds = new Set();
  if (doc?.document?.children) {
    // Figma: root children are CANVAS (pages). Frames under these are top-level page frames.
    const canvases = doc.document.children || [];
    for (const canvas of canvases) {
      const stack = Array.isArray(canvas.children) ? canvas.children.slice() : [];
      for (const child of stack) {
        if (!child) continue;
        // Only consider FRAME at top level under canvas as page style
        if (child.type === 'FRAME' && child.id && matchAnyRegex(child.name || '', includePatterns)) {
          const ids = new Set();
          // Traverse this frame to collect all descendant ids
          const st = [child];
          while (st.length) {
            const n = st.pop();
            if (!n) continue;
            if (n.id) ids.add(n.id);
            if (Array.isArray(n.children)) for (const c of n.children) st.push(c);
          }
          frameDescendants.set(child.id, { name: child.name || child.id, ids });
          for (const id of ids) allIncludeIds.add(id);
        }
      }
    }
  }

  // If no frames found, fall back to all nodes (previous behavior)
  const hasFrames = frameDescendants.size > 0;

  // Frequency maps
  const textStyles = new Map(); // key: family|weight|size|lineHeight -> count
  const textColors = new Map(); // hsl -> count
  const fillsColors = new Map(); // hsl -> area-weighted count
  let radiusSamples = [];
  const fontFamilies = new Map();
  const fontSizes = new Map();
  const gaps = new Map(); // itemSpacing
  const paddings = new Map(); // padding values
  const candidateButtons = []; // {fill, textColor}
  const candidateCards = []; // {fill}

  const count = (map, key, inc = 1) => map.set(key, (map.get(key) || 0) + inc);

  const processNodeSet = (idSet) => {
    // frequency maps for a subset
    const textStyles = new Map();
    const textColors = new Map();
    const fillsColors = new Map();
    let radiusSamples = [];
    const fontFamilies = new Map();
    const fontSizes = new Map();
    const gaps = new Map();
    const paddings = new Map();
    const candidateButtons = [];
    const candidateCards = [];

    const count = (map, key, inc = 1) => map.set(key, (map.get(key) || 0) + inc);

    for (const nodeId of Object.keys(nodes)) {
      if (idSet && !idSet.has(nodeId)) continue;
      const n = nodes[nodeId]?.document;
      if (!n) continue;
      const bbox = n.absoluteBoundingBox || { width: 0, height: 0 };
      const area = (bbox.width || 0) * (bbox.height || 0);

      if (n.type === 'TEXT') {
        const style = n.style || {};
        const family = style.fontFamily || 'sans';
        const weight = style.fontWeight || style.fontPostScriptName || 'normal';
        const size = style.fontSize || 16;
        const lh = typeof style.lineHeightPx === 'number' ? style.lineHeightPx : undefined;
        const key = `${family}|${weight}|${size}|${lh ?? ''}`;
        count(textStyles, key);
        count(fontFamilies, family);
        count(fontSizes, String(size));

        const colors = collectColorsFromFills(n.fills);
        for (const c of colors) count(textColors, c);
      }

      if (['RECTANGLE','FRAME','COMPONENT','INSTANCE'].includes(n.type)) {
        const colors = collectColorsFromFills(n.fills);
        for (const c of colors) count(fillsColors, c, Math.max(1, Math.round(area)));

        if (typeof n.cornerRadius === 'number') {
          radiusSamples.push(n.cornerRadius);
        } else if (Array.isArray(n.rectangleCornerRadii)) {
          for (const r of n.rectangleCornerRadii) if (typeof r === 'number') radiusSamples.push(r);
        }

        if (n.layoutMode && typeof n.itemSpacing === 'number') {
          count(gaps, String(Math.round(n.itemSpacing)));
        }
        const pads = [n.paddingLeft, n.paddingRight, n.paddingTop, n.paddingBottom].filter(v => typeof v === 'number');
        for (const p of pads) count(paddings, String(Math.round(p)));

        const hasTextChild = Array.isArray(n.children) && n.children.some(c => c.type === 'TEXT');
        const hasSolidFill = colors.length > 0;
        if (hasSolidFill && hasTextChild && (n.type === 'COMPONENT' || n.type === 'INSTANCE' || (n.layoutMode && n.cornerRadius))) {
          let tColor;
          const textChild = (n.children || []).find(c => c.type === 'TEXT');
          if (textChild) {
            const tColors = collectColorsFromFills(textChild.fills);
            tColor = tColors[0];
          }
          candidateButtons.push({ fill: colors[0], text: tColor });
        }
        if (n.type === 'FRAME' && !hasTextChild && colors.length) {
          candidateCards.push({ fill: colors[0] });
        }
      }
    }

    const top = (map) => Array.from(map.entries()).sort((a,b) => b[1]-a[1]);

    const topTextColor = top(textColors)[0]?.[0];
    const topFillColor = top(fillsColors)[0]?.[0];

    const shadcnVars = {};
    if (topFillColor) shadcnVars['--background'] = topFillColor;
    if (topTextColor) shadcnVars['--foreground'] = topTextColor;

    const altFill = top(fillsColors).find(([c]) => c !== topFillColor)?.[0];
    if (altFill) {
      shadcnVars['--primary'] = altFill;
      shadcnVars['--primary-foreground'] = chooseReadableForeground(altFill);
    }

    if (candidateButtons.length) {
      const freqByFill = new Map();
      for (const b of candidateButtons) count(freqByFill, b.fill || '');
      const mostBtnFill = top(freqByFill)[0]?.[0];
      if (mostBtnFill) {
        shadcnVars['--primary'] = mostBtnFill;
        const sampleBtn = candidateButtons.find(b => b.fill === mostBtnFill);
        shadcnVars['--primary-foreground'] = sampleBtn?.text || chooseReadableForeground(mostBtnFill);
      }
    }

    if (candidateCards.length) {
      const freqCard = new Map();
      for (const c of candidateCards) count(freqCard, c.fill || '');
      const cardFill = top(freqCard)[0]?.[0];
      if (cardFill) {
        shadcnVars['--card'] = cardFill;
        shadcnVars['--card-foreground'] = chooseReadableForeground(cardFill);
        shadcnVars['--popover'] = cardFill;
        shadcnVars['--popover-foreground'] = chooseReadableForeground(cardFill);
      }
    }

    if (radiusSamples.length) {
      const sorted = radiusSamples.slice().sort((a,b)=>a-b);
      const med = sorted[Math.floor(sorted.length/2)];
      const px = clamp(med, 2, 16);
      const rem = Math.round((px/16)*100)/100;
      shadcnVars['--radius'] = `${rem}rem`;
    }

    const tw = { fontFamily: {}, fontSize: {}, spacing: {} };
    const topFamily = top(fontFamilies)[0]?.[0];
    if (topFamily) tw.fontFamily['sans'] = [topFamily, 'sans-serif'];

    const allSizes = Array.from(fontSizes.keys()).map(Number);
    const clusters = clusterSizes(allSizes, 1);
    const headingMap = ['h1','h2','h3','h4','h5','h6'];
    for (let i = 0; i < Math.min(headingMap.length, clusters.length); i++) {
      const px = Math.round(clusters[i].center);
      tw.fontSize[headingMap[i]] = `${px}px`;
    }
    const sizesAsc = allSizes.slice().sort((a,b)=>a-b);
    const named = ['sm','base','lg','xl','2xl','3xl'];
    for (let i=0; i<sizesAsc.length && i<named.length; i++) {
      tw.fontSize[named[i]] = `${sizesAsc[i]}px`;
    }

    const spacingVals = Array.from(new Set([
      ...Array.from(gaps.keys()).map(Number),
      ...Array.from(paddings.keys()).map(Number)
    ])).filter(n=>n>0).sort((a,b)=>a-b);
    const spacingNames = ['1','2','3','4','5','6','7','8','9','10'];
    for (let i=0; i<Math.min(spacingVals.length, spacingNames.length); i++) {
      tw.spacing[spacingNames[i]] = pxToRem(spacingVals[i]);
    }

    return {
      shadcnVars,
      tailwind: tw,
      meta: {
        headingClusters: clusters.map(c => Math.round(c.center)),
      }
    };
  };

  // Build outputs: global and per-frame
  const byFrame = {};
  for (const [fid, info] of frameDescendants.entries()) {
    const analyzed = processNodeSet(info.ids);
    const key = slugify(info.name);
    byFrame[key] = { name: info.name, ...analyzed };
  }

  const globalAnalyzed = processNodeSet(hasFrames ? allIncludeIds : undefined);
  

  const top = (map) => Array.from(map.entries()).sort((a,b) => b[1]-a[1]);

  const topTextColor = top(textColors)[0]?.[0];
  const topFillColor = top(fillsColors)[0]?.[0];

  // Heuristic: background from largest fills color; foreground from most common text color.
  const shadcnVars = {};
  if (topFillColor) shadcnVars['--background'] = topFillColor;
  if (topTextColor) shadcnVars['--foreground'] = topTextColor;

  // Pick another color as primary if available
  const altFill = top(fillsColors).find(([c]) => c !== topFillColor)?.[0];
  if (altFill) {
    shadcnVars['--primary'] = altFill;
    // Choose readable foreground vs primary
    shadcnVars['--primary-foreground'] = chooseReadableForeground(altFill);
  }

  // If we detected button candidates, prefer their fill/text for primary pair
  if (candidateButtons.length) {
    const freqByFill = new Map();
    for (const b of candidateButtons) count(freqByFill, b.fill || '');
    const mostBtnFill = top(freqByFill)[0]?.[0];
    if (mostBtnFill) {
      shadcnVars['--primary'] = mostBtnFill;
      const sampleBtn = candidateButtons.find(b => b.fill === mostBtnFill);
      shadcnVars['--primary-foreground'] = sampleBtn?.text || chooseReadableForeground(mostBtnFill);
    }
  }

  // Card/background pairs from frames without text
  if (candidateCards.length) {
    const freqCard = new Map();
    for (const c of candidateCards) count(freqCard, c.fill || '');
    const cardFill = top(freqCard)[0]?.[0];
    if (cardFill) {
      shadcnVars['--card'] = cardFill;
      shadcnVars['--card-foreground'] = chooseReadableForeground(cardFill);
      // Use popover same as card by default
      shadcnVars['--popover'] = cardFill;
      shadcnVars['--popover-foreground'] = chooseReadableForeground(cardFill);
    }
  }

  // Radius: median of samples, clamp between 2 and 16 px, convert to rem assuming 16px root
  if (radiusSamples.length) {
    const sorted = radiusSamples.slice().sort((a,b)=>a-b);
    const med = sorted[Math.floor(sorted.length/2)];
    const px = clamp(med, 2, 16);
    const rem = Math.round((px/16)*100)/100;
    shadcnVars['--radius'] = `${rem}rem`;
  }

  // Tailwind font family: most common family
  const tw = { fontFamily: {}, fontSize: {}, spacing: {} };
  const topFamily = top(fontFamilies)[0]?.[0];
  if (topFamily) tw.fontFamily['sans'] = [topFamily, 'sans-serif'];

  // Font sizes: cluster and map to heading levels and scale
  const allSizes = Array.from(fontSizes.keys()).map(Number);
  const clusters = clusterSizes(allSizes, 1);
  const headingMap = ['h1','h2','h3','h4','h5','h6'];
  for (let i = 0; i < Math.min(headingMap.length, clusters.length); i++) {
    const px = Math.round(clusters[i].center);
    tw.fontSize[headingMap[i]] = `${px}px`;
  }
  // General size scale from smallest upwards
  const sizesAsc = allSizes.slice().sort((a,b)=>a-b);
  const named = ['sm','base','lg','xl','2xl','3xl'];
  for (let i=0; i<sizesAsc.length && i<named.length; i++) {
    tw.fontSize[named[i]] = `${sizesAsc[i]}px`;
  }

  // Spacing scale from gaps and paddings
  const spacingVals = Array.from(new Set([
    ...Array.from(gaps.keys()).map(Number),
    ...Array.from(paddings.keys()).map(Number)
  ])).filter(n=>n>0).sort((a,b)=>a-b);
  const spacingNames = ['1','2','3','4','5','6','7','8','9','10'];
  for (let i=0; i<Math.min(spacingVals.length, spacingNames.length); i++) {
    tw.spacing[spacingNames[i]] = pxToRem(spacingVals[i]);
  }

  // Write global
  const outFile = path.join(outDir, 'inferred.tokens.json');
  await fs.writeFile(outFile, JSON.stringify(globalAnalyzed, null, 2), 'utf-8');
  // Write by-frame
  const byFrameFile = path.join(outDir, 'inferred.by-frame.json');
  await fs.writeFile(byFrameFile, JSON.stringify(byFrame, null, 2), 'utf-8');
  console.log(`Wrote ${outFile}`);
  console.log(`Wrote ${byFrameFile}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
