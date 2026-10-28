(() => {
  const search = new URLSearchParams(window.location.search)
  if (search.get('sample') !== '1') return

  const enabled = (key, fallback) => {
    const value = search.get(key)
    return value === null ? fallback : value === 'true' || value === '1'
  }

  if (!enabled('showNavigation', false)) {
    const style = document.createElement('style')
    style.textContent = '.header{display:none!important}'
    document.head.appendChild(style)
  }

  if (!enabled('autoEnter', true)) return

  const label = enabled('audio', false) ? 'Enter with audio' : 'Enter without audio'
  const startedAt = Date.now()
  const timer = window.setInterval(() => {
    const button = [...document.querySelectorAll('button')].find((item) => item.textContent?.trim() === label)
    if (button) {
      window.clearInterval(timer)
      button.click()
    } else if (Date.now() - startedAt > 20000) {
      window.clearInterval(timer)
    }
  }, 160)
})()
