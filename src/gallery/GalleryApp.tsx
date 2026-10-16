import { useEffect, useMemo, useRef, useState } from 'react'
import { getSampleCode, getSampleReadme, samples } from '../catalog'
import type { SampleManifest } from '../types'
import './gallery.css'

type Viewport = 'desktop' | 'tablet' | 'mobile'
type InspectorTab = 'settings' | 'code' | 'readme'
type Theme = 'light' | 'dark' | 'checker'

const categoryLabels: Record<string, string> = {
  interaction: '交互', navigation: '导航', form: '表单', feedback: '反馈', data: '数据', motion: '动效',
}

function initialSlug() {
  const requested = new URLSearchParams(window.location.search).get('component')
  return samples.some((sample) => sample.slug === requested) ? requested! : samples[0]?.slug ?? ''
}

function runnerUrl(sample: SampleManifest, state: string, theme: Theme, mode = 'detail') {
  const url = new URL('runner/', window.location.origin + import.meta.env.BASE_URL)
  url.searchParams.set('component', sample.slug)
  url.searchParams.set('state', state)
  url.searchParams.set('theme', theme)
  url.searchParams.set('mode', mode)
  return url.toString()
}

export function GalleryApp() {
  const [selectedSlug, setSelectedSlug] = useState(initialSlug)
  const [query, setQuery] = useState('')
  const [viewport, setViewport] = useState<Viewport>('desktop')
  const [theme, setTheme] = useState<Theme>('dark')
  const [state, setState] = useState('default')
  const [tab, setTab] = useState<InspectorTab>('settings')
  const [reloadKey, setReloadKey] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [inspectorOpen, setInspectorOpen] = useState(true)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const selected = samples.find((sample) => sample.slug === selectedSlug) ?? samples[0]
  const visibleSamples = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return samples
    return samples.filter((sample) => [sample.name, sample.description, sample.category, ...sample.tags].join(' ').toLowerCase().includes(needle))
  }, [query])

  useEffect(() => {
    if (!selected) return
    setState(selected.states[0])
    setTheme(selected.thumbnailTheme)
    const url = new URL(window.location.href)
    url.searchParams.set('component', selected.slug)
    window.history.replaceState({}, '', url)
  }, [selected?.slug])

  useEffect(() => {
    const onPopState = () => setSelectedSlug(initialSlug())
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  if (!selected) return <main className="studio-empty">还没有组件。通过 mirror 导入第一个组件后，它会自动出现在这里。</main>

  const previewSrc = runnerUrl(selected, state, theme)
  const sourceUrl = `https://github.com/nicooer6-source/nearstudio-sample/blob/main/${selected.sourcePath}`

  const chooseSample = (slug: string) => {
    setSelectedSlug(slug)
    const url = new URL(window.location.href)
    url.searchParams.set('component', slug)
    window.history.pushState({}, '', url)
  }

  return (
    <main className={`studio ${sidebarOpen ? '' : 'studio--sidebar-closed'} ${inspectorOpen ? '' : 'studio--inspector-closed'}`}>
      <header className="studio-topbar">
        <a className="studio-brand" href={import.meta.env.BASE_URL} aria-label="返回组件工作台首页">
          <span className="studio-brand-mark" aria-hidden="true" />
          <span>Nearstudio Sample</span>
        </a>
        <div className="studio-topbar-center" role="group" aria-label="预览视口">
          {(['desktop', 'tablet', 'mobile'] as Viewport[]).map((item) => (
            <button key={item} className={viewport === item ? 'is-active' : ''} onClick={() => setViewport(item)} aria-label={`${item} 视口`}>
              {item === 'desktop' ? '▰' : item === 'tablet' ? '▯' : '▯'}
            </button>
          ))}
        </div>
        <div className="studio-topbar-actions">
          <button onClick={() => setSidebarOpen((open) => !open)} aria-label="切换组件列表">组件</button>
          <button onClick={() => setReloadKey((key) => key + 1)}>重置</button>
          <a href={sourceUrl} target="_blank" rel="noreferrer">源码 ↗</a>
          <button onClick={() => setInspectorOpen((open) => !open)} aria-label="切换设置面板">设置</button>
        </div>
      </header>

      <aside className="studio-sidebar" aria-label="组件列表">
        <div className="panel-heading">
          <strong>组件工作台</strong>
          <span>{samples.length}</span>
        </div>
        <label className="studio-search">
          <span aria-hidden="true">⌕</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`搜索 ${samples.length} 个组件`} />
        </label>
        <nav className="sample-list">
          {visibleSamples.map((sample) => (
            <button key={sample.slug} className={`sample-list-item ${sample.slug === selected.slug ? 'is-active' : ''}`} onClick={() => chooseSample(sample.slug)}>
              <span className="sample-miniature" aria-hidden="true">
                <iframe title="" src={runnerUrl(sample, sample.thumbnailState, sample.thumbnailTheme, 'thumbnail')} tabIndex={-1} />
              </span>
              <span className="sample-list-copy">
                <strong>{sample.name}</strong>
                <small>{categoryLabels[sample.category]}</small>
              </span>
              <span className={`status-dot status-dot--${sample.status}`} title={sample.status === 'stable' ? '稳定' : '实验'} />
            </button>
          ))}
        </nav>
        {visibleSamples.length === 0 && <p className="no-results">没有匹配的组件。</p>}
        <footer className="sidebar-footer">组件由 mirror 导入 · 共用一个 Runner</footer>
      </aside>

      <section className="studio-canvas" aria-label="组件预览工作区">
        <div className="canvas-bar">
          <div><span className="live-dot" /> LIVE PREVIEW</div>
          <div>{selected.interactionHint}</div>
          <a href={previewSrc} target="_blank" rel="noreferrer">独立打开 ↗</a>
        </div>
        <div className="canvas-viewport" data-viewport={viewport}>
          <iframe
            key={`${selected.slug}-${state}-${theme}-${reloadKey}`}
            ref={iframeRef}
            title={`${selected.name} 可操作预览`}
            src={previewSrc}
            sandbox="allow-scripts allow-same-origin allow-forms"
          />
        </div>
      </section>

      <aside className="studio-inspector" aria-label="组件设置">
        <div className="inspector-intro">
          <div className="inspector-title-row">
            <h1>{selected.name}</h1>
            <span>{selected.status === 'stable' ? '稳定' : '实验'}</span>
          </div>
          <p>{selected.description}</p>
          {selected.originalUrl && <a href={selected.originalUrl} target="_blank" rel="noreferrer">原站 ↗</a>}
        </div>
        <div className="inspector-tabs" role="tablist">
          {(['settings', 'code', 'readme'] as InspectorTab[]).map((item) => (
            <button key={item} className={tab === item ? 'is-active' : ''} onClick={() => setTab(item)} role="tab">
              {item === 'settings' ? '设置' : item === 'code' ? '代码' : '说明'}
            </button>
          ))}
        </div>
        <div className="inspector-body">
          {tab === 'settings' && (
            <>
              <section className="control-section">
                <h2>状态</h2>
                <div className="choice-grid">
                  {selected.states.map((item) => <button key={item} className={state === item ? 'is-active' : ''} onClick={() => setState(item)}>{item}</button>)}
                </div>
              </section>
              <section className="control-section">
                <h2>画布</h2>
                <div className="choice-grid choice-grid--three">
                  {(['light', 'dark', 'checker'] as Theme[]).map((item) => <button key={item} className={theme === item ? 'is-active' : ''} onClick={() => setTheme(item)}>{item}</button>)}
                </div>
              </section>
              <section className="control-section">
                <h2>技术</h2>
                <div className="tag-row">{selected.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
              </section>
              <section className="control-section import-note">
                <h2>导入规范</h2>
                <p>mirror 只需写入组件入口、清单和说明。工作台自动发现并交给共享 Runner 运行。</p>
              </section>
            </>
          )}
          {tab === 'code' && <pre className="source-code"><code>{getSampleCode(selected.slug)}</code></pre>}
          {tab === 'readme' && <pre className="readme-text">{getSampleReadme(selected.slug)}</pre>}
        </div>
      </aside>
    </main>
  )
}
