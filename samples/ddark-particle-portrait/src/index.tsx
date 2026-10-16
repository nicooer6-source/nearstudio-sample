import { useEffect, useRef, type CSSProperties } from 'react'
import type { SampleProps } from '../../../src/types'
import './style.css'

type ParticleGroup = { shade: number; indices: number[] }

function numberParameter(value: unknown, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function ParticlePortrait({ parameters }: Pick<SampleProps, 'parameters'>) {
  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const host = hostRef.current
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!host || !canvas || !context) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const particleSize = numberParameter(parameters.particleSize, 2.5)
    const particleGap = numberParameter(parameters.particleGap, 7)
    const interactionRadius = numberParameter(parameters.interactionRadius, 120)
    const forceStrength = numberParameter(parameters.force, 5)
    const returnSpeed = numberParameter(parameters.returnSpeed, 0.08)
    const inkColor = typeof parameters.inkColor === 'string' ? parameters.inkColor : '#2a2926'
    const ink = [1, 3, 5].map((offset) => parseInt(inkColor.slice(offset, offset + 2), 16))
    const image = new Image()
    image.src = `${import.meta.env.BASE_URL}ddark-particle/portrait.webp`

    let frame = 0
    let running = false
    let visible = true
    let width = 0
    let height = 0
    let count = 0
    let x = new Float32Array()
    let y = new Float32Array()
    let homeX = new Float32Array()
    let homeY = new Float32Array()
    let velocityX = new Float32Array()
    let velocityY = new Float32Array()
    let groups: ParticleGroup[] = []
    const pointer = { x: -1000, y: -1000 }

    const draw = () => {
      context.clearRect(0, 0, width, height)
      for (const group of groups) {
        const shade = group.shade / 194
        context.fillStyle = `rgb(${Math.round(ink[0] * shade)}, ${Math.round(ink[1] * shade)}, ${Math.round(ink[2] * shade)})`
        context.beginPath()
        for (const index of group.indices) {
          context.moveTo(x[index] + particleSize, y[index])
          context.arc(x[index], y[index], particleSize, 0, Math.PI * 2)
        }
        context.fill()
      }
    }

    const update = () => {
      const pointerActive = pointer.x > -500
      let moving = false
      for (let index = 0; index < count; index += 1) {
        let px = x[index]
        let py = y[index]
        let vx = velocityX[index]
        let vy = velocityY[index]

        if (pointerActive) {
          const dx = pointer.x - px
          const dy = pointer.y - py
          if (Math.abs(dx) < interactionRadius && Math.abs(dy) < interactionRadius) {
            const distanceSquared = dx * dx + dy * dy
            if (distanceSquared > 0.001 && distanceSquared < interactionRadius * interactionRadius) {
              const distance = Math.sqrt(distanceSquared)
              const force = (interactionRadius - distance) / interactionRadius
              vx -= (dx / distance) * force * forceStrength
              vy -= (dy / distance) * force * forceStrength
            }
          }
        }

        vx += (homeX[index] - px) * returnSpeed
        vy += (homeY[index] - py) * returnSpeed
        vx *= 0.85
        vy *= 0.85
        px += vx
        py += vy
        x[index] = px
        y[index] = py
        velocityX[index] = vx
        velocityY[index] = vy
        if (Math.abs(vx) > 0.05 || Math.abs(vy) > 0.05 || Math.abs(homeX[index] - px) > 0.1 || Math.abs(homeY[index] - py) > 0.1) moving = true
      }
      return moving || pointerActive
    }

    const animate = () => {
      if (!running) return
      const shouldContinue = update()
      draw()
      if (shouldContinue && visible) frame = requestAnimationFrame(animate)
      else running = false
    }

    const wake = () => {
      if (reducedMotion || !visible || running) return
      running = true
      frame = requestAnimationFrame(animate)
    }

    const build = () => {
      if (!image.naturalWidth || !image.naturalHeight) return
      width = host.clientWidth
      height = host.clientHeight
      if (!width || !height) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(dpr, 0, 0, dpr, 0, 0)

      const source = document.createElement('canvas')
      source.width = canvas.width
      source.height = canvas.height
      const sourceContext = source.getContext('2d', { willReadFrequently: true })
      if (!sourceContext) return
      const scale = Math.min(source.width / image.naturalWidth, source.height / image.naturalHeight)
      const drawWidth = image.naturalWidth * scale
      const drawHeight = image.naturalHeight * scale
      sourceContext.save()
      sourceContext.translate(source.width, 0)
      sourceContext.scale(-1, 1)
      sourceContext.drawImage(image, (source.width - drawWidth) / 2, (source.height - drawHeight) / 2, drawWidth, drawHeight)
      sourceContext.restore()
      const pixels = sourceContext.getImageData(0, 0, source.width, source.height)
      const density = Math.max(1, Math.floor(particleGap * dpr))
      const points: Array<{ x: number; y: number; shade: number }> = []
      for (let sy = 0; sy < pixels.height; sy += density) {
        for (let sx = 0; sx < pixels.width; sx += density) {
          const pixel = (sy * pixels.width + sx) * 4
          if (pixels.data[pixel + 3] > 128) {
            const luminance = Math.round((pixels.data[pixel] * 0.3 + pixels.data[pixel + 1] * 0.59 + pixels.data[pixel + 2] * 0.11) / 18) * 18
            points.push({ x: sx / dpr, y: sy / dpr, shade: Math.max(32, Math.min(194, luminance)) })
          }
        }
      }

      count = points.length
      x = new Float32Array(count)
      y = new Float32Array(count)
      homeX = new Float32Array(count)
      homeY = new Float32Array(count)
      velocityX = new Float32Array(count)
      velocityY = new Float32Array(count)
      const grouped = new Map<number, number[]>()
      points.forEach((point, index) => {
        homeX[index] = point.x
        homeY[index] = point.y
        x[index] = reducedMotion ? point.x : point.x + (Math.random() - 0.5) * 8
        y[index] = reducedMotion ? point.y : point.y + (Math.random() - 0.5) * 8
        velocityX[index] = reducedMotion ? 0 : (Math.random() - 0.5) * 2
        velocityY[index] = reducedMotion ? 0 : (Math.random() - 0.5) * 2
        const bucket = grouped.get(point.shade) ?? []
        bucket.push(index)
        grouped.set(point.shade, bucket)
      })
      groups = [...grouped].map(([shade, indices]) => ({ shade, indices }))
      draw()
      wake()
    }

    const setPointer = (clientX: number, clientY: number) => {
      const bounds = canvas.getBoundingClientRect()
      pointer.x = clientX - bounds.left
      pointer.y = clientY - bounds.top
      wake()
    }
    const onMouseMove = (event: MouseEvent) => setPointer(event.clientX, event.clientY)
    const onTouchMove = (event: TouchEvent) => {
      if (event.touches[0]) setPointer(event.touches[0].clientX, event.touches[0].clientY)
    }
    const clearPointer = () => {
      pointer.x = -1000
      pointer.y = -1000
      wake()
    }

    const resizeObserver = new ResizeObserver(build)
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting)
      if (visible) wake()
      else cancelAnimationFrame(frame)
    }, { rootMargin: '50px' })

    image.addEventListener('load', build)
    canvas.addEventListener('mousemove', onMouseMove, { passive: true })
    canvas.addEventListener('mouseleave', clearPointer, { passive: true })
    canvas.addEventListener('touchstart', onTouchMove, { passive: true })
    canvas.addEventListener('touchmove', onTouchMove, { passive: true })
    canvas.addEventListener('touchend', clearPointer, { passive: true })
    resizeObserver.observe(host)
    intersectionObserver.observe(canvas)

    return () => {
      cancelAnimationFrame(frame)
      image.removeEventListener('load', build)
      canvas.removeEventListener('mousemove', onMouseMove)
      canvas.removeEventListener('mouseleave', clearPointer)
      canvas.removeEventListener('touchstart', onTouchMove)
      canvas.removeEventListener('touchmove', onTouchMove)
      canvas.removeEventListener('touchend', clearPointer)
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
    }
  }, [parameters])

  return <div ref={hostRef} className="ddark-particle-field"><canvas ref={canvasRef} aria-label="Dmitrii Dark portrait rendered as interactive particles" /></div>
}

