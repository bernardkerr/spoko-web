import NextLink from 'next/link'
import fs from 'fs'
import path from 'path'
import { getMarkdownFilesFromRoots } from '@/lib/markdown'
import { getImagePath } from '@/lib/paths'
import DocCard from '@/components/DocCard'
import {
  Section,
  Box,
  Heading,
  Text,
  Grid,
  Card,
  Button,
  Code,
} from '@radix-ui/themes'

export default async function DocumentationIndexPage() {
  const files = await getMarkdownFilesFromRoots(['docs-submodules'])
  // Only show entries that follow the convention: "<repo>/<repo>"
  const filtered = files.filter(f => /^([^/]+)\/\1$/.test(f.slug))

  // Build a map of repo -> thumbnail src if present
  const thumbByRepo = new Map()
  const exts = ['png', 'jpg', 'jpeg', 'webp', 'svg']
  for (const f of filtered) {
    const repo = f.slug.split('/')[0]
    let found = null
    for (const ext of exts) {
      const abs = path.join(process.cwd(), 'docs-submodules', repo, 'images', `${repo}.${ext}`)
      if (fs.existsSync(abs)) {
        found = getImagePath(`/docs-submodules/${repo}/images/${repo}.${ext}`)
        break
      }
    }
    if (found) thumbByRepo.set(repo, found)
  }

  // Parse .gitmodules to map docs-submodules/<repo> -> remote URL
  const repoUrlByRepo = new Map()
  try {
    const gm = fs.readFileSync(path.join(process.cwd(), '.gitmodules'), 'utf8')
    const sections = gm.split(/\n(?=\[submodule ")/g)
    for (const sec of sections) {
      const pathMatch = sec.match(/\bpath\s*=\s*(.+)\s*/)
      const urlMatch = sec.match(/\burl\s*=\s*(.+)\s*/)
      if (!pathMatch || !urlMatch) continue
      const subPath = pathMatch[1].trim()
      const urlRaw = urlMatch[1].trim()
      const parts = subPath.split('/')
      const repo = parts[parts.length - 1]
      let httpsUrl = urlRaw
      if (/^git@github.com:/.test(httpsUrl)) {
        httpsUrl = 'https://github.com/' + httpsUrl.replace(/^git@github.com:/, '')
      }
      httpsUrl = httpsUrl.replace(/\.git$/i, '')
      repoUrlByRepo.set(repo, httpsUrl)
    }
  } catch (e) {
    // Ignore if .gitmodules missing/unreadable
  }

  return (
    <Section size="4">
      <Box mx="auto" style={{ maxWidth: 1200, width: '100%' }}>
        <Box mb="5">
          <Heading size="9">Documentation</Heading>
          <Text as="p" color="gray" size="4">
            Spoke Documentation.
          </Text>
        </Box>

        {filtered.length === 0 ? (
          <DocCard>
            <Heading size="4" mb="2">No Documentation Found</Heading>
            <Text as="p" color="gray" size="3" mb="3">
              Add a docs repository as a Git submodule in <Code>docs-submodules/</Code>.
            </Text>
            <div className="prose dark:prose-invert">
              <p>Example command:</p>
              <pre><code>git submodule add https://github.com/your-username/your-docs-repo.git docs-submodules/your-docs-repo</code></pre>
            </div>
          </DocCard>
        ) : (
          <Grid columns={{ initial: '1', sm: '2', lg: '3' }} gap="4">
            {filtered.map((file) => (
              <DocCard key={file.slug}>
                {(() => { const repo = file.slug.split('/')[0]; const src = thumbByRepo.get(repo); return src ? (
                  <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                    <img src={src} alt={`${repo} preview`} style={{ maxWidth: '100%', maxHeight: 160, objectFit: 'contain', borderRadius: 8 }} />
                  </div>
                ) : null })()}
                <Heading size="4" mb="1">
                  <NextLink href={`/documentation/${file.slug}`}>
                    {file.slug.split('/').pop().replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </NextLink>
                </Heading>
                {(() => { const repo = file.slug.split('/')[0]; const url = repoUrlByRepo.get(repo); return url ? (
                  <Button asChild size="1">
                    <NextLink href={url} target="_blank" rel="noopener noreferrer">Open Repository</NextLink>
                  </Button>
                ) : (
                  <Text color="gray" size="2">Repo: {repo}</Text>
                ) })()}
              </DocCard>
            ))}
          </Grid>
        )}
      </Box>
    </Section>
  )
}
