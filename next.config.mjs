/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // React configuration for better WebGL compatibility
  reactStrictMode: false, // Temporarily disable for WebGL context issues
  // Uncomment and set your repo name for GitHub Pages deployment
  // basePath: process.env.GITHUB_ACTIONS === 'true' ? '/your-repo-name' : '',
  // assetPrefix: process.env.GITHUB_ACTIONS === 'true' ? '/your-repo-name/' : '',
}

export default nextConfig
