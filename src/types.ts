import type { ComponentType } from 'react'

export type SampleStatus = 'stable' | 'experimental'
export type SampleCategory = 'interaction' | 'navigation' | 'form' | 'feedback' | 'data' | 'motion'

export type SampleParameterValue = string | number | boolean
export type SampleParameterValues = Record<string, SampleParameterValue>

export type SampleControl = {
  key: string
  label: string
  type: 'range' | 'color' | 'toggle'
  default: SampleParameterValue
  min?: number
  max?: number
  step?: number
  unit?: string
}

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
  controls?: SampleControl[]
}

export type SampleProps = {
  state: string
  theme: 'light' | 'dark' | 'checker'
  mode: 'detail' | 'thumbnail' | 'standalone'
  parameters: SampleParameterValues
}

export type SampleModule = {
  default: ComponentType<SampleProps>
}
