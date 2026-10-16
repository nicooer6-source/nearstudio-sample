import { useEffect, useMemo, useRef, useState } from 'react'
import { getSampleCode, getSampleReadme, samples } from '../catalog'
import { appendParameters, defaultParameters } from '../parameters'
import type { SampleControl, SampleManifest, SampleParameterValue, SampleParameterValues } from '../types'
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

function runnerUrl(sample: SampleManifest, state: string, theme: Theme, mode = 'detail', values?: SampleParameterValues) {
  const url = new URL('runner/', window.location.origin + import.meta.env.BASE_URL)
  url.searchParams.set('component', sample.slug)
  url.searchParams.set('state', state)
  url.searchParams.set('theme', theme)
  url.searchParams.set('mode', mode)
  if (values) appendParameters(url, values)
  return url.toString()
}

function controlValue(control: SampleControl, value: SampleParameterValue, onChange: (value: SampleParameterValue) => void) {
  if (control.type === 'color') {
    return <input aria-label={control.label} type="color" value={String(value)} onChange={(event) => onChange(event.target.value)} />
  }
  if (control.type === 'toggle') {
    return <button type="button" className={`parameter-toggle ${value ? 'is-active' : ''}`} aria-pressed={Boolean(value)} onClick={() => onChange(!value)}><span /></button>
  }
  return <input aria-label={control.label} type="range" min={control.min} max={control.max} step={control.step} value={Number(value)} onInput={(event) => onChange(Number(event.currentTarget.value))} />
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
  const [parameterSets, setParameterSets] = useState<Record<string, SampleParameterValues>>(() =>
    Object.fromEntries(samples.map((sample) => [sample.slug, defaultParameters(sample.controls)])),
  )
  const [copyLabel, setCopyLabel] = useState('复制调用 URL')
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const selected = samples.find((sample) => sample.slug === selectedSlug) ?? samples[0]
  const visibleSamples = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return samples
    return samples.filter((sample) => [sample.name, sample.description, sample.category, ...sample.tags].join(' ').toLowerCase().includes(needle))
  }, [query])
  const selectedParameters = selected ? parameterSets[selected.slug] ?? defaultParameters(selected.controls) : {}

  useEffect(() => {
    if (!selected) return
    setState(selected.states[0])
    setTheme(selected.thumbnailTheme)
    setCopyLabel('复制调用 URL')
    const url = new URL(window.location.href)
    url.searchParams.set('component', selected.slug)
    window.history.replaceState({}, '', url)
  }, [selected?.slug])

  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage({ type: 'nearstudio:parameters', parameters: selectedParameters }, window.location.origin)
  }, [selectedParameters, selected?.slug])

  useEffect(() => {
    const onPopState = () => setSelectedSlug(initialSlug())
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  if (!selected) return <main className="studio-empty">还没有组件。通过 mirror 导入第一个组件后，它会自动出现在这里。</main>

  const previewSrc = runnerUrl(selected, state, theme)
  const shareUrl = runnerUrl(selected, state, theme, 'standalone', selectedParameters)
  const sourceUrl = `https://github.com/nicooer6-source/nearstudio-sample/blob/main/${selected.sourcePath}`
  const downloadPayload = JSON.stringify({ component: selected.slug, state, theme, parameters: selectedParameters, url: shareUrl }, null, 2)
  const downloadHref = `data:application/json;charset=utf-8,${encodeURIComponent(downloadPayload)}`

  const chooseSample = (slug: string) => {
    setSelectedSlug(slug)
    const url = new URL(window.location.href)
    url.searchParams.set('component', slug)
    window.history.pushState({}, '', url)
  }

  const setParameter = (key: string, value: SampleParameterValue) => {
    setParameterSets((current) => ({ ...current, [selected.slug]: { ...selectedParameters, [key]: value } }))
  }

  const reset = () => {
    setParameterSets((current) => ({ ...current, [selected.slug]: defaultParameters(selected.controls) }))
    setReloadKey((key) => key + 1)
  }

  const copyUrl = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopyLabel('已复制')
    window.setTimeout(() => setCopyLabel('复制调用 URL'), 1600)
  }

  return (
    <main className={`studio ${sidebarOpen ? '' : 'studio--sidebar-closed'} ${inspectorOpen ? '' : 'studio--inspector-closed'}`}>
      <header className="studio-topbar">
        <a className="studio-brand" href={import.meta.env.BASE_URL} aria-label="返回组件工作台首页"><span className="studio-brand-mark" aria-hidden="true" /><span>Nearstudio Sample</span></a>
        <div className="studio-topbar-center" role="group" aria-label="预览视口">
          {(['desktop', 'tablet', 'mobile'] as Viewport[]).map((item) => <button key={item} className={viewport === item ? 'is-active' : ''} onClick={() => setViewport(item)} aria-label={`${item} 视口`}>{item === 'desktop' ? '▰' : '▯'}</button>)}
        </div>
        <div className="studio-topbar-actions">
          <button onClick={() => setSidebarOpen((open) => !open)} aria-label="切换组件列表">组件</button><button onClick={reset}>重置</button>
          <a href={sourceUrl} target="_blank" rel="noreferrer">源码 ↗</a><button onClick={() => setInspectorOpen((open) => !open)} aria-label="切换设置面板">设置</button>
        </div>
      </header>

      <aside className="studio-sidebar" aria-label="组件列表">
        <div className="panel-heading"><strong>组件工作台</strong><span>{samples.length}</span></div>
        <label className="studio-search"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`搜索 ${samples.length} 个组件`} /></label>
        <nav className="sample-list">
          {visibleSamples.map((sample) => (
            <button key={sample.slug} className={`sample-list-item ${sample.slug === selected.slug ? 'is-active' : ''}`} onClick={() => chooseSample(sample.slug)}>
              <span className="sample-miniature" aria-hidden="true"><iframe title="" src={runnerUrl(sample, sample.thumbnailState, sample.thumbnailTheme, 'thumbnail')} tabIndex={-1} /></span>
              <span className="sample-list-copy"><strong>{sample.name}</strong><small>{categoryLabels[sample.category]}</small></span>
              <span className={`status-dot status-dot--${sample.status}`} title={sample.status === 'stable' ? '稳定' : '实验'} />
            </button>
          ))}
        </nav>
        {visibleSamples.length === 0 && <p className="no-results">没有匹配的组件。</p>}
        <footer className="sidebar-footer">组件由 mirror 导入 · 共用一个 Runner</footer>
      </aside>

      <section className="studio-canvas" aria-label="组件预览工作区">
        <div className="canvas-bar"><div><span className="live-dot" /> LIVE PREVIEW</div><div>{selected.interactionHint}</div><a href={shareUrl} target="_blank" rel="noreferrer">独立打开 ↗</a></div>
        <div className="canvas-viewport" data-viewport={viewport}>
          <iframe key={`${selected.slug}-${state}-${theme}-${reloadKey}`} ref={iframeRef} title={`${selected.name} 可操作预览`} src={previewSrc} onLoad={() => iframeRef.current?.contentWindow?.postMessage({ type: 'nearstudio:parameters', parameters: selectedParameters }, window.location.origin)} sandbox="allow-scripts allow-same-origin allow-forms" />
        </div>
      </section>

      <aside className="studio-inspector" aria-label="组件设置">
        <div className="inspector-intro"><div className="inspector-title-row"><h1>{selected.name}</h1><span>{selected.status === 'stable' ? '稳定' : '实验'}</span></div><p>{selected.description}</p>{selected.originalUrl && <a href={selected.originalUrl} target="_blank" rel="noreferrer">原站 ↗</a>}</div>
        <div className="inspector-tabs" role="tablist">
          {(['settings', 'code', 'readme'] as InspectorTab[]).map((item) => <button key={item} className={tab === item ? 'is-active' : ''} onClick={() => setTab(item)} role="tab">{item === 'settings' ? '设置' : item === 'code' ? '代码' : '说明'}</button>)}
        </div>
        <div className="inspector-body">
          {tab === 'settings' && <>
            {!!selected.controls?.length && <section className="control-section"><h2>组件参数</h2><div className="parameter-list">
              {selected.controls.map((control) => <label className={`parameter-control parameter-control--${control.type}`} key={control.key}>
                <span className="parameter-heading"><b>{control.label}</b><output>{String(selectedParameters[control.key])}{control.unit ?? ''}</output></span>
                {controlValue(control, selectedParameters[control.key] ?? control.default, (value) => setParameter(control.key, value))}
              </label>)}
            </div></section>}
            <section className="control-section export-section"><h2>调用与导出</h2><div className="export-actions"><button onClick={copyUrl}>{copyLabel}</button><a href={downloadHref} download={`${selected.slug}-parameters.json`}>下载参数 JSON</a></div><p>URL 可直接放进 iframe 或产品页面中加载当前效果。</p></section>
            <section className="control-section"><h2>状态</h2><div className="choice-grid">{selected.states.map((item) => <button key={item} className={state === item ? 'is-active' : ''} onClick={() => setState(item)}>{item}</button>)}</div></section>
            <section className="control-section"><h2>画布</h2><div className="choice-grid choice-grid--three">{(['light', 'dark', 'checker'] as Theme[]).map((item) => <button key={item} className={theme === item ? 'is-active' : ''} onClick={() => setTheme(item)}>{item}</button>)}</div></section>
            <section className="control-section"><h2>技术</h2><div className="tag-row">{selected.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></section>
            <section className="control-section import-note"><h2>导入规范</h2><p>组件在 sample.json 声明 controls 后，工作台会自动生成参数面板、调用 URL 和 JSON 下载。</p></section>
          </>}
          {tab === 'code' && <pre className="source-code"><code>{getSampleCode(selected.slug)}</code></pre>}
          {tab === 'readme' && <pre className="readme-text">{getSampleReadme(selected.slug)}</pre>}
        </div>
      </aside>
    </main>
  )
}
