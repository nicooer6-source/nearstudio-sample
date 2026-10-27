import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js'
import { Water } from 'three/examples/jsm/objects/Water.js'
import type { SampleProps, SampleParameterValues } from '../../../src/types'
import './style.css'

const assetRoot = `${import.meta.env.BASE_URL}assets/emotion-agency-memory-landscape`
const preview = `${assetRoot}/preview.jpg`
const sourceRoot = `${assetRoot}/source`

const numberValue = (parameters: SampleParameterValues, key: string, fallback: number) => {
  const value = Number(parameters[key])
  return Number.isFinite(value) ? value : fallback
}

const colorValue = (parameters: SampleParameterValues, key: string, fallback: string) => {
  const value = parameters[key]
  return typeof value === 'string' ? value : fallback
}

function seededRandom(seed = 90210) {
  let state = seed >>> 0
  return () => {
    state += 0x6d2b79f5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

function createGlowTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 128
  const context = canvas.getContext('2d')!
  const gradient = context.createRadialGradient(64, 64, 2, 64, 64, 62)
  gradient.addColorStop(0, 'rgba(255,242,255,.82)')
  gradient.addColorStop(.28, 'rgba(248,190,255,.38)')
  gradient.addColorStop(1, 'rgba(238,169,255,0)')
  context.fillStyle = gradient
  context.fillRect(0, 0, 128, 128)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function addClouds(scene: THREE.Scene, color: string) {
  const random = seededRandom(24)
  const texture = createGlowTexture()
  const material = new THREE.SpriteMaterial({ map: texture, color, transparent: true, opacity: .68, depthWrite: false })
  const clouds: THREE.Sprite[] = []
  for (let index = 0; index < 8; index += 1) {
    const cloud = new THREE.Sprite(material.clone())
    cloud.position.set(-10 + index * 3 + random() * 1.2, 4.6 + random() * 2.1, -9 - random() * 3)
    cloud.scale.set(6 + random() * 5, 2.2 + random() * 2.1, 1)
    scene.add(cloud)
    clouds.push(cloud)
  }
  return { clouds, texture }
}

function createGrass(color: string) {
  const random = seededRandom(317)
  const bladeGeometry = new THREE.PlaneGeometry(.026, .18, 1, 2)
  bladeGeometry.translate(0, .09, 0)
  const material = new THREE.MeshBasicMaterial({ color: '#ffffff', side: THREE.DoubleSide, transparent: true, opacity: .93, vertexColors: true })
  const count = 4200
  const grass = new THREE.InstancedMesh(bladeGeometry, material, count)
  grass.frustumCulled = false
  const dummy = new THREE.Object3D()
  const bankColor = new THREE.Color(color)
  const pale = new THREE.Color('#b985e4')
  for (let index = 0; index < count; index += 1) {
    const foreground = index < 1700
    let x: number
    let z: number
    x = (random() - .5) * 21
    z = foreground ? 6.2 + random() * 1.5 : -1.65 + random() * .85
    const scale = foreground ? .85 + random() * 1.15 : .46 + random() * .82
    dummy.position.set(x, -.54 + random() * .16, z)
    dummy.rotation.set((random() - .5) * .18, random() * Math.PI, (random() - .5) * .25)
    dummy.scale.set(.75 + random() * .7, scale, .75 + random() * .7)
    dummy.updateMatrix()
    grass.setMatrixAt(index, dummy.matrix)
    grass.setColorAt(index, bankColor.clone().lerp(pale, random() * .28))
  }
  grass.instanceMatrix.needsUpdate = true
  grass.instanceColor!.needsUpdate = true
  return grass
}

function createFloatingDust(color: string) {
  const random = seededRandom(7331)
  const count = 64
  const geometry = new THREE.TetrahedronGeometry(.035, 0)
  const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .76 })
  const group = new THREE.Group()
  const pieces: THREE.Mesh[] = []
  for (let index = 0; index < count; index += 1) {
    const piece = new THREE.Mesh(geometry, material)
    piece.position.set((random() - .5) * 18, random() * 6.4 - .2, (random() - .5) * 7)
    piece.rotation.set(random() * Math.PI, random() * Math.PI, random() * Math.PI)
    piece.scale.set(.55 + random() * 1.6, .7 + random() * 2.8, .55 + random() * 1.2)
    piece.userData.phase = random() * Math.PI * 2
    piece.userData.speed = .55 + random() * .7
    pieces.push(piece)
    group.add(piece)
  }
  const update = (time: number) => pieces.forEach((piece, index) => {
    piece.position.y -= .0024 * piece.userData.speed
    piece.position.x += Math.sin(time * .22 + piece.userData.phase) * .00065
    piece.rotation.x += .002 + (index % 3) * .0004
    piece.rotation.y -= .0016
    if (piece.position.y < -.75) piece.position.y = 6
  })
  return { group, update }
}

