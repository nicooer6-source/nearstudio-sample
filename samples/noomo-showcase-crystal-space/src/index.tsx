import type { SampleProps, SampleParameterValues } from '../../../src/types'
import './style.css'

const assetRoot = `${import.meta.env.BASE_URL}assets/noomo-showcase-crystal-space`
const runtimeRoot = `${assetRoot}/mirror`
const preview = `${assetRoot}/preview.jpg`

const booleanValue = (parameters: SampleParameterValues, key: string, fallback: boolean) => {
  const value = parameters[key]
  return typeof value === 'boolean' ? value : fallback
}

export default function NoomoShowcaseCrystalSpace({ mode, parameters }: SampleProps) {
  if (mode === 'thumbnail') {
    return <div className="noomo-showcase noomo-showcase--thumbnail"><img src={preview} alt="" /></div>
  }

  const search = new URLSearchParams({
    sample: '1',
    audio: String(booleanValue(parameters, 'audio', false)),
    showNavigation: String(booleanValue(parameters, 'showNavigation', false)),
  })

  return (
    <div className="noomo-showcase">
      <iframe
        key={search.toString()}
        src={`${runtimeRoot}/index.html?${search}`}
        title="Noomo Showcase 首页 3D 交互镜像"
        allow="autoplay; fullscreen"
      />
    </div>
  )
}
