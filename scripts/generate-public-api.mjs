import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const samplesRoot = path.join(projectRoot, 'samples')
const outputRoot = path.join(projectRoot, 'public', 'api', 'components')
const origin = 'https://nearstudio.art'
const basePath = '/sample/'

await mkdir(outputRoot, { recursive: true })

const manifests = []
for (const folder of await readdir(samplesRoot)) {
  const manifest = JSON.parse(await readFile(path.join(samplesRoot, folder, 'sample.json'), 'utf8'))
  const defaults = Object.fromEntries((manifest.controls ?? []).map((control) => [control.key, control.default]))
  const runtimeUrl = new URL(`${basePath}runner/`, origin)
  runtimeUrl.searchParams.set('component', manifest.slug)
  runtimeUrl.searchParams.set('state', manifest.states[0])
  runtimeUrl.searchParams.set('theme', manifest.thumbnailTheme)
  runtimeUrl.searchParams.set('mode', 'standalone')
  for (const [key, value] of Object.entries(defaults)) runtimeUrl.searchParams.set(`p.${key}`, String(value))

  const api = {
    slug: manifest.slug,
    name: manifest.name,
    description: manifest.description,
    status: manifest.status,
    category: manifest.category,
    states: manifest.states,
    controls: manifest.controls ?? [],
    defaults,
    runtimeUrl: runtimeUrl.toString(),
    loaderUrl: `${origin}${basePath}embed.js`,
    element: 'nearstudio-component',
  }

  manifests.push(api)
  await writeFile(path.join(outputRoot, `${manifest.slug}.json`), `${JSON.stringify(api, null, 2)}\n`)
}

manifests.sort((a, b) => a.name.localeCompare(b.name))
await writeFile(path.join(projectRoot, 'public', 'api', 'components.json'), `${JSON.stringify({ version: 1, components: manifests }, null, 2)}\n`)
console.log(`Generated public API for ${manifests.length} components.`)
