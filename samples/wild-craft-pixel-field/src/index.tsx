import { useEffect, useRef, type CSSProperties } from 'react'
import type { SampleProps } from '../../../src/types'
import './style.css'

type Wave = { x: number; y: number; startedAt: number; power: number }

function numberParameter(value: unknown, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function stringParameter(value: unknown, fallback: string) {
  return typeof value === 'string' ? value : fallback
}

function hash(x: number, y: number, seed: number) {
  const value = Math.sin(x * 127.1 + y * 311.7 + seed * 0.13) * 43758.5453
  return value - Math.floor(value)
}

function PixelField({ parameters }: Pick<SampleProps, 'parameters'>) {
  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const host = hostRef.current
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!host || !canvas || !context) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const cell = numberParameter(parameters.cellSize, 9)
    const brush = numberParameter(parameters.brushSize, 92)
    const density = numberParameter(parameters.fieldDensity, 0.72)
    const speed = reducedMotion ? 0 : numberParameter(parameters.motionSpeed, 0.55)
    const trail = numberParameter(parameters.trail, 0.88)
    const colors = [
      stringParameter(parameters.navy, '#1c2541'),
      stringParameter(parameters.blue, '#3b5bd9'),
      stringParameter(parameters.yellow, '#f5c518'),
      stringParameter(parameters.red, '#e0492a'),
    ]
    const neon = stringParameter(parameters.neon, '#d8ff00')
    const seed = 263.7
    let frame = 0
    let width = 0
    let height = 0
    let columns = 0
    let rows = 0
    let heat = new Float32Array()
    let time = 0
    let previous = performance.now()
    let visible = true
    const pointer = { x: -1000, y: -1000, active: false, downAt: 0 }
    const waves: Wave[] = []

    const resize = () => {
      width = host.clientWidth
      height = host.clientHeight
      if (!width || !height) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      columns = Math.ceil(width / cell) + 1
      rows = Math.ceil(height / cell) + 1
      heat = new Float32Array(columns * rows)
    }

    const noise = (nx: number, ny: number, tick: number) => {
      const warpedX = nx + Math.sin(ny * 5 + tick * 0.5 + seed) * 0.05
      const warpedY = ny + Math.cos(warpedX * 5 - tick * 0.4) * 0.05
      const value = Math.sin(warpedX * 5.6 + seed * 1.3 + tick * 0.3) * Math.cos(warpedY * 4.7 - seed * 0.7 + tick * 0.22)
        + Math.sin((warpedX * 1.4 + warpedY * 1.7) * 4.1 - seed + tick * 0.16)
        + Math.sin(warpedY * 9 + seed * 2.1 + warpedX * 3) * 0.5
      return 0.5 + 0.5 * (value / 2.25)
    }

    const deposit = (x: number, y: number, amount: number, radius: number) => {
      const minColumn = Math.max(0, Math.floor((x - radius) / cell))
      const maxColumn = Math.min(columns - 1, Math.ceil((x + radius) / cell))
      const minRow = Math.max(0, Math.floor((y - radius) / cell))
      const maxRow = Math.min(rows - 1, Math.ceil((y + radius) / cell))
      const radiusSquared = radius * radius
      for (let row = minRow; row <= maxRow; row += 1) {
        for (let column = minColumn; column <= maxColumn; column += 1) {
          const dx = (column + 0.5) * cell - x
          const dy = (row + 0.5) * cell - y
          const distanceSquared = dx * dx + dy * dy
          if (distanceSquared >= radiusSquared) continue
          const force = 1 - Math.sqrt(distanceSquared) / radius
          const index = row * columns + column
          heat[index] = Math.max(heat[index], amount * force * force)
        }
      }
    }

    const draw = (now: number) => {
      const delta = Math.min(40, now - previous)
      previous = now
      time += delta * speed
      for (let index = 0; index < heat.length; index += 1) heat[index] *= trail
      if (pointer.active) deposit(pointer.x, pointer.y, 1, brush)

      for (let index = waves.length - 1; index >= 0; index -= 1) {
        const wave = waves[index]
        const age = (now - wave.startedAt) / 1000
        if (age > 1.45) {
          waves.splice(index, 1)
          continue
        }
        const radius = age * Math.hypot(width, height) * 0.78
        const thickness = cell * (3 + wave.power * 2)
        const minColumn = Math.max(0, Math.floor((wave.x - radius - thickness) / cell))
        const maxColumn = Math.min(columns - 1, Math.ceil((wave.x + radius + thickness) / cell))
        const minRow = Math.max(0, Math.floor((wave.y - radius - thickness) / cell))
        const maxRow = Math.min(rows - 1, Math.ceil((wave.y + radius + thickness) / cell))
        for (let row = minRow; row <= maxRow; row += 1) {
          for (let column = minColumn; column <= maxColumn; column += 1) {
            const distance = Math.hypot((column + 0.5) * cell - wave.x, (row + 0.5) * cell - wave.y)
            const ring = Math.exp(-((distance - radius) ** 2) / (2 * thickness * thickness)) * (1 - age / 1.45) * wave.power
            const cellIndex = row * columns + column
            heat[cellIndex] = Math.max(heat[cellIndex], ring)
          }
        }
      }

      context.clearRect(0, 0, width, height)
      context.fillStyle = '#ffffff'
      context.fillRect(0, 0, width, height)
      context.strokeStyle = '#eeeeec'
      context.lineWidth = 1
      context.beginPath()
      for (let x = 0; x <= width; x += cell) {
        context.moveTo(x + 0.5, 0)
        context.lineTo(x + 0.5, height)
      }
      for (let y = 0; y <= height; y += cell) {
        context.moveTo(0, y + 0.5)
        context.lineTo(width, y + 0.5)
      }
      context.stroke()

      const tick = time * 0.001
      const pixel = Math.max(1, cell - 1)
      for (let row = 0; row < rows; row += 1) {
        const ny = row * cell / Math.max(1, height)
        const centralOpening = Math.exp(-(((ny - 0.84) / 0.22) ** 2))
        for (let column = 0; column < columns; column += 1) {
          const nx = column * cell / Math.max(1, width)
          const h = hash(column, row, seed)
          const cloud = noise(nx, ny, tick) + Math.sin(nx * 10 - ny * 5 + tick) * 0.08
          const edgeWeight = Math.min(1, Math.abs(nx - 0.54) * 2.8 + 0.22)
          let value = cloud * density * edgeWeight - centralOpening * (0.38 + (1 - edgeWeight) * 0.45) + (h - 0.5) * 0.2
          const activeHeat = heat[row * columns + column]
          if (activeHeat > 0.035) value = Math.max(value, 0.95 + activeHeat * 0.25)
          if (value < 0.29) continue
          let color = colors[0]
          if (value >= 0.43) color = colors[1]
          if (value >= 0.59) color = colors[2]
          if (value >= 0.76) color = colors[3]
          if (activeHeat > 0.12) color = neon
          context.fillStyle = color
          context.fillRect(column * cell, row * cell, pixel, pixel)
        }
      }
      if (visible && !reducedMotion) frame = requestAnimationFrame(draw)
    }

    const setPointer = (clientX: number, clientY: number) => {
      const bounds = canvas.getBoundingClientRect()
      pointer.x = clientX - bounds.left
      pointer.y = clientY - bounds.top
      pointer.active = true
    }
    const onPointerMove = (event: PointerEvent) => setPointer(event.clientX, event.clientY)
    const onPointerLeave = () => { pointer.active = false }
    const onPointerDown = (event: PointerEvent) => {
      setPointer(event.clientX, event.clientY)
      pointer.downAt = performance.now()
    }
    const onPointerUp = (event: PointerEvent) => {
      setPointer(event.clientX, event.clientY)
      const power = Math.min(2.4, 0.75 + (performance.now() - pointer.downAt) / 700)
      waves.push({ x: pointer.x, y: pointer.y, startedAt: performance.now(), power })
    }

    resize()
    if (reducedMotion) draw(performance.now())
    else frame = requestAnimationFrame(draw)
    const resizeObserver = new ResizeObserver(resize)
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      const nextVisible = Boolean(entry?.isIntersecting)
      if (nextVisible && !visible && !reducedMotion) {
        previous = performance.now()
        frame = requestAnimationFrame(draw)
      }
      visible = nextVisible
      if (!visible) cancelAnimationFrame(frame)
    }, { rootMargin: '100px' })
    resizeObserver.observe(host)
    intersectionObserver.observe(canvas)
    canvas.addEventListener('pointermove', onPointerMove, { passive: true })
    canvas.addEventListener('pointerleave', onPointerLeave, { passive: true })
    canvas.addEventListener('pointerdown', onPointerDown, { passive: true })
    canvas.addEventListener('pointerup', onPointerUp, { passive: true })

    return () => {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerleave', onPointerLeave)
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointerup', onPointerUp)
    }
  }, [parameters])

  return <div ref={hostRef} className="wild-pixel-field"><canvas ref={canvasRef} aria-label="Wild interactive color pixel field" /></div>
}

export default function WildCraftPixelField({ mode, parameters }: SampleProps) {
  const style = {
    '--wild-neon': stringParameter(parameters.neon, '#d8ff00'),
  } as CSSProperties
  return (
    <section className={`wild-craft wild-craft--${mode}`} style={style} aria-label="Wild Craft Engineered 首页像素互动演示">
      <div className="wild-craft__headline">
        <h1><span>CRAFT,</span><span>ENGINEERED.</span></h1>
        <div className="wild-craft__meta">
          <h2><span>A DESIGN &amp; TECHNOLOGY</span><span>PARTNER FOR MODERN BRANDS</span></h2>
          <div>
            <b aria-label="Wild logo">W</b>
            <p>Award-winning websites, apps, and digital content, built with craft and AI.</p>
          </div>
        </div>
      </div>
      <PixelField parameters={parameters} />
      <div className="wild-craft__intro">
        <p>A short point of view from us on what actually changed in how we work and how the parts that matter didn't change at all. But first, here's some work:</p>
      </div>
    </section>
  )
}
