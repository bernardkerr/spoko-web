# Spoko Web – Static Next.js Site

A modern static website built with Next.js (App Router), MDX/Markdown content, Mermaid diagram generation, and a lightweight design tokens pipeline.

## ✨ Highlights

- **Static export** for GitHub Pages and static hosts
- **MDX + Markdown** content from `content/` and `content-submodule/`
- **Mermaid** diagram generation to static SVGs
- **Design tokens** via local JSON exports → CSS custom properties
- **Radix Themes + Tailwind-compatible CSS**

## 🚀 Quick Start

```bash
# Install
npm install

# Develop
npm run dev  # http://localhost:3000

# Production build (static export)
npm run build
```

## 📁 Project Structure

```
app/                     # Next.js App Router pages
components/              # UI components
content/                 # Local markdown/mdx content 
content-submodule/       # Submodules for docs 
figma/exports/           # Local JSON token exports input for ingestion
lib/                     # Utilities (markdown, paths, mdx)
public/                  # Static assets
scripts/                 # Build helpers & generators
styles/                  # Global styles + generated token CSS
```

## 📝 Content Model

- Markdown/MDX is read from `content/` and `content-submodule/` with preference for `content/`.
- Raw HTML in markdown is allowed (see `lib/markdown.js`).
- Internal links are made basePath‑aware at render time.

## 🧩 Mermaid Diagrams

- Source markdown can include Mermaid code blocks.
- `npm run diagrams:generate` renders static SVGs into `public/diagrams/` for reliable static hosting.

## 🎨 Design Tokens – Ingestion Flow

Token ingestion converts local JSON exports into CSS variables used by the site.

- Source: `figma/exports/*.json`
- Script: `scripts/ingest_figma_exports.js`
- Output: `styles/figma-tokens.css` containing `:root { --<collection>-<var-name>: value; }`
- Mode selection: set `FIGMA_EXPORT_MODE="<Mode Name>"` to choose a specific mode; first mode is used by default.
- Supported inputs:
  - Figma Variables collection export shape with `variables`, `modes`, `valuesByMode`, and `resolvedValuesByMode`.
  - Simple tokens map object: `{ "themeA": { "colorsAccentAccent1": "#fff", ... }, "themeB": { ... } }`.

Run manually:

```bash
FIGMA_EXPORT_MODE="Light" npm run figma:ingest
# writes styles/figma-tokens.css
```

Note: The generated CSS file is committed to the repo and can be imported by your styles.

## 🛠 Available npm scripts

```bash
# Development
npm run dev             # Sync content images, start Next dev on port 3000

# Build & serve
npm run build           # Next build (exports static site in production config)
npm run start           # Start Next server (useful without static export)
npm run serve:static    # Serve ./out locally on port 5054 (after build)

# Linting
npm run lint            # Run ESLint

# Prebuild hooks
npm run prebuild        # Generate static diagram SVGs + sync content images (runs automatically before build)

# Assets & diagrams
npm run sync:images     # Copy images from content repos into public/content/images
npm run diagrams:generate # Generate static Mermaid SVGs into public/diagrams

# Tokens
npm run tokens:inspect  # Inspect parsed token exports (debug tooling)
npm run tokens:usage    # Analyze where tokens are referenced in the codebase
npm run figma:ingest    # Ingest local figma/exports/*.json → styles/figma-tokens.css

# Figma utilities (optional)
npm run figma:fetch     # Fetch design assets/tokens (requires env config)
npm run figma:react     # Generate React stubs from design nodes (experimental)
```

## 🌐 Deployment

The project is configured for static export when `NODE_ENV=production`:

- `next.config.mjs` sets `output: 'export'`, `trailingSlash: true`, and unoptimized images for static hosts.
- Configure base path for GitHub Pages via env: `NEXT_PUBLIC_BASE_PATH=/spoko-web`.
- Build outputs to `out/`.

Steps:

1. Set env if deploying to project pages (e.g., `/spoko-web`).
2. `npm run build`
3. Deploy the `out/` directory to your static host.

GitHub Pages
- The repo includes a workflow in `.github/workflows/deploy-pages.yml` that sets `NEXT_PUBLIC_BASE_PATH` and deploys automatically on push to main.

## 📦 Tech Stack

- Next.js 15, React 19
- MDX + remark/rehype plugins
- Mermaid 11 (static SVG generation)
- Radix Themes

## 🤝 Contributing

- Branch from main, make changes, and test with `npm run dev`.
- Build locally before PRs to verify static export.

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Radix Themes Documentation](https://www.radix-ui.com/themes)
- [Mermaid Documentation](https://mermaid.js.org)
- [MDX Documentation](https://mdxjs.com)
- [Figma Design File](https://www.figma.com/community/file/1280428825266545105)
- [Figma Variables to JSON](https://www.figma.com/community/plugin/1345399750040406570)

## 📄 License

MIT License.
