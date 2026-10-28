import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'

const source = resolve(process.env.NOOMO_MIRROR_SOURCE || '../showcase-noomoagency-com')
const target = resolve('public/assets/noomo-showcase-crystal-space/mirror')
const assetRoot = resolve('public/assets/noomo-showcase-crystal-space')
const sourcePrefix = '/demo/showcase-noomoagency-com'
const targetPrefix = '/sample/assets/noomo-showcase-crystal-space/mirror'
const directories = ['_nuxt', 'audio', 'draco', 'hdri', 'images', 'models', 'textures', 'videos']
const rootFiles = ['index.html', 'fav.png', 'og.jpg']

await rm(target, { recursive: true, force: true })
await mkdir(target, { recursive: true })

for (const name of directories) await cp(join(source, name), join(target, name), { recursive: true })
for (const name of rootFiles) await cp(join(source, name), join(target, name))

const textExtensions = /\.(?:html|css|js|mjs|json|svg)$/i

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
await cp(resolve('samples/noomo-showcase-crystal-space/runtime/sample-bridge.js'), join(target, 'sample-bridge.js'))
await cp(join(source, 'og.jpg'), join(assetRoot, 'preview.jpg'))

const indexPath = join(target, 'index.html')
let index = await readFile(indexPath, 'utf8')
const bridgeTag = `<script src="${targetPrefix}/sample-bridge.js"></script>`
if (!index.includes(bridgeTag)) index = index.replace('</body>', `${bridgeTag}</body>`)
await writeFile(indexPath, index)

console.log(`Noomo runtime synced to ${target}`)
