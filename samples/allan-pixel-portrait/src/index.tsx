import { useEffect, useRef } from 'react'
import type { SampleProps } from '../../../src/types'
import './style.css'

const runtimeRoot = `${import.meta.env.BASE_URL}assets/allancordero-source-1a87b09/`

export default function AllanPixelPortrait({ mode, parameters }: SampleProps) {
  const frameRef = useRef<HTMLIFrameElement>(null)
  const sendParameters = () => frameRef.current?.contentWindow?.postMessage(
    { type: 'nearstudio:allan-config', stage: 'portrait', parameters },
    window.location.origin,
  )

  useEffect(sendParameters, [parameters])

  if (mode === 'thumbnail') {
    return <figure className="allan-stage-runtime allan-stage-runtime--thumbnail"><img src={`${runtimeRoot}preview-portrait.png`} alt="Allan Cordero 荧光点阵人像" /></figure>
  }

  return <div className="allan-stage-runtime"><iframe ref={frameRef} src={`${runtimeRoot}portrait.html`} title="Allan Cordero 荧光点阵人像" onLoad={sendParameters} sandbox="allow-scripts allow-same-origin" /></div>
}
