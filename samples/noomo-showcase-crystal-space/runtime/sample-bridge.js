(() => {
  const search = new URLSearchParams(window.location.search)
  if (search.get('sample') !== '1') return

  const enabled = (key, fallback) => {
    const value = search.get(key)
    return value === null ? fallback : value === 'true' || value === '1'
  }

  if (!enabled('showNavigation', false)) {
    const style = document.createElement('style')
    style.textContent = 'header{display:none!important}'
    document.head.appendChild(style)
  }

  if (!enabled('audio', false)) {
    const mute = () => document.querySelectorAll('audio,video').forEach((media) => {
      media.muted = true
      media.volume = 0
    })
    mute()
    new MutationObserver(mute).observe(document.documentElement, { childList: true, subtree: true })
  }

})()
