import { useEffect, useRef } from 'react'
import type { SampleProps } from '../../../src/types'
import './style.css'

type ParticleGroup = { shade: number; indices: number[] }

function ParticlePortrait() {
  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const host = hostRef.current
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!host || !canvas || !context) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
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
        context.fillStyle = `rgb(${group.shade}, ${group.shade}, ${group.shade})`
        context.beginPath()
        for (const index of group.indices) {
          context.moveTo(x[index] + 2.5, y[index])
          context.arc(x[index], y[index], 2.5, 0, Math.PI * 2)
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
          if (Math.abs(dx) < 120 && Math.abs(dy) < 120) {
            const distanceSquared = dx * dx + dy * dy
            if (distanceSquared > 0.001 && distanceSquared < 14400) {
              const distance = Math.sqrt(distanceSquared)
              const force = (120 - distance) / 120
              vx -= (dx / distance) * force * 5
              vy -= (dy / distance) * force * 5
            }
          }
        }

        vx += (homeX[index] - px) * 0.08
        vy += (homeY[index] - py) * 0.08
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
      const density = Math.max(1, Math.floor(7 * dpr))
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
  }, [])

  return <div ref={hostRef} className="ddark-particle-field"><canvas ref={canvasRef} aria-label="Dmitrii Dark portrait rendered as interactive particles" /></div>
}

export default function DdarkParticlePortrait({ mode }: SampleProps) {
  return (
    <section className={`ddark-hero ddark-hero--${mode}`} aria-label="DDARK 首页像素肖像互动演示">
      <div className="ddark-media">
        <span className="ddark-disc" aria-hidden="true" />
        <ParticlePortrait />
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
