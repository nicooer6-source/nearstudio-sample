import { useEffect, useMemo, useState } from 'react'

type TemporaryInvite = {
  id: string
  label: string
  createdAt: number
  expiresAt: number
  revokedAt: number | null
  active: boolean
}

type CreatedInvite = TemporaryInvite & { code: string }

const durationOptions = [
  { value: 60, label: '1 小时' },
  { value: 360, label: '6 小时' },
  { value: 1440, label: '24 小时' },
  { value: 4320, label: '3 天' },
  { value: 10080, label: '7 天' },
]

const formatTime = (value: number) => new Intl.DateTimeFormat('zh-CN', {
  month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
}).format(new Date(value))

const remaining = (expiresAt: number) => {
  const minutes = Math.max(0, Math.ceil((expiresAt - Date.now()) / 60000))
  if (minutes < 60) return `${minutes} 分钟后失效`
  if (minutes < 1440) return `${Math.ceil(minutes / 60)} 小时后失效`
  return `${Math.ceil(minutes / 1440)} 天后失效`
}

export function AccessSettings({ onClose }: { onClose: () => void }) {
  const [invites, setInvites] = useState<TemporaryInvite[]>([])
  const [duration, setDuration] = useState(1440)
  const [customHours, setCustomHours] = useState(12)
  const [useCustomDuration, setUseCustomDuration] = useState(false)
  const [label, setLabel] = useState('')
  const [created, setCreated] = useState<CreatedInvite | null>(null)
  const [copied, setCopied] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const durationMinutes = useMemo(
    () => useCustomDuration ? Math.round(Math.max(.1, Math.min(720, customHours)) * 60) : duration,
    [customHours, duration, useCustomDuration],
  )

  const load = async () => {
    const response = await fetch('/sample/admin-api/invites', { credentials: 'same-origin' })
    if (!response.ok) throw new Error('无法读取临时邀请码')
    const payload = await response.json() as { invites: TemporaryInvite[] }
    setInvites(payload.invites)
  }

  useEffect(() => { load().catch(() => setError('访问设置暂时不可用，请刷新后重试。')) }, [])

  const createInvite = async () => {
    setBusy(true)
    setError('')
    try {
      const response = await fetch('/sample/admin-api/invites', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: label.trim(), durationMinutes }),
      })
      if (!response.ok) throw new Error('生成失败')
      const payload = await response.json() as { invite: CreatedInvite }
      setCreated(payload.invite)
      setLabel('')
      setInvites((current) => [payload.invite, ...current])
    } catch {
      setError('临时邀请码生成失败，请稍后重试。')
    } finally {
      setBusy(false)
    }
  }

  const revokeInvite = async (id: string) => {
    setBusy(true)
    setError('')
    try {
      const response = await fetch(`/sample/admin-api/invites/${encodeURIComponent(id)}`, {
        method: 'DELETE', credentials: 'same-origin',
      })
      if (!response.ok) throw new Error('停用失败')
      await load()
      if (created?.id === id) setCreated(null)
    } catch {
      setError('邀请码停用失败，请稍后重试。')
    } finally {
      setBusy(false)
    }
  }

  const copyCode = async () => {
    if (!created) return
    await navigator.clipboard.writeText(created.code)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return <div className="access-settings-backdrop" role="presentation" onMouseDown={(event) => {
    if (event.target === event.currentTarget) onClose()
  }}>
    <section className="access-settings" role="dialog" aria-modal="true" aria-labelledby="access-settings-title">
      <header className="access-settings-header">
        <div><span>访问控制</span><h2 id="access-settings-title">临时邀请码</h2></div>
        <button type="button" onClick={onClose} aria-label="关闭访问设置">×</button>
      </header>

      <div className="access-settings-body">
        <section className="invite-create">
          <div className="invite-section-title"><div><h3>生成新邀请码</h3><p>访客只能在设定时间内访问组件库。</p></div></div>
          <label className="invite-field"><span>备注（可选）</span><input maxLength={80} value={label} onChange={(event) => setLabel(event.target.value)} placeholder="例如：客户评审 / 张三" /></label>
          <div className="invite-field"><span>有效时间</span><div className="invite-duration-grid">
            {durationOptions.map((option) => <button type="button" key={option.value} className={!useCustomDuration && duration === option.value ? 'is-active' : ''} onClick={() => { setDuration(option.value); setUseCustomDuration(false) }}>{option.label}</button>)}
            <button type="button" className={useCustomDuration ? 'is-active' : ''} onClick={() => setUseCustomDuration(true)}>自定义</button>
          </div></div>
          {useCustomDuration && <label className="invite-field invite-custom-duration"><span>小时数（最多 720 小时）</span><input type="number" min="0.1" max="720" step="0.5" value={customHours} onChange={(event) => setCustomHours(Number(event.target.value))} /></label>}
          <button className="invite-primary-action" type="button" disabled={busy} onClick={createInvite}>{busy ? '处理中…' : '生成临时邀请码'}</button>
          {error && <p className="invite-error" role="alert">{error}</p>}
        </section>

        {created && <section className="invite-result" aria-live="polite">
          <span>仅本次显示，请现在复制</span>
          <strong>{created.code}</strong>
          <div><p>{formatTime(created.expiresAt)} 失效 · {remaining(created.expiresAt)}</p><button type="button" onClick={copyCode}>{copied ? '已复制' : '复制邀请码'}</button></div>
        </section>}

        <section className="invite-list-section">
          <div className="invite-section-title"><div><h3>已生成的邀请码</h3><p>停用后，已经登录的访客也会立即失去访问权限。</p></div><span>{invites.filter((invite) => invite.active).length} 个有效</span></div>
          <div className="invite-list">
            {invites.length === 0 && <p className="invite-empty">还没有临时邀请码。</p>}
            {invites.map((invite) => <article className="invite-item" key={invite.id}>
              <div><strong>{invite.label || '未命名邀请'}</strong><span>{formatTime(invite.expiresAt)} 失效</span></div>
              <div><span className={`invite-status ${invite.active ? 'is-active' : ''}`}>{invite.active ? remaining(invite.expiresAt) : invite.revokedAt ? '已停用' : '已失效'}</span>{invite.active && <button type="button" disabled={busy} onClick={() => revokeInvite(invite.id)}>停用</button>}</div>
            </article>)}
          </div>
        </section>
      </div>
    </section>
  </div>
}
