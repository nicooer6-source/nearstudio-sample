import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import type { SampleProps, SampleParameterValues } from '../../../src/types'
import './style.css'

const preview = `${import.meta.env.BASE_URL}assets/emotion-agency-memory-landscape/preview.jpg`

const numberValue = (parameters: SampleParameterValues, key: string, fallback: number) => {
  const value = Number(parameters[key])
  return Number.isFinite(value) ? value : fallback
}

const colorValue = (parameters: SampleParameterValues, key: string, fallback: string) => {
  const value = parameters[key]
  return typeof value === 'string' ? value : fallback
}

function createParticleRing(count: number, color: string) {
  const geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(count * 3)
  const phases = new Float32Array(count)
  for (let index = 0; index < count; index += 1) {
    const theta = Math.random() * Math.PI * 2
    const radial = 0.94 + (Math.random() - 0.5) * 0.34
    const tube = (Math.random() - 0.5) * 0.48
    const wobble = Math.sin(theta * 3) * 0.09
    positions[index * 3] = Math.cos(theta) * (radial + tube * 0.24)
    positions[index * 3 + 1] = Math.sin(theta) * (radial + tube * 0.24) + wobble
    positions[index * 3 + 2] = tube + (Math.random() - 0.5) * 0.16
    phases[index] = Math.random() * Math.PI * 2
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1))
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uPointSize: { value: 0.14 },
      uOpacity: { value: 1 },
    },
    vertexShader: `
      attribute float phase;
      uniform float uTime;
      uniform float uPointSize;
      varying float vGlow;
      void main() {
        vec3 p = position;
        float shimmer = sin(uTime * 1.7 + phase) * 0.045;
        p += normalize(p + vec3(0.001)) * shimmer;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = uPointSize * (280.0 / max(1.0, -mv.z));
        gl_Position = projectionMatrix * mv;
        vGlow = 0.66 + sin(phase + uTime * 2.0) * 0.34;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform float uOpacity;
      varying float vGlow;
      void main() {
        vec2 uv = gl_PointCoord - 0.5;
        float circle = smoothstep(0.5, 0.06, length(uv));
        float core = smoothstep(0.24, 0.0, length(uv));
        gl_FragColor = vec4(mix(uColor, vec3(1.0, 0.82, 1.0), core * 0.42), circle * vGlow * uOpacity);
      }
    `,
  })
  const points = new THREE.Points(geometry, material)
  points.position.set(0.1, 1.05, -0.15)
  points.scale.setScalar(1.18)
  return { points, material }
}

function createWater(color: string) {
  const geometry = new THREE.PlaneGeometry(24, 10, 96, 40)
  const material = new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
      uTime: { value: 0 },
      uWave: { value: 0.55 },
      uColor: { value: new THREE.Color(color) },
      uPointer: { value: new THREE.Vector2() },
    },
    vertexShader: `
      uniform float uTime;
      uniform float uWave;
      uniform vec2 uPointer;
      varying vec2 vUv;
      varying float vLift;
      void main() {
        vUv = uv;
        vec3 p = position;
        float waveA = sin(p.x * 1.8 + uTime * 0.9) * 0.022;
        float waveB = cos(p.y * 2.4 - uTime * 0.7) * 0.018;
        float pointerWave = exp(-distance(uv, uPointer * 0.15 + vec2(0.5)) * 5.0) * 0.035;
        p.z += (waveA + waveB + pointerWave) * uWave;
        vLift = p.z;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uColor;
      varying vec2 vUv;
      varying float vLift;
      void main() {
        float bands = sin((vUv.x * 22.0 + vUv.y * 9.0) + uTime * 0.7) * 0.5 + 0.5;
        float horizon = smoothstep(0.05, 0.95, vUv.y);
        vec3 deep = uColor * vec3(0.56, 0.42, 0.72);
        vec3 pale = mix(uColor, vec3(0.94, 0.87, 1.0), 0.58);
        vec3 finalColor = mix(deep, pale, horizon * 0.72 + bands * 0.11 + vLift * 2.0);
        gl_FragColor = vec4(finalColor, 0.97);
      }
    `,
  })
  const water = new THREE.Mesh(geometry, material)
  water.rotation.x = -Math.PI / 2
  water.position.set(0, -0.66, 2.6)
  return { water, material }
}

