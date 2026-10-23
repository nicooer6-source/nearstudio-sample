import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react'
import type { SampleParameterValues, SampleProps } from '../../../src/types'
import './style.css'

const assetRoot = `${import.meta.env.BASE_URL}assets/driezie-development-reel/`

const projects = [
  { name: 'Energie Wonen', image: 'energie-wonen.jpg' },
  { name: 'Segab Engineering', image: 'segab.jpg' },
  { name: 'Lurpak', image: 'lurpak.jpg' },
  { name: 'Louis van Gelder', image: 'louis-van-gelder.jpg' },
  { name: 'Kernhem Pannenkoekenboerderij', image: 'kernhem.jpg' },
  { name: 'Petticoat', image: 'petticoat.jpg' },
  { name: 'Kachelhuus', image: 'kachelhuus.jpg' },
]

const reelProjects = [...projects, ...projects, ...projects]

const numberValue = (parameters: SampleParameterValues, key: string, fallback: number) => {
  const value = parameters[key]
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

const colorValue = (parameters: SampleParameterValues, key: string, fallback: string) => {
  const value = parameters[key]
  return typeof value === 'string' ? value : fallback
}

const booleanValue = (parameters: SampleParameterValues, key: string, fallback: boolean) => {
  const value = parameters[key]
  return typeof value === 'boolean' ? value : fallback
}

type DragState = {
  pointerId: number
  startX: number
  lastX: number
  lastAt: number
  velocity: number
  origin: number
}

export default function DriezieDevelopmentReel({ mode, parameters }: SampleProps) {
  const cardWidth = numberValue(parameters, 'cardWidth', 469)
  const gap = numberValue(parameters, 'gap', 32)
  const duration = numberValue(parameters, 'motionDuration', 0.65)
  const momentum = numberValue(parameters, 'dragMomentum', 150)
  const showContext = booleanValue(parameters, 'showContext', true)
  const reelRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<DragState | null>(null)
  const [itemWidth, setItemWidth] = useState(cardWidth)
  const [index, setIndex] = useState(projects.length)
  const [translate, setTranslate] = useState(0)
  const [animate, setAnimate] = useState(false)
  const [dragging, setDragging] = useState(false)

  const step = itemWidth + gap

  const settleAt = useCallback((nextIndex: number, withMotion = true) => {
    setAnimate(withMotion)
    setIndex(nextIndex)
    setTranslate(-nextIndex * step)
  }, [step])

  useLayoutEffect(() => {
    const reel = reelRef.current
    if (!reel) return
    const measure = () => {
      const responsiveWidth = Math.min(cardWidth, Math.max(250, reel.clientWidth * (mode === 'thumbnail' ? 0.72 : 0.62)))
      setItemWidth(responsiveWidth)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(reel)
    return () => observer.disconnect()
  }, [cardWidth, mode])

  useLayoutEffect(() => {
    setAnimate(false)
    setTranslate(-index * step)
  }, [index, step])

  const move = useCallback((direction: number) => {
    settleAt(index + direction)
  }, [index, settleAt])

  const normalize = () => {
    if (index >= projects.length * 2) settleAt(index - projects.length, false)
    if (index < projects.length) settleAt(index + projects.length, false)
  }

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (mode === 'thumbnail') return
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      lastX: event.clientX,
      lastAt: performance.now(),
      velocity: 0,
      origin: translate,
    }
    setAnimate(false)
    setDragging(true)
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    const now = performance.now()
    const elapsed = Math.max(8, now - drag.lastAt)
    drag.velocity = (event.clientX - drag.lastX) / elapsed
    drag.lastX = event.clientX
    drag.lastAt = now
    setTranslate(drag.origin + event.clientX - drag.startX)
  }

  const finishDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    const distance = event.clientX - drag.startX
    const projected = distance + drag.velocity * momentum
    let shift = Math.round(-projected / step)
    if (shift === 0 && Math.abs(distance) > step * 0.16) shift = distance < 0 ? 1 : -1
    shift = Math.max(-2, Math.min(2, shift))
    dragRef.current = null
    setDragging(false)
    settleAt(index + shift)
  }

  useEffect(() => {
    if (mode === 'thumbnail') return
    const onVisibility = () => {
      if (document.hidden && dragRef.current) {
        dragRef.current = null
        setDragging(false)
        settleAt(index)
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [index, mode, settleAt])

  const style = {
    '--driezie-card-width': `${itemWidth}px`,
    '--driezie-gap': `${gap}px`,
    '--driezie-duration': `${duration}s`,
    '--driezie-paper': colorValue(parameters, 'paperColor', '#f4f2ed'),
    '--driezie-ink': colorValue(parameters, 'inkColor', '#18191a'),
    '--driezie-accent': colorValue(parameters, 'accentColor', '#df9568'),
  } as CSSProperties

  return (
    <main className={`driezie-stage driezie-stage--${mode}`} style={style}>
      {showContext && mode !== 'thumbnail' && (
        <section className="driezie-context" aria-label="Service context">
          <span className="driezie-kicker"><i />04</span>
          <p>Design systems and component libraries</p>
          <p className="driezie-context__lead">Whether you are launching something new or making an existing product work better for more people, we would love to help.</p>
        </section>
      )}

      <section className="driezie-development" aria-labelledby="driezie-development-title">
        <header className="driezie-development__header">
          <h1 id="driezie-development-title"><i />In development</h1>
          {mode !== 'thumbnail' && (
            <div className="driezie-development__controls" aria-label="Development projects navigation">
              <button type="button" aria-label="Previous project" onClick={() => move(-1)}>←</button>
              <button type="button" aria-label="Next project" onClick={() => move(1)}>→</button>
            </div>
          )}
        </header>

        <div
          className={`driezie-reel${dragging ? ' is-dragging' : ''}`}
          ref={reelRef}
          role="region"
          aria-label="Projects in development"
          aria-roledescription="carousel"
          tabIndex={mode === 'thumbnail' ? -1 : 0}
          onKeyDown={(event) => {
            if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1) }
            if (event.key === 'ArrowRight') { event.preventDefault(); move(1) }
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={finishDrag}
          onPointerCancel={finishDrag}
        >
          <span className="driezie-reel__hint">Drag the strip, or focus it and use the arrow keys.</span>
          <ul
            className="driezie-reel__track"
            onTransitionEnd={normalize}
            style={{ transform: `translate3d(${translate}px,0,0)`, transitionDuration: animate ? `${duration}s` : '0s' }}
          >
            {reelProjects.map((project, projectIndex) => (
              <li className="driezie-project" key={`${project.image}-${projectIndex}`} aria-hidden={projectIndex < projects.length || projectIndex >= projects.length * 2}>
                <img src={`${assetRoot}${project.image}`} alt={`${project.name}, in development`} draggable={false} />
                <footer><span>{project.name}</span><span>Coming soon</span></footer>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {showContext && mode !== 'thumbnail' && (
        <section className="driezie-contact" aria-label="Contact context">
          <span className="driezie-kicker"><i />Contact</span>
          <p>Have something to build?</p>
          <p>Let us make it work for everyone.</p>
        </section>
      )}
    </main>
  )
}
