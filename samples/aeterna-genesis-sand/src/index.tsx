import { useEffect, useRef } from 'react'
import type { SampleProps } from '../../../src/types'
import './style.css'

const runtimeRoot = `${import.meta.env.BASE_URL}assets/aeterna-genesis-v3-js-10314a/`

export default function AeternaGenesisSand({ mode, parameters }: SampleProps) {
  const frameRef = useRef<HTMLIFrameElement>(null)

  const sendParameters = () => {
    frameRef.current?.contentWindow?.postMessage(
      { type: 'nearstudio:aeterna-config', parameters },
      window.location.origin,
    )
  }

  useEffect(sendParameters, [parameters])

  if (mode === 'thumbnail') {
    return (
      <figure className="aeterna-genesis aeterna-genesis--thumbnail">
        <img
          src={`${runtimeRoot}preview-hero-component.png`}
          alt="Aeterna 点阵双手互动首屏"
        />
      </figure>
    )
  }

  return (
    <div className="aeterna-genesis">
      <iframe
        ref={frameRef}
        src={`${runtimeRoot}index.html`}
        title="Aeterna Genesis 原版点阵双手互动"
        onLoad={sendParameters}
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  )
}
