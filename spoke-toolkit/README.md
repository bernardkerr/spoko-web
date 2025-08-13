# Spoke Toolkit (Figma → ShadCN)

A small toolkit to extract tokens from a Figma file via the Figma REST API, transform them into ShadCN-ready outputs for developers, and import them into a Figma Library ("Spoke Toolkit") for designers.

## Overview

Pipeline:
- Fetch from Figma REST (Variables, Styles) → `out/tokens.raw.json`
- Transform into:
  - Dev outputs: `out/globals.css`, `out/tailwind.extend.json`
  - Figma plugin input: `out/tokens.for-figma.json`
- Run the included Figma plugin to import tokens and build/update the Spoke Toolkit Library inside Figma.

## Prerequisites

- Node.js 18+
- Figma Personal Access Token (PAT)
- Figma file key for the source file (the reference design file you currently have)
- Optional: Figma Desktop app (for plugin development/testing)

## Quick Start

1) Copy `.env.example` → `.env` and fill in values:
```
FIGMA_PAT=YOUR_TOKEN
FIGMA_FILE_KEY=YOUR_FILE_KEY
FIGMA_TEAM_ID=optional_team_id
```

2) Install dependencies:
```
npm install
```

3) Fetch tokens from Figma:
```
npm run fetch
```
This creates `out/tokens.raw.json` (variables, styles metadata).

4) Transform to ShadCN + Figma inputs:
```
npm run transform
```
This creates:
- `out/globals.css`
- `out/tailwind.extend.json`
- `out/tokens.for-figma.json`

5) Import into Figma:
- Open a Figma file that will be your Spoke Toolkit Library.
- Run the "Spoke Toolkit Builder" plugin (from this repo).
- Choose `out/tokens.for-figma.json` to import.
- The plugin will create Variables, Styles, and optional example components.
- Publish the Library in Figma so designers can use it.

## Commands

- `npm run fetch` — Calls Figma REST to get Variables and Styles and writes `out/tokens.raw.json`.
- `npm run transform` — Normalizes and maps tokens to ShadCN CSS vars/Tailwind and builds `tokens.for-figma.json`.
- `npm run clean` — Removes generated outputs.

## Configuration

- `src/config/map.config.json` — mapping from normalized tokens to ShadCN theme variables and Tailwind `theme.extend`.
  - Colors → `--background`, `--foreground`, `--primary`, `--ring`, etc.
  - Radii → `--radius` and Tailwind `borderRadius`.
  - Typography → Tailwind `fontFamily`, `fontSize`.
  - Optional: shadows, spacing.

## Outputs

- `out/globals.css` — drop into your app (e.g., Next.js) to define ShadCN variables.
- `out/tailwind.extend.json` — merge into `tailwind.config.js` under `theme.extend`.
- `out/tokens.for-figma.json` — feed to the Figma plugin to materialize Variables/Styles.

## Light/Dark Modes

- The transformer supports mode-aware variables if the source file uses Figma Variable modes.
- CSS output will emit `:root` and `[data-theme="dark"]` sections when applicable.

## Updating Tokens

When your “real” Figma file arrives:
- Update `FIGMA_FILE_KEY` in `.env`.
- Re-run `npm run fetch && npm run transform`.
- Re-run the plugin to update the Library.

## Troubleshooting

- 401/403 from Figma: verify PAT and file access.
- Empty variables: confirm the source file actually uses Figma Variables.
- Styles missing details: not all style data lives in `/styles`; the fetcher may pull nodes on demand.

## Contributing

- Keep token names consistent and mode-aware.
- Extend `map.config.json` when introducing new token categories.
- PRs should update this README if behavior changes.
