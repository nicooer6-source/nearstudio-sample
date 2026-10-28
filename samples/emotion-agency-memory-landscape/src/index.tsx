import type { SampleProps, SampleParameterValues } from '../../../src/types'
import './style.css'

const assetRoot = `${import.meta.env.BASE_URL}assets/emotion-agency-memory-landscape`
const runtimeRoot = `${assetRoot}/mirror`
const preview = `${assetRoot}/preview.jpg`

const booleanValue = (parameters: SampleParameterValues, key: string, fallback: boolean) => {
  const value = parameters[key]
  return typeof value === 'boolean' ? value : fallback
}

export default function EmotionAgencyMemoryLandscape({ mode, parameters }: SampleProps) {
  if (mode === 'thumbnail') {
    return <div className="emotion-mirror emotion-mirror--thumbnail"><img src={preview} alt="" /></div>
  }

  const search = new URLSearchParams({
    sample: '1',
    autoEnter: String(booleanValue(parameters, 'autoEnter', true)),
    audio: String(booleanValue(parameters, 'audio', false)),
    showNavigation: String(booleanValue(parameters, 'showNavigation', false)),
  })

  return (
    <div className="emotion-mirror">
      <iframe
        key={search.toString()}
        src={`${runtimeRoot}/index.html?${search}`}
        title="Emotion Agency 首页交互镜像"
        allow="autoplay; fullscreen"
      />
    </div>
  )
}
