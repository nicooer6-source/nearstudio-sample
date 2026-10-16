import type { ComponentType } from 'react'

export type SampleStatus = 'stable' | 'experimental'
export type SampleCategory = 'interaction' | 'navigation' | 'form' | 'feedback' | 'data' | 'motion'

export type SampleManifest = {
  slug: string
  name: string
  description: string
  category: SampleCategory
  tags: string[]
  status: SampleStatus
  states: string[]
  thumbnailState: string
  thumbnailTheme: 'light' | 'dark'
  updatedAt: string
  sourcePath: string
  readmePath: string
  originalUrl?: string
  interactionHint?: string
}

export type SampleProps = {
  state: string
  theme: 'light' | 'dark' | 'checker'
  mode: 'detail' | 'thumbnail' | 'standalone'
}

export type SampleModule = {
  default: ComponentType<SampleProps>
}
