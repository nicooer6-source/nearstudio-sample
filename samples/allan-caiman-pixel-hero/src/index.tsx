import { useEffect, useRef } from 'react'
import type { SampleProps } from '../../../src/types'
import './style.css'

const runtimeRoot = `${import.meta.env.BASE_URL}assets/allancordero-source-1a87b09/`

export default function AllanCaimanPixelHero({ mode, parameters }: SampleProps) {
  const frameRef = useRef<HTMLIFrameElement>(null)
  const sendParameters = () => frameRef.current?.contentWindow?.postMessage(
    { type: 'nearstudio:allan-config', stage: 'hero', parameters },
    window.location.origin,
  )

  useEffect(sendParameters, [parameters])

  if (mode === 'thumbnail') {
    return <figure className="allan-stage-runtime allan-stage-runtime--thumbnail"><img src={`${runtimeRoot}preview-hero.png`} alt="Allan Cordero 字符鳄鱼互动首屏" /></figure>
  }

  return <div className="allan-stage-runtime"><iframe ref={frameRef} src={`${runtimeRoot}hero.html`} title="Allan Cordero 字符鳄鱼互动首屏" onLoad={sendParameters} sandbox="allow-scripts allow-same-origin" /></div>
}
