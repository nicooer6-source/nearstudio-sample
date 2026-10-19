import { useEffect, useRef } from 'react'
import type { SampleProps } from '../../../src/types'
import './style.css'

const runtimeRoot = `${import.meta.env.BASE_URL}assets/wild-craft-source-53bf6033/`

export default function WildCraftPixelField({ mode, parameters }: SampleProps) {
  const frameRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    frameRef.current?.contentWindow?.postMessage(
      { type: 'nearstudio:wild-config', parameters },
      window.location.origin,
    )
  }, [parameters])

  if (mode === 'thumbnail') {
    return (
      <figure className="wild-craft-source wild-craft-source--thumbnail">
        <img
          src={`${runtimeRoot}preview-hero.png`}
          alt="Wild Craft Engineered 像素互动首屏"
        />
      </figure>
    )
  }

  const sendParameters = () => {
    frameRef.current?.contentWindow?.postMessage(
      { type: 'nearstudio:wild-config', parameters },
      window.location.origin,
    )
  }

  return (
    <div className="wild-craft-source">
      <iframe
        ref={frameRef}
        src={`${runtimeRoot}index.html`}
        title="Wild Craft Engineered 原版像素互动"
        onLoad={sendParameters}
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  )
}