function mountScene(container: HTMLDivElement, parameters: SampleParameterValues) {
  const scene = new THREE.Scene()
  const backgroundColor = colorValue(parameters, 'backgroundColor', '#b8a5ef')
  const accentColor = colorValue(parameters, 'accentColor', '#bc4dff')
  const groundColor = colorValue(parameters, 'groundColor', '#5f2d81')
  scene.background = new THREE.Color(backgroundColor)
  scene.fog = new THREE.FogExp2(backgroundColor, 0.055 + numberValue(parameters, 'atmosphere', 0.72) * 0.08)

  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 80)
  camera.position.set(0, 1.35, 7.2)
  camera.lookAt(0, 0.1, 0)

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  container.appendChild(renderer.domElement)

  const ambient = new THREE.HemisphereLight(0xf4ddff, 0x32153f, 2.4)
  scene.add(ambient)
  const key = new THREE.DirectionalLight(0xffffff, 3.2)
  key.position.set(-3, 6, 5)
  scene.add(key)

  const terrainMaterial = new THREE.MeshStandardMaterial({ color: groundColor, roughness: 0.9, flatShading: true })
  const bank = new THREE.Mesh(new THREE.PlaneGeometry(28, 5, 42, 10), terrainMaterial)
  const bankPositions = bank.geometry.attributes.position as THREE.BufferAttribute
  for (let index = 0; index < bankPositions.count; index += 1) {
    const x = bankPositions.getX(index)
    const y = bankPositions.getY(index)
    bankPositions.setZ(index, Math.sin(x * 0.9) * 0.06 + Math.cos(y * 1.7) * 0.05 + (Math.random() - 0.5) * 0.09)
  }
  bankPositions.needsUpdate = true
  bank.rotation.x = -Math.PI / 2
  bank.position.set(0, -0.62, -1.9)
  scene.add(bank)

  const rockMaterial = new THREE.MeshStandardMaterial({ color: new THREE.Color(groundColor).multiplyScalar(0.62), roughness: 1, flatShading: true })
  const rocks = new THREE.Group()
  for (let index = 0; index < 36; index += 1) {
    const size = 0.22 + Math.random() * 0.35
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(size, 0), rockMaterial)
    rock.scale.set(0.8 + Math.random(), 0.45 + Math.random() * 0.7, 0.72 + Math.random())
    rock.position.set((index / 35 - 0.5) * 18 + (Math.random() - 0.5) * 0.35, -0.38 + size * 0.3, -0.35 + (Math.random() - 0.5) * 0.55)
    rock.rotation.set(Math.random(), Math.random(), Math.random())
    rocks.add(rock)
  }
  scene.add(rocks)

  const { points: ring, material: ringMaterial } = createParticleRing(Math.round(numberValue(parameters, 'particleCount', 4200)), accentColor)
  scene.add(ring)
  const innerGlow = new THREE.PointLight(accentColor, 24, 7, 1.7)
  innerGlow.position.copy(ring.position)
  scene.add(innerGlow)

  const { water, material: waterMaterial } = createWater(backgroundColor)
  waterMaterial.uniforms.uWave.value = numberValue(parameters, 'waterWave', 0.55)
  scene.add(water)

  const debrisMaterial = new THREE.MeshStandardMaterial({ color: new THREE.Color(groundColor).multiplyScalar(0.52), roughness: 0.7, flatShading: true })
  const debris: THREE.Mesh[] = []
  const debrisGeometry = new THREE.TetrahedronGeometry(0.055, 0)
  for (let index = 0; index < 42; index += 1) {
    const piece = new THREE.Mesh(debrisGeometry, debrisMaterial)
    piece.scale.setScalar(0.55 + Math.random() * 1.8)
    piece.position.set((Math.random() - 0.5) * 16, Math.random() * 5.8 - 0.2, (Math.random() - 0.5) * 6)
    piece.userData.speed = 0.25 + Math.random() * 0.8
    piece.userData.spin = (Math.random() - 0.5) * 0.8
    debris.push(piece)
    scene.add(piece)
  }

  const reflection = ring.clone()
  reflection.material = ringMaterial.clone()
  ;(reflection.material as THREE.ShaderMaterial).uniforms = THREE.UniformsUtils.clone(ringMaterial.uniforms)
  reflection.scale.set(1.18, -0.62, 1.18)
  reflection.position.set(0.1, -1.52, 0.15)
  ;(reflection.material as THREE.ShaderMaterial).uniforms.uOpacity.value = 0.18
  scene.add(reflection)

  const pointer = new THREE.Vector2()
  const easedPointer = new THREE.Vector2()
  const parallax = numberValue(parameters, 'parallax', 0.7)
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const move = (event: PointerEvent) => {
    const rect = container.getBoundingClientRect()
    pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -(((event.clientY - rect.top) / rect.height) * 2 - 1))
  }
  const leave = () => pointer.set(0, 0)
  container.addEventListener('pointermove', move)
  container.addEventListener('pointerleave', leave)

  const resize = () => {
    const width = Math.max(1, container.clientWidth)
    const height = Math.max(1, container.clientHeight)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height, false)
  }
  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(container)
  resize()

  const clock = new THREE.Clock()
  let frame = 0
  const render = () => {
    const elapsed = clock.getElapsedTime()
    const speed = numberValue(parameters, 'driftSpeed', 0.65) * (reducedMotion ? 0.2 : 1)
    easedPointer.lerp(pointer, 0.045)
    camera.position.x = easedPointer.x * parallax * 0.42
    camera.position.y = 1.35 + easedPointer.y * parallax * 0.22
    camera.lookAt(easedPointer.x * parallax * 0.11, 0.12 + easedPointer.y * parallax * 0.08, 0)
    ring.rotation.y = elapsed * speed * 0.24 + easedPointer.x * parallax * 0.18
    ring.rotation.x = easedPointer.y * parallax * -0.12
    reflection.rotation.copy(ring.rotation)
    ringMaterial.uniforms.uTime.value = elapsed * speed
    ;(reflection.material as THREE.ShaderMaterial).uniforms.uTime.value = elapsed * speed
    waterMaterial.uniforms.uTime.value = elapsed * speed
    waterMaterial.uniforms.uPointer.value.copy(easedPointer)
    debris.forEach((piece, index) => {
      piece.position.y -= 0.0035 * speed * piece.userData.speed
      piece.position.x += Math.sin(elapsed * 0.32 + index) * 0.0018 * speed
      piece.rotation.x += 0.006 * speed * piece.userData.spin
      piece.rotation.y += 0.009 * speed * piece.userData.spin
      if (piece.position.y < -0.8) piece.position.y = 5.8
    })
    renderer.render(scene, camera)
    frame = requestAnimationFrame(render)
  }
  render()

  return () => {
    cancelAnimationFrame(frame)
    resizeObserver.disconnect()
    container.removeEventListener('pointermove', move)
    container.removeEventListener('pointerleave', leave)
    renderer.dispose()
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
        object.geometry?.dispose()
        const materials = Array.isArray(object.material) ? object.material : [object.material]
        materials.forEach((material) => material?.dispose())
      }
    })
    renderer.domElement.remove()
  }
}

