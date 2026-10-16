import { readdir, readFile, stat } from 'node:fs/promises'
import path from 'node:path'

const root = new URL('../samples/', import.meta.url)
const required = ['slug','name','description','category','tags','status','states','thumbnailState','thumbnailTheme','updatedAt','sourcePath','readmePath']
const categories = new Set(['interaction','navigation','form','feedback','data','motion'])
const statuses = new Set(['stable','experimental'])
const seen = new Set()

for (const folder of await readdir(root)) {
  const manifestPath = new URL(`${folder}/sample.json`, root)
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
  for (const key of required) if (!(key in manifest)) throw new Error(`${folder}: missing ${key}`)
  if (manifest.slug !== folder) throw new Error(`${folder}: slug must match folder name`)
  if (seen.has(manifest.slug)) throw new Error(`${folder}: duplicate slug`)
  if (!categories.has(manifest.category)) throw new Error(`${folder}: invalid category`)
  if (!statuses.has(manifest.status)) throw new Error(`${folder}: invalid status`)
  if (!manifest.states.includes(manifest.thumbnailState)) throw new Error(`${folder}: thumbnailState must be in states`)
  const keys = new Set()
  for (const control of manifest.controls ?? []) {
    if (!control.key || !control.label || !['range','color','toggle'].includes(control.type)) throw new Error(`${folder}: invalid control`)
    if (keys.has(control.key)) throw new Error(`${folder}: duplicate control key ${control.key}`)
    if (control.type === 'range' && ![control.default, control.min, control.max, control.step].every(Number.isFinite)) throw new Error(`${folder}: range control ${control.key} needs numeric default/min/max/step`)
    keys.add(control.key)
  }
  await stat(new URL(`${folder}/src/index.tsx`, root))
  await stat(new URL(`${folder}/README.md`, root))
  seen.add(manifest.slug)
}

console.log(`Validated ${seen.size} sample${seen.size === 1 ? '' : 's'}.`)
