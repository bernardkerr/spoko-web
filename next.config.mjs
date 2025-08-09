/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Uncomment and set your repo name for GitHub Pages deployment
  // basePath: process.env.GITHUB_ACTIONS === 'true' ? '/your-repo-name' : '',
  // assetPrefix: process.env.GITHUB_ACTIONS === 'true' ? '/your-repo-name/' : '',
}

export default nextConfig
