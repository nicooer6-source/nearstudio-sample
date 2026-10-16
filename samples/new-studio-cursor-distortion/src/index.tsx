import type { SampleProps } from '../../../src/types'
import { NewStudioHero } from '../../../src/effects/NewStudioHero'

export default function NewStudioCursorDistortion({ mode, parameters }: SampleProps) {
  return <NewStudioHero interactive mode={mode} parameters={parameters} />
}
