import { c as jsx, n as initReactDom, r as createRoot } from './react.D20wc1Tc.js'
import { n as initSand, t as Sand } from './Sand.DuQ_Qcwl.js'

initSand()
initReactDom()

const defaults = Object.freeze({
  particleSize: 0.055,
  maxParticles: 60000,
  mouseRadius: 1.2,
  repulsion: 0.15,
  returnSpeed: 0.01,
  friction: 0.8,
  background: '#f5f5f5',
})

const ranges = {
  particleSize: [0.01, 0.2],
  maxParticles: [5000, 100000],
  mouseRadius: [0.5, 5],
  repulsion: [0.05, 1],
  returnSpeed: [0.01, 0.5],
  friction: [0.5, 0.99],
}

const root = createRoot(document.getElementById('sand-root'))
const imageFile = new URL('./creation-of-adam.webp', import.meta.url).href
let current = { ...defaults }
let renderTimer = 0

function numberValue(value, fallback, range) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return fallback
  return Math.min(range[1], Math.max(range[0], parsed))
}

function colorValue(value, fallback) {
  if (typeof value !== 'string') return fallback
  return /^#[0-9a-f]{6}$/i.test(value) ? value : fallback
}

function sanitize(parameters = {}) {
  return {
    particleSize: numberValue(parameters.particleSize, defaults.particleSize, ranges.particleSize),
    maxParticles: Math.round(numberValue(parameters.maxParticles, defaults.maxParticles, ranges.maxParticles)),
    mouseRadius: numberValue(parameters.mouseRadius, defaults.mouseRadius, ranges.mouseRadius),
    repulsion: numberValue(parameters.repulsion, defaults.repulsion, ranges.repulsion),
    returnSpeed: numberValue(parameters.returnSpeed, defaults.returnSpeed, ranges.returnSpeed),
    friction: numberValue(parameters.friction, defaults.friction, ranges.friction),
    background: colorValue(parameters.background, defaults.background),
  }
}

function render() {
  document.documentElement.style.setProperty('--background', current.background)
  root.render(jsx(Sand, {
    enable3D: true,
    mediaType: 'Image',
    imageFile,
    mediaScale: 1,
    objectFit: 'Cover',
    cropZoom: 1,
    cropOffsetX: 0,
    cropOffsetY: 0,
    useMediaColors: true,
    invertColors: false,
    followTheme: false,
    darkPixelsOnly: false,
    darkThreshold: 0.3,
    loopVideo: false,
    sandColor: '#000000',
    particleSize: current.particleSize,
    maxParticles: current.maxParticles,
    mouseRadius: current.mouseRadius,
    repulsion: current.repulsion,
    returnSpeed: current.returnSpeed,
    friction: current.friction,
    sharedCanvasZIndex: 2,
  }))
}

function scheduleRender(parameters) {
  current = sanitize(parameters)
  document.documentElement.style.setProperty('--background', current.background)
  clearTimeout(renderTimer)
  renderTimer = window.setTimeout(render, 120)
}

window.addEventListener('message', (event) => {
  if (event.origin !== window.location.origin) return
  if (event.data?.type !== 'nearstudio:aeterna-config') return
  scheduleRender(event.data.parameters)
})

render()
