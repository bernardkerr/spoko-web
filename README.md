# Next.js Static Site Template

A modern, fully static Next.js site template featuring Three.js 3D graphics, Mermaid diagrams, Markdown documentation support, and beautiful UI components.

## ✨ Features

- **Next.js App Router** with static export for GitHub Pages
- **Tailwind CSS** with custom design tokens and dark mode
- **shadcn/ui** components (Button, Card, Tabs, Dialog, etc.)
- **Three.js integration** with React Three Fiber
- **Mermaid diagrams** with automatic theming
- **Markdown documentation** from Git submodules
- **Typography** with @tailwindcss/typography
- **GitHub Actions** deployment workflow

## 🚀 Quick Start

```bash
# Clone the repository
git clone <your-repo-url>
cd spoko-web

# Install dependencies
npm install

# Start development server
npm run dev
```

## 📁 Project Structure

```
app/                    # Next.js App Router pages
├── layout.js          # Root layout with navigation
├── page.js             # Home page
├── three/              # Three.js examples
├── mermaid/            # Mermaid diagram examples
└── docs/               # Documentation pages

components/             # React components
├── ui/                 # shadcn/ui components
├── Navbar.jsx          # Navigation header
├── ThemeToggle.jsx     # Dark/light mode toggle
├── ThreeCanvas.jsx     # Three.js canvas component
└── Mermaid.jsx         # Mermaid diagram renderer

lib/                    # Utility functions
├── utils.js            # Class name utilities
├── paths.js            # Base path helpers
└── markdown.js         # Markdown processing

styles/                 # Styling
└── globals.css         # Global styles and CSS variables

content-submodule/      # Git submodule for docs
├── getting-started.md  # Example documentation
├── deployment.md       # Deployment guide
└── images/             # Documentation images

.github/workflows/      # GitHub Actions
└── pages.yml           # Deployment workflow
```

## 🎨 Customization

### Theme Colors

Edit CSS variables in `styles/globals.css`:

```css
:root {
  --brand: 221 83% 53%;    /* Primary brand color */
  --bg: 0 0% 100%;         /* Background color */
  --fg: 222.2 84% 4.9%;    /* Foreground text color */
}

.dark {
  --brand: 221 83% 53%;    /* Brand color (same in dark) */
  --bg: 222.2 84% 4.9%;    /* Dark background */
  --fg: 210 40% 98%;       /* Light text on dark */
}
```

### Tailwind Configuration

Update `tailwind.config.js` to customize:

- Color palette
- Typography settings
- Component variants
- Responsive breakpoints

### Figma Integration

To export design tokens from Figma:

