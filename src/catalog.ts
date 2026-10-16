import type { SampleManifest, SampleModule } from './types'

const manifestModules = import.meta.glob<{ default: SampleManifest }>('/samples/*/sample.json', {
  eager: true,
})

const componentModules = import.meta.glob<SampleModule>('/samples/*/src/index.tsx')
const codeModules = import.meta.glob<string>('/samples/*/src/index.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
})
const readmeModules = import.meta.glob<string>('/samples/*/README.md', {
  eager: true,
  query: '?raw',
  import: 'default',
})

function pathFor(slug: string, suffix: string) {
  return `/samples/${slug}/${suffix}`
}

export const samples: SampleManifest[] = Object.values(manifestModules)
  .map((module) => module.default)
  .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

export function getSample(slug: string) {
  return samples.find((sample) => sample.slug === slug)
}

export function loadSampleComponent(slug: string) {
  const loader = componentModules[pathFor(slug, 'src/index.tsx')]
  if (!loader) throw new Error(`Unknown sample: ${slug}`)
  return loader()
}

export function getSampleCode(slug: string) {
  return codeModules[pathFor(slug, 'src/index.tsx')] ?? ''
}

export function getSampleReadme(slug: string) {
  return readmeModules[pathFor(slug, 'README.md')] ?? ''
}
