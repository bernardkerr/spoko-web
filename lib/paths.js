// Helper functions for basePath/assetPrefix aware URLs

export function getBasePath() {
  return process.env.NODE_ENV === 'production' && process.env.GITHUB_ACTIONS === 'true' 
    ? '/your-repo-name' // Update this with your actual repo name
    : ''
}

export function getAssetPath(path) {
  const basePath = getBasePath()
  return `${basePath}${path.startsWith('/') ? path : `/${path}`}`
}

export function getImagePath(imagePath) {
  // Handle images from content submodule
  if (imagePath.startsWith('/content-submodule/')) {
    return getAssetPath(imagePath)
  }
  return getAssetPath(imagePath)
}
