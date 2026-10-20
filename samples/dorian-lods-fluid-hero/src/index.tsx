import { useEffect, useRef } from 'react'
import type { SampleProps } from '../../../src/types'
import './style.css'

const runtimeRoot = `${import.meta.env.BASE_URL}assets/dorian-lods-source-d15719b/`

export default function DorianLodsFluidHero({ mode, parameters }: SampleProps) {
  const frameRef = useRef<HTMLIFrameElement>(null)

  const sendParameters = () => {
    frameRef.current?.contentWindow?.postMessage(
      { type: 'nearstudio:dorian-config', parameters },
      window.location.origin,
    )
  }

  useEffect(sendParameters, [parameters])

  if (mode === 'thumbnail') {
    return (
      <figure className="dorian-lods-runtime dorian-lods-runtime--thumbnail">
        <img
          src={`${runtimeRoot}preview-hero.png`}
          alt="Dorian Lods 流体字形与虹彩玻璃 WebGL 首屏"
        />
      </figure>
    )
  }

  return (
    <div className="dorian-lods-runtime">
      <iframe
        ref={frameRef}
        src={runtimeRoot}
        title="Dorian Lods 原版流体玻璃 WebGL 首屏"
        onLoad={sendParameters}
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  )
}
