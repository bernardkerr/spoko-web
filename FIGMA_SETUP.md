# Figma Integration Setup Guide

This guide will help you set up Figma integration for your Next.js site to sync design tokens, generate components, and manage content.

## 🚀 Quick Start

### 1. Get Your Figma Access Token

1. Go to [Figma Settings > Personal Access Tokens](https://www.figma.com/developers/api#access-tokens)
2. Click "Create new token"
3. Give it a descriptive name (e.g., "Spoko Web Integration")
4. Copy the token (you won't see it again!)

### 2. Get Your Figma File Key

1. Open your Figma file
2. Look at the URL: `https://www.figma.com/file/FILE_KEY/File-Name`
3. Copy the `FILE_KEY` part

### 3. Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env.local

# Edit .env.local and add your credentials
FIGMA_ACCESS_TOKEN=your_figma_access_token_here
FIGMA_FILE_KEY=your_figma_file_key_here
```

### 4. Test the Integration

```bash
# Sync design tokens from Figma
npm run figma:tokens

# View the design system
npm run dev
# Then visit http://localhost:3000/figma
```

## 📚 Available Commands

### Design Tokens
```bash
# Sync colors, typography, spacing, and effects
npm run figma:tokens
```
This generates:
- `tailwind.figma.js` - Tailwind config with your Figma tokens
- `styles/figma-tokens.css` - CSS custom properties

### Components
```bash
# Sync specific components (requires component node IDs)
npm run figma:components 123:456 789:012
```
This generates React components in `components/figma/`

### Content
```bash
# Sync text content (requires text node IDs)
npm run figma:content 345:678 901:234
```
This generates `content/figma-content.json` with your text content

### Full Sync
```bash
# Sync tokens only (components need specific IDs)
npm run figma:all
```

### Help
```bash
# See all available commands
npm run figma:help
```

## 🎨 How to Use Design Tokens

### 1. In Figma
Create styles for:
- **Colors**: Fill styles for your color palette
- **Typography**: Text styles for headings, body text, etc.
- **Effects**: Drop shadow styles
- **Grids**: Layout grids (coming soon)

### 2. Sync to Your Site
```bash
npm run figma:tokens
```

### 3. Use in Your Components
The tokens are automatically available in your Tailwind classes:

```jsx
// If you have a Figma color style named "Brand Primary"
<div className="bg-brand-primary text-white">
  Hello World
</div>

// Typography styles become Tailwind classes
<h1 className="text-heading-1">Main Title</h1>
<p className="text-body">Regular paragraph text</p>
```

## 🧩 Component Generation

### 1. Find Component Node IDs
1. Right-click on a component in Figma
2. Copy link
3. Extract the node ID from the URL: `node-id=123%3A456` → `123:456`

### 2. Generate Components
```bash
npm run figma:components 123:456 789:012
```

### 3. Use Generated Components
```jsx
import { MyFigmaComponent } from '../components/figma/MyFigmaComponent';

function MyPage() {
  return <MyFigmaComponent variant="primary" />;
}
```

## 📝 Content Management

### 1. Prepare Text Layers in Figma
- Name your text layers descriptively
- Group related content
- Use consistent naming conventions

### 2. Get Text Node IDs
Same process as components - right-click and copy link

### 3. Sync Content
```bash
npm run figma:content 345:678 901:234
```

### 4. Use Content in Your Site
```jsx
import content from '../content/figma-content.json';

function MyPage() {
  return (
    <div>
      <h1>{content.heroTitle.text}</h1>
      <p>{content.heroDescription.text}</p>
    </div>
  );
}
```

## 🔄 Workflow Recommendations

### Daily Development
1. Design in Figma
2. Run `npm run figma:tokens` to sync styles
3. Use the updated tokens in your components

### Component Creation
1. Create components in Figma
2. Get component node IDs
3. Run `npm run figma:components <ids>`
4. Customize generated components as needed

### Content Updates
1. Update text in Figma
2. Run `npm run figma:content <ids>`
3. Content automatically updates on your site

## 🛠 Advanced Configuration

### Custom Token Mapping
Edit `lib/figma-tokens.js` to customize how Figma styles map to Tailwind classes.

### Component Templates
Modify the component generation templates in `lib/figma.js` to match your coding style.

### Automated Sync
Set up GitHub Actions or similar to automatically sync from Figma on a schedule.

## 🎯 Design System Page

Visit `/figma` on your site to see your design system in action:
- Color palette
- Typography scale
- Spacing system
- Effects and shadows

## 🔧 Troubleshooting

### "Missing Figma configuration" Error
- Check that `.env.local` exists and has the correct tokens
- Verify your access token is valid
- Ensure the file key is correct

### "No tokens found" Error
- Make sure you have styles defined in your Figma file
- Check that your access token has permission to read the file
- Verify the file is not private/restricted

### Generated Components Not Working
- Ensure you're using the correct node IDs
- Check that the components exist in your Figma file
- Verify the generated JSX syntax is valid

## 📖 Resources

- [Figma API Documentation](https://www.figma.com/developers/api)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Design Tokens Community Group](https://design-tokens.github.io/community-group/)

## 🤝 Contributing

Found a bug or want to improve the Figma integration? Check out the source files:
- `lib/figma.js` - Core Figma API wrapper
- `lib/figma-tokens.js` - Token generation and conversion
- `scripts/figma-sync.js` - CLI sync tool
- `components/FigmaDesignSystem.jsx` - Design system showcase

Happy designing! 🎨
