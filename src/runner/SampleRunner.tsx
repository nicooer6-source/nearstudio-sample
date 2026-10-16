import { lazy, Suspense, useMemo } from 'react'
import { getSample, loadSampleComponent } from '../catalog'
import type { SampleProps } from '../types'
import './runner.css'

export function SampleRunner() {
  const params = new URLSearchParams(window.location.search)
  const slug = params.get('component') ?? ''
  const manifest = getSample(slug)
  const state = params.get('state') || manifest?.states[0] || 'default'
  const themeParam = params.get('theme')
  const theme: SampleProps['theme'] = themeParam === 'dark' || themeParam === 'checker' ? themeParam : 'light'
  const modeParam = params.get('mode')
  const mode: SampleProps['mode'] = modeParam === 'thumbnail' || modeParam === 'standalone' ? modeParam : 'detail'

  const Component = useMemo(
    () => (manifest ? lazy(() => loadSampleComponent(manifest.slug)) : null),
    [manifest],
  )

  if (!manifest || !Component) {
    return <main className="runner-error"><strong>找不到组件</strong><span>请返回组件画廊重新选择。</span></main>
  }

  return (
    <main className={`runner runner--${theme}`} data-sample-ready="true">
      <Suspense fallback={<div className="runner-loading">正在载入组件…</div>}>
        <Component state={state} theme={theme} mode={mode} />
      </Suspense>
    </main>
  )
}