type ParticleSystem = {
  points: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>
  update: (time: number, pointer: THREE.Vector2, pressed: boolean, strength: number, speed: number) => void
}

function createLetterParticles(mesh: THREE.Mesh, count: number, accentColor: string): ParticleSystem {
  mesh.updateWorldMatrix(true, false)
  const sampler = new MeshSurfaceSampler(mesh).build()
  const random = seededRandom(9487)
  const positions = new Float32Array(count * 3)
  const targets = new Float32Array(count * 3)
  const velocities = new Float32Array(count * 3)
  const phases = new Float32Array(count)
  const sizes = new Float32Array(count)
  const sample = new THREE.Vector3()
  const center = new THREE.Vector3()
  const bounds = new THREE.Box3().setFromObject(mesh)
  bounds.getCenter(center)
  const size = bounds.getSize(new THREE.Vector3())
  for (let index = 0; index < count; index += 1) {
    sampler.sample(sample)
    mesh.localToWorld(sample)
    const x = (sample.x - center.x) / size.y * 3.05
    const y = (sample.y - center.y) / size.y * 3.05
    const z = (sample.z - center.z) / size.y * 3.05
    const offset = index * 3
    targets[offset] = x
    targets[offset + 1] = y
    targets[offset + 2] = z
    positions[offset] = x + (random() - .5) * .8
    positions[offset + 1] = y + (random() - .5) * .8
    positions[offset + 2] = z + (random() - .5) * .7
    phases[index] = random() * Math.PI * 2
    sizes[index] = .75 + random() * 1.45
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1))
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
    uniforms: {
      uTime: { value: 0 },
      uAccent: { value: new THREE.Color(accentColor) },
      uWhite: { value: new THREE.Color('#f6eaff') },
      uPointScale: { value: 1 },
    },
    vertexShader: `
      attribute float phase; attribute float aSize; uniform float uTime; uniform float uPointScale; varying float vMix;
      void main(){
        vec3 p=position; p.z+=sin(uTime*1.2+phase)*.025;
        vec4 mv=modelViewMatrix*vec4(p,1.0);
        gl_PointSize=(4.8+aSize*2.35)*uPointScale;
        gl_Position=projectionMatrix*mv;
        vMix=.32+.68*sin(phase*.71)*sin(phase*.71);
      }`,
    fragmentShader: `
      uniform vec3 uAccent; uniform vec3 uWhite; varying float vMix;
      void main(){
        vec2 uv=gl_PointCoord-.5; float d=length(uv);
        float alpha=smoothstep(.5,.1,d); float core=smoothstep(.21,0.,d);
        gl_FragColor=vec4(mix(uAccent,uWhite,clamp(.08+vMix*.62+core*.18,0.,.82)),alpha*(.72+core*.26));
      }`,
  })
  const points = new THREE.Points(geometry, material)
  points.position.set(0, 2.38, -1.15)
  const update = (time: number, pointer: THREE.Vector2, pressed: boolean, strength: number, speed: number) => {
    const radius = pressed ? 1.25 : .6
    const force = (pressed ? .22 : .045) * strength
    for (let index = 0; index < count; index += 1) {
      const offset = index * 3
      const px = positions[offset]
      const py = positions[offset + 1]
      const dx = px - pointer.x
      const dy = py - pointer.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      if (distance < radius) {
        const amount = (1 - distance / radius) * force
        const inv = 1 / Math.max(.04, distance)
        velocities[offset] += dx * inv * amount
        velocities[offset + 1] += dy * inv * amount
        velocities[offset + 2] += (pressed ? .045 : .012) * (1 - distance / radius)
      }
      velocities[offset] += (targets[offset] - px) * .018
      velocities[offset + 1] += (targets[offset + 1] - py) * .018
      velocities[offset + 2] += (targets[offset + 2] - positions[offset + 2]) * .018
      velocities[offset] *= .92
      velocities[offset + 1] *= .92
      velocities[offset + 2] *= .92
      positions[offset] += velocities[offset] * speed
      positions[offset + 1] += velocities[offset + 1] * speed
      positions[offset + 2] += velocities[offset + 2] * speed
    }
    ;(geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true
    material.uniforms.uTime.value = time
  }
  return { points, update }
}

