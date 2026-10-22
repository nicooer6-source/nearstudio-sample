import type { CSSProperties } from 'react'
import type { SampleParameterValues, SampleProps } from '../../../src/types'
import './style.css'

const assetRoot = `${import.meta.env.BASE_URL}assets/sachahaouzi-collection-stack/`

const numberValue = (parameters: SampleParameterValues, key: string, fallback: number) => {
  const value = parameters[key]
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

const colorValue = (parameters: SampleParameterValues, key: string, fallback: string) => {
  const value = parameters[key]
  return typeof value === 'string' ? value : fallback
}

export default function SachaCollectionStack({ mode, parameters }: SampleProps) {
  if (mode === 'thumbnail') {
    return (
      <figure className="sacha-stack-thumbnail">
        <img src={`${assetRoot}preview.png`} alt="Sacha Haouzi 三层 Collection 卡片" />
      </figure>
    )
  }

  const style = {
    '--sacha-scene-scale': numberValue(parameters, 'sceneScale', 1),
    '--sacha-idle-gap-x': `${numberValue(parameters, 'idleSpread', 10)}cqi`,
    '--sacha-hover-gap-x': `${numberValue(parameters, 'hoverSpread', 20)}cqi`,
    '--sacha-idle-gap-y': `${-numberValue(parameters, 'verticalFan', 5)}cqi`,
    '--sacha-hover-gap-y': `${-numberValue(parameters, 'verticalFan', 5) * 2}cqi`,
    '--sacha-idle-rotate': `${numberValue(parameters, 'idleRotation', 5)}deg`,
    '--sacha-hover-rotate': `${numberValue(parameters, 'hoverRotation', -4)}deg`,
    '--sacha-duration': `${numberValue(parameters, 'duration', 0.9)}s`,
    '--sacha-radius': `${numberValue(parameters, 'radius', 16)}px`,
    '--sacha-surface': colorValue(parameters, 'surfaceColor', '#f0f0f0'),
    '--sacha-text': colorValue(parameters, 'textColor', '#111111'),
  } as CSSProperties

  const images = [
    { src: `${assetRoot}schema.jpg`, label: 'Organization map — ochre' },
    { src: `${assetRoot}schema3.jpg`, label: 'Organization map — diagram' },
    { src: `${assetRoot}schema2.jpg`, label: 'Organization map — lilac' },
  ]

  return (
    <main className="sacha-stack-stage" style={style}>
      <article className="sacha-stack-card" tabIndex={0} aria-label="Mapping organizations to design better websites">
        <div className="sacha-stack-card__inner">
          <header className="sacha-stack-card__header">
            <h1>Mapping<br />organizations to<br />design better<br />websites</h1>
          </header>

          <div className="sacha-stack-card__media" aria-hidden="true">
            {images.map((image, index) => (
              <figure className="sacha-stack-card__media-item" style={{ '--stack-i': index } as CSSProperties} key={image.src}>
                <img src={image.src} alt={image.label} />
              </figure>
            ))}
          </div>

          <footer className="sacha-stack-card__footer">
            <span>Collection</span>
            <svg viewBox="0 0 14 14" aria-hidden="true">
              <path d="M14 5.833v7A1.167 1.167 0 0 1 12.833 14H1.167A1.167 1.167 0 0 1 0 12.833v-7a1.167 1.167 0 0 1 1.167-1.166h11.666A1.167 1.167 0 0 1 14 5.833M1.75 3.5h10.5a.583.583 0 0 0 0-1.167H1.75a.583.583 0 0 0 0 1.167m1.167-2.333h8.166a.583.583 0 0 0 0-1.167H2.917a.583.583 0 1 0 0 1.167" />
            </svg>
          </footer>
        </div>
      </article>
    </main>
  )
}
