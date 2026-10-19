(() => {
  const script = document.currentScript
  const runtimeBase = new URL('./runner/', script?.src || 'https://nearstudio.art/sample/embed.js')

  const readParameters = (element) => {
    const parameters = {}
    const serialized = element.getAttribute('params')

    if (serialized) {
      try {
        Object.assign(parameters, JSON.parse(serialized))
      } catch (error) {
        console.warn('[Nearstudio Sample] Ignored invalid params JSON.', error)
      }
    }

    for (const attribute of element.attributes) {
      if (!attribute.name.startsWith('p-')) continue
      const key = attribute.name.slice(2)
      const value = attribute.value
      parameters[key] = value === 'true' ? true : value === 'false' ? false : value !== '' && Number.isFinite(Number(value)) ? Number(value) : value
    }

    return parameters
  }

  class NearstudioComponent extends HTMLElement {
    static get observedAttributes() {
      return ['component', 'state', 'theme', 'params', 'height', 'aspect-ratio']
    }

    connectedCallback() {
      if (!this.shadowRoot) {
        const shadow = this.attachShadow({ mode: 'open' })
        const style = document.createElement('style')
        style.textContent = ':host{display:block;width:100%;min-height:240px}iframe{display:block;width:100%;height:100%;border:0;background:#0f0f10}'
        this.frame = document.createElement('iframe')
        this.frame.loading = this.getAttribute('loading') || 'lazy'
        this.frame.allow = 'fullscreen'
        shadow.append(style, this.frame)
      }
      this.render()
    }

    attributeChangedCallback() {
      if (this.isConnected) this.render()
    }

    render() {
      const component = this.getAttribute('component')
      if (!component || !this.frame) return

      const height = this.getAttribute('height')
      const ratio = this.getAttribute('aspect-ratio')
      this.style.height = height ? /^\d+$/.test(height) ? `${height}px` : height : ''
      this.style.aspectRatio = height ? '' : ratio || '16 / 9'

      const url = new URL(runtimeBase)
      url.searchParams.set('component', component)
      url.searchParams.set('state', this.getAttribute('state') || 'default')
      url.searchParams.set('theme', this.getAttribute('theme') || 'dark')
      url.searchParams.set('mode', 'standalone')
      for (const [key, value] of Object.entries(readParameters(this))) {
        url.searchParams.set(`p.${key}`, String(value))
      }

      this.frame.title = this.getAttribute('title') || `Nearstudio component: ${component}`
      if (this.frame.src !== url.toString()) this.frame.src = url.toString()
    }
  }

  if (!customElements.get('nearstudio-component')) {
    customElements.define('nearstudio-component', NearstudioComponent)
  }
})()