export default function DdarkParticlePortrait({ mode, parameters }: SampleProps) {
  const style = {
    '--paper': typeof parameters.paperColor === 'string' ? parameters.paperColor : '#e5e3dc',
    '--ink': typeof parameters.inkColor === 'string' ? parameters.inkColor : '#2a2926',
    '--vermilion': typeof parameters.accentColor === 'string' ? parameters.accentColor : '#e14d2a',
  } as CSSProperties
  return (
    <section className={`ddark-hero ddark-hero--${mode}`} style={style} aria-label="DDARK 首页像素肖像互动演示">
      <div className="ddark-media">
        <span className="ddark-disc" aria-hidden="true" />
        <ParticlePortrait parameters={parameters} />
        <small>[ FIG. 01 — PARTICLE STUDY ]</small>
      </div>
      <div className="ddark-copy">
        <h1>DMITRII<br />DARK<span>.</span></h1>
        <h2>CREATIVE DEVELOPER</h2>
        {mode !== 'thumbnail' && (
          <>
            <p>Freelance creative developer and web designer — I design and build singular websites: art direction, creative code, typographic systems in React, Next.js and Astro. No templates, no themes.</p>
            <a href="https://ddark.dev/" target="_blank" rel="noreferrer">CONTACT <span>↗</span></a>
            <div className="ddark-scroll"><i /> SCROLL TO EXPLORE</div>
          </>
        )}
      </div>
    </section>
  )
}
