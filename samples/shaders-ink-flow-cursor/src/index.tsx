import { InkFlow, Shader, SolidColor, Stone } from 'shaders/react'
import type { SampleProps } from '../../../src/types'
import './style.css'

export default function InkFlowCursorSample({ mode, parameters }: SampleProps) {
  const number = (key: string, fallback: number) => typeof parameters[key] === 'number' ? parameters[key] as number : fallback
  const text = (key: string, fallback: string) => typeof parameters[key] === 'string' ? parameters[key] as string : fallback
  return (
    <section className={`ink-flow-stage ink-flow-stage--${mode}`} aria-label="Shaders 首页鼠标流体拖尾演示">
      <Shader className="ink-flow-layer">
        <SolidColor color={text('background', '#0f0f10')} />
        <Stone intensity={number('intensity', 1)} scale={number('scale', 200)}>
          <InkFlow color1={text('color1', '#2216f7')} color2={text('color2', '#55bdff')} color3={text('color3', '#a702ff')} colorMode="custom" />
        </Stone>
      </Shader>
      <div className="ink-flow-hero">
        <div className="ink-flow-frameworks" aria-label="Supported frameworks">
          <b className="vue">V</b><b className="react">⚛</b><b className="svelte">S</b>
          <b className="solid">◒</b><b className="framer">F</b><b className="js">JS</b>
        </div>
        <h1>Open source shader<br />component library</h1>
        {mode !== 'thumbnail' && (
          <p>Join 18,000+ design engineers crafting magic with our production-ready<br className="ink-flow-wide" /> WebGPU components. Create your own effects in our free design editor.</p>
        )}
        <div className="ink-flow-actions">
          <button type="button"><span aria-hidden="true">▧</span> Create a shader</button>
          <button type="button" className="secondary">Unlock Pro</button>
        </div>
      </div>
      <div className="ink-flow-editor" aria-hidden="true">
        <div className="ink-flow-editor-rail"><span>Shaders</span><i /><i className="selected" /></div>
        <div className="ink-flow-editor-canvas" />
        <div className="ink-flow-editor-panel"><span>LinearGradient</span><i /></div>
      </div>
    </section>
  )
}