async function mountScene(container: HTMLDivElement, parameters: SampleParameterValues) {
  const backgroundColor = colorValue(parameters, 'backgroundColor', '#b7a6e9')
  const accentColor = colorValue(parameters, 'accentColor', '#d654ff')
  const groundColor = colorValue(parameters, 'groundColor', '#6b438e')
  const scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(backgroundColor, .025 + numberValue(parameters, 'atmosphere', .72) * .022)
  const camera = new THREE.PerspectiveCamera(43, 1, .05, 90)
  camera.position.set(0, 1.55, 9.3)
  camera.lookAt(0, .8, 0)
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.65))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.06
  container.appendChild(renderer.domElement)

  const sky = new THREE.Mesh(new THREE.PlaneGeometry(40, 22), new THREE.MeshBasicMaterial({ color: backgroundColor }))
  sky.position.set(0, 3.2, -15)
  scene.add(sky)
  const { clouds, texture: cloudTexture } = addClouds(scene, '#f5cde2')
  scene.add(new THREE.HemisphereLight(0xf9e4ff, 0x31183f, 2.25))
  const sun = new THREE.DirectionalLight(0xfff4fb, 3.4)
  sun.position.set(-4, 9, 5)
  scene.add(sun)

  const root = new THREE.Group()
  scene.add(root)
  const draco = new DRACOLoader().setDecoderPath(`${sourceRoot}/draco/`)
  const loader = new GLTFLoader().setDRACOLoader(draco)
  const [letterGltf, mountainGltf] = await Promise.all([
    loader.loadAsync(`${sourceRoot}/models/e.glb`),
    loader.loadAsync(`${sourceRoot}/models/mountain.glb`),
  ])
  if (!container.isConnected) return () => draco.dispose()

  let letterMesh: THREE.Mesh | undefined
  letterGltf.scene.traverse((object) => { if (!letterMesh && object instanceof THREE.Mesh) letterMesh = object })
  if (!letterMesh) throw new Error('Emotion letter mesh could not be loaded')
  const particleCount = Math.round(numberValue(parameters, 'particleCount', 5800))
  const particleSystem = createLetterParticles(letterMesh, particleCount, accentColor)
  root.add(particleSystem.points)

  const mountain = mountainGltf.scene
  mountain.scale.set(.00272, .00272, .00062)
  mountain.position.set(-.05, -.62, -2.8)
  mountain.rotation.y = Math.PI
  mountain.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.material = new THREE.MeshStandardMaterial({ color: new THREE.Color(groundColor).multiplyScalar(.56), roughness: .94, flatShading: true, side: THREE.DoubleSide })
    }
  })
  root.add(mountain)

  const waterNormals = new THREE.TextureLoader().load(`${sourceRoot}/water/Water_1_M_Normal.jpg`, (texture) => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  })
  const water = new Water(new THREE.PlaneGeometry(34, 18), {
    textureWidth: 1024,
    textureHeight: 1024,
    waterNormals,
    sunDirection: sun.position.clone().normalize(),
    sunColor: 0x9d72c2,
    waterColor: new THREE.Color(groundColor).multiplyScalar(.72),
    distortionScale: 1.25,
    fog: true,
    alpha: .91,
  })
  water.rotation.x = -Math.PI / 2
  water.position.set(0, -.47, 4.3)
  root.add(water)
  const waterTint = new THREE.Mesh(
    new THREE.PlaneGeometry(34, 18),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(groundColor).multiplyScalar(.66), transparent: true, opacity: .24, depthWrite: false }),
  )
  waterTint.rotation.x = -Math.PI / 2
  waterTint.position.set(0, -.458, 4.3)
  root.add(waterTint)
  const grass = createGrass(new THREE.Color(groundColor).lerp(new THREE.Color('#ad78d2'), .44).getStyle())
  root.add(grass)
  const { group: dust, update: updateDust } = createFloatingDust(new THREE.Color(groundColor).multiplyScalar(.42).getStyle())
  root.add(dust)

  const pointer = new THREE.Vector2(20, 20)
  const eased = new THREE.Vector2()
  const neutralPointer = new THREE.Vector2()
  let pressed = false
  const setPointer = (event: PointerEvent) => {
    const rect = container.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    const y = -(((event.clientY - rect.top) / rect.height) * 2 - 1)
    pointer.set(x * 3.05, y * 2.22 + .1)
  }
  const move = (event: PointerEvent) => setPointer(event)
  const down = (event: PointerEvent) => { pressed = true; setPointer(event); container.setPointerCapture?.(event.pointerId) }
  const up = () => { pressed = false }
  const leave = () => { pressed = false; pointer.set(20, 20) }
  container.addEventListener('pointermove', move)
  container.addEventListener('pointerdown', down)
  container.addEventListener('pointerup', up)
  container.addEventListener('pointercancel', up)
  container.addEventListener('pointerleave', leave)

  const resize = () => {
    const width = Math.max(1, container.clientWidth)
    const height = Math.max(1, container.clientHeight)
    const aspect = width / height
    camera.aspect = aspect
    camera.position.z = aspect < .8 ? 11.8 : aspect < 1.2 ? 10.5 : 9.3
    camera.fov = aspect < .8 ? 49 : 43
    root.scale.setScalar(aspect < .8 ? .78 : aspect < 1.2 ? .9 : 1)
    root.position.y = aspect < .8 ? -.15 : 0
    camera.updateProjectionMatrix()
    renderer.setSize(width, height, false)
    particleSystem.points.material.uniforms.uPointScale.value = Math.min(1.25, Math.max(.78, width / 1200))
  }
  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(container)
  resize()

  const clock = new THREE.Clock()
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const parallax = numberValue(parameters, 'parallax', .62)
  const interactionStrength = numberValue(parameters, 'interactionStrength', 1)
  const waterWave = numberValue(parameters, 'waterWave', .58)
  let frame = 0
  const render = () => {
    const elapsed = clock.getElapsedTime()
    const speed = numberValue(parameters, 'driftSpeed', .72) * (reducedMotion ? .18 : 1)
    eased.lerp(pointer.x > 10 ? neutralPointer : pointer, .045)
    camera.position.x = eased.x * parallax * .11
    camera.position.y = 1.55 + eased.y * parallax * .065
    camera.lookAt(eased.x * parallax * .03, .8 + eased.y * parallax * .03, 0)
    particleSystem.update(elapsed * speed, pointer, pressed, interactionStrength, reducedMotion ? .24 : 1)
    updateDust(elapsed * speed)
    ;(water.material as THREE.ShaderMaterial).uniforms.time.value = elapsed * .22 * speed * waterWave
    clouds.forEach((cloud, index) => { cloud.position.x += Math.sin(elapsed * .05 + index) * .0007 })
    renderer.render(scene, camera)
    frame = requestAnimationFrame(render)
  }
  render()

  return () => {
    cancelAnimationFrame(frame)
    resizeObserver.disconnect()
    container.removeEventListener('pointermove', move)
    container.removeEventListener('pointerdown', down)
    container.removeEventListener('pointerup', up)
    container.removeEventListener('pointercancel', up)
    container.removeEventListener('pointerleave', leave)
    draco.dispose()
    waterNormals.dispose()
    cloudTexture.dispose()
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
        object.geometry?.dispose()
        const materials = Array.isArray(object.material) ? object.material : [object.material]
        materials.forEach((material) => material?.dispose())
      }
    })
    renderer.dispose()
    renderer.domElement.remove()
  }
}

export default function EmotionAgencyMemoryLandscape({ mode, parameters }: SampleProps) {
  const canvasHost = useRef<HTMLDivElement>(null)
  const showCopy = parameters.showCopy !== false && parameters.showCopy !== 'false'
  const textColor = colorValue(parameters, 'textColor', '#fffaf7')

  useEffect(() => {
    if (!canvasHost.current || mode === 'thumbnail') return
    let dispose: undefined | (() => void)
    let cancelled = false
    mountScene(canvasHost.current, parameters).then((cleanup) => {
      if (cancelled) cleanup?.()
      else dispose = cleanup
    }).catch((error) => console.error('Emotion landscape failed to mount', error))
    return () => { cancelled = true; dispose?.() }
  }, [mode, parameters])

  if (mode === 'thumbnail') {
    return <figure className="emotion-landscape emotion-landscape--thumbnail"><img src={preview} alt="Emotion Agency 粒子字母与紫色湖岸主视觉" /></figure>
  }

  return (
    <section className="emotion-landscape" style={{ '--emotion-text': textColor, '--emotion-bg': colorValue(parameters, 'backgroundColor', '#b7a6e9') } as React.CSSProperties}>
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
