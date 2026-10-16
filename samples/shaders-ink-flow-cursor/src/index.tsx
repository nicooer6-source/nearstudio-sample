import { InkFlow, Shader, SolidColor, Stone } from 'shaders/react'
import type { SampleProps } from '../../../src/types'
import './style.css'

export default function InkFlowCursorSample({ mode }: SampleProps) {
  return (
    <section className={`ink-flow-stage ink-flow-stage--${mode}`} aria-label="鼠标流体拖尾演示">
      <Shader className="ink-flow-layer">
        <SolidColor color="#0F0F10" />
        <Stone intensity={1} scale={200}>
          <InkFlow color1="#2216f7" color2="#55bdff" color3="#a702ff" colorMode="custom" />
        </Stone>
      </Shader>
      <div className="ink-flow-copy">
        <span>NEARSTUDIO · SHARED RUNNER</span>
        <h1>移动鼠标</h1>
        {mode !== 'thumbnail' && <p>蓝紫色流体会跟随指针生成，并在离开后逐渐消散。</p>}
      </div>
      <span className="ink-flow-arrow" aria-hidden="true">↗</span>
    </section>
  )
}