export default function EmotionAgencyMemoryLandscape({ mode, parameters }: SampleProps) {
  const canvasHost = useRef<HTMLDivElement>(null)
  const showCopy = parameters.showCopy !== false && parameters.showCopy !== 'false'
  const textColor = colorValue(parameters, 'textColor', '#fffaf7')

  useEffect(() => {
    if (!canvasHost.current || mode === 'thumbnail') return
    return mountScene(canvasHost.current, parameters)
  }, [mode, parameters])

  if (mode === 'thumbnail') {
    return <figure className="emotion-landscape emotion-landscape--thumbnail"><img src={preview} alt="Emotion Agency 紫色粒子湖岸主视觉" /></figure>
  }

  return (
    <section className="emotion-landscape" style={{ '--emotion-text': textColor } as React.CSSProperties}>
      <div ref={canvasHost} className="emotion-landscape__canvas" aria-hidden="true" />
      {showCopy && (
        <div className="emotion-landscape__copy">
          <p className="emotion-landscape__eyebrow">Award-winning websites and digital<br />products for the brands of tomorrow</p>
          <h1><em>Where</em><span>Ambitious ideas<br />become interfaces<br />people remember</span></h1>
        </div>
      )}
      <span className="emotion-landscape__orb" aria-hidden="true" />
    </section>
  )
}