1. **Install Figma Plugins:**
   - [Figma Tokens](https://www.figma.com/community/plugin/843461159747178978/Figma-Tokens) - Export design tokens
   - [Tailwind CSS](https://www.figma.com/community/plugin/738806869514947558/Tailwind-CSS) - Generate Tailwind classes

2. **Export Process:**
   - Use Figma Tokens to export color, spacing, and typography tokens as JSON
   - Convert HSL values to CSS variables in `styles/globals.css`
   - Map tokens to Tailwind theme in `tailwind.config.js`

3. **Example Mapping:**
   ```javascript
   // tailwind.config.js
   theme: {
     extend: {
       colors: {
         brand: 'hsl(var(--brand))',
         background: 'hsl(var(--background))',
         foreground: 'hsl(var(--foreground))',
       }
     }
   }
   ```

## 📝 Adding Documentation

### Using Git Submodules

1. **Add your docs repository as a submodule:**
   ```bash
   git submodule add https://github.com/your-username/your-docs-repo.git content-submodule
   ```

2. **Structure your docs repository:**
   ```
   your-docs-repo/
   ├── getting-started.md
   ├── api-reference.md
   ├── guides/
   │   ├── installation.md
   │   └── configuration.md
   └── images/
       ├── diagram.png
       └── screenshot.jpg
   ```

3. **Markdown Features:**
   - **Frontmatter:** Add YAML metadata
     ```yaml
     ---
     title: Page Title
     description: Page description
     ---
     ```
   - **Mermaid Diagrams:** Use fenced code blocks
     ```markdown
     ```mermaid
     flowchart TD
         A[Start] --> B[End]
     ```
   - **Images:** Use relative paths
     ```markdown
     ![Diagram](images/diagram.png)
     ```

### Updating Documentation

```bash
# Update submodule to latest
git submodule update --remote

# Commit the update
git add content-submodule
git commit -m "Update documentation"
git push
```

## 🌐 Deployment

### GitHub Pages

1. **Enable GitHub Pages:**
   - Go to repository Settings → Pages
   - Set Source to "GitHub Actions"

2. **Base Path configuration:**
   This project uses `NEXT_PUBLIC_BASE_PATH` to configure the base path in production builds. For project pages, it should be `/<repo-name>`.
   - In CI (GitHub Actions), this is already set to `/spoko-web` in `.github/workflows/deploy-pages.yml`.
   - For local testing of an exported build, you can set `NEXT_PUBLIC_BASE_PATH` accordingly before `npm run build`.

3. **Deploy:**
   - Push to main branch
   - GitHub Actions will build and deploy automatically
   - Site will be available at `https://<username>.github.io/<repo-name>/`

### Other Platforms

The static export works with any hosting provider:

- **Netlify:** Drag and drop the `out/` folder
- **Vercel:** Connect your GitHub repository  
- **Cloudflare Pages:** Connect your repository
- **AWS S3:** Upload `out/` folder contents

## 🎯 Three.js Integration

### Features
- Interactive 3D scenes with orbit controls
- Configurable materials (solid/wireframe)
- Animation controls (spin/static)
- Full-screen viewer mode
- Responsive design

### Customizing 3D Content

Edit `components/ThreeCanvas.jsx`:

```javascript
// Add new 3D objects
function CustomMesh() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="hotpink" />
    </mesh>
  )
}

// Use in scene
<Canvas>
  <CustomMesh />
  <OrbitControls />
</Canvas>
```

## 📊 Mermaid Theming

The Mermaid component automatically adapts to your theme:

### Theme Variables
```javascript
// Automatically uses CSS variables
themeVariables: {
  primaryColor: 'hsl(var(--brand))',
  primaryTextColor: 'hsl(var(--fg))',
  background: 'hsl(var(--bg))',
  // ... more variables
}
```

### Custom Mermaid Themes
To customize Mermaid appearance, edit `components/Mermaid.jsx`:

```javascript
mermaid.initialize({
  theme: 'base',
  themeVariables: {
    primaryColor: '#your-color',
    primaryTextColor: '#your-text-color',
    // Add more customizations
  }
})
```

## 🛠 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production (exports static site to ./out in prod)
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

### Adding New Components

1. **shadcn/ui components:**
   ```bash
   # Components are included as source files
   # Edit files in components/ui/ directly
   ```

2. **Custom components:**
   ```javascript
   // components/MyComponent.jsx
   import { cn } from '@/lib/utils'
   
   export function MyComponent({ className, ...props }) {
     return (
       <div className={cn('my-styles', className)} {...props}>
         Content
       </div>
     )
   }
   ```

## 📦 Dependencies

### Core
- Next.js 14+ (App Router)
- React 18+
- Tailwind CSS 3+

### UI & Styling
- @tailwindcss/typography
- Radix UI primitives
- Lucide React (icons)
- clsx + tailwind-merge

### 3D Graphics
- Three.js
- @react-three/fiber
- @react-three/drei

### Documentation
- Mermaid
- remark + rehype
- gray-matter

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally with `npm run dev`
5. Build and test export with `npm run export`
6. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🔗 Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Three.js](https://threejs.org)
- [Mermaid](https://mermaid.js.org)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
