import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'

const source = resolve(process.env.EMOTION_MIRROR_SOURCE || '../emotion-agency-com')
const target = resolve('public/assets/emotion-agency-memory-landscape/mirror')
const sourcePrefix = '/demo/emotion-agency-com'
const targetPrefix = '/sample/assets/emotion-agency-memory-landscape/mirror'
const directories = ['_nuxt', 'about', 'audio', 'basis', 'fonts', 'grass_text', 'meta', 'models', 'projects', 'water']
const rootFiles = ['index.html', 'favicon.ico', 'favicon.svg', 'site.webmanifest', 'noise.jpg', 'water_map.png']

await rm(target, { recursive: true, force: true })
await mkdir(target, { recursive: true })

for (const name of directories) await cp(join(source, name), join(target, name), { recursive: true })
for (const name of rootFiles) await cp(join(source, name), join(target, name))

const textExtensions = /\.(?:html|css|js|mjs|json|webmanifest|svg)$/i

async function rewriteTree(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) await rewriteTree(path)
    else if (textExtensions.test(entry.name)) {
      const current = await readFile(path, 'utf8')
      const next = current.replaceAll(sourcePrefix, targetPrefix)
      if (next !== current) await writeFile(path, next)
    }
  }
}

await rewriteTree(target)
await cp(resolve('samples/emotion-agency-memory-landscape/runtime/sample-bridge.js'), join(target, 'sample-bridge.js'))

const indexPath = join(target, 'index.html')
let index = await readFile(indexPath, 'utf8')
const bridgeTag = `<script src="${targetPrefix}/sample-bridge.js"></script>`
if (!index.includes(bridgeTag)) index = index.replace('</body>', `${bridgeTag}</body>`)
await writeFile(indexPath, index)

console.log(`Emotion runtime synced to ${target}`)
