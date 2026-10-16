import { useEffect, useRef } from 'react'
import type { SampleParameterValues } from '../types'
import {
  HalfFloatType,
  LinearFilter,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  RGBAFormat,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  Vector4,
  WebGLRenderTarget,
  WebGLRenderer,
} from 'three'

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`

const fluidShader = `
uniform vec2 iResolution;
uniform vec4 iMouse;
uniform int iFrame;
uniform sampler2D iPreviousFrame;
uniform float uBrushSize;
uniform float uBrushStrength;
uniform float uFluidDecay;
uniform float uTrailLength;
uniform float uStopDecay;
varying vec2 vUv;
vec2 ur, U;
float ln(vec2 p, vec2 a, vec2 b) { return length(p-a-(b-a)*clamp(dot(p-a,b-a)/dot(b-a,b-a),0.,1.)); }
vec4 t(vec2 v, int a, int b) { return texture2D(iPreviousFrame, fract((v+vec2(float(a),float(b)))/ur)); }
vec4 t(vec2 v) { return texture2D(iPreviousFrame, fract(v/ur)); }
float area(vec2 a, vec2 b, vec2 c) { float A=length(b-c),B=length(c-a),C=length(a-b),s=.5*(A+B+C); return sqrt(max(0.,s*(s-A)*(s-B)*(s-C))); }
void main() {
  U=vUv*iResolution; ur=iResolution.xy;
  if(iFrame<1){ float w=.5+sin(.2*U.x)*.5; float q=length(U-.5*ur); gl_FragColor=vec4(.1*exp(-.001*q*q),0.,0.,w); }
  else {
    vec2 v=U,A=v+vec2(1.,1.),B=v+vec2(1.,-1.),C=v+vec2(-1.,1.),D=v+vec2(-1.,-1.);
    for(int i=0;i<5;i++){v-=t(v).xy;A-=t(A).xy;B-=t(B).xy;C-=t(C).xy;D-=t(D).xy;}
    vec4 me=t(v),n=t(v,0,1),e=t(v,1,0),s=t(v,0,-1),w=t(v,-1,0); vec4 ne=.25*(n+e+s+w);
    me=mix(t(v),ne,vec4(.15,.15,.95,0.)); me.z-=.01*((area(A,B,C)+area(B,C,D))-4.);
    vec4 pr=vec4(e.z,w.z,n.z,s.z); me.xy+=100.*vec2(pr.x-pr.y,pr.z-pr.w)/ur; me.xy*=uFluidDecay; me.z*=uTrailLength;
    if(iMouse.z>0.){ vec2 mousePos=iMouse.xy,mousePrev=iMouse.zw,mouseVel=mousePos-mousePrev; float valMagnitude=length(mouseVel); float q=ln(U,mousePos,mousePrev); vec2 m=mousePos-mousePrev; float l=length(m); if(l>0.)m=min(1.,10.)*m/l; float falloff=exp(-(1e-4/uBrushSize)*q*q*q); falloff=pow(falloff,.5); me.xyw+=(.03*uBrushStrength)*falloff*vec3(m,10.); if(valMagnitude<2.){float distToCursor=length(U-mousePos);float influence=exp(-distToCursor*.01);float cursorDecay=mix(1.,uStopDecay,influence);me.xy*=cursorDecay;me.z*=cursorDecay;}}
    gl_FragColor=clamp(me,-.4,.4);
  }
}`

const colorShader = `
uniform float iTime;
uniform vec2 iResolution;
uniform sampler2D iFluid;
uniform float uDistortionAmount;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform vec3 uColor4;
uniform float uColorIntensity;
uniform float uSoftness;
varying vec2 vUv;
void main(){
  vec2 fragCoord=vUv*iResolution; vec4 fluid=texture2D(iFluid,vUv); vec2 fluidVel=fluid.xy;
  float mr=min(iResolution.x,iResolution.y); vec2 uv=(fragCoord*2.-iResolution.xy)/mr; uv+=fluidVel*(.5*uDistortionAmount);
  float d=-iTime*.1; float a=0.; for(float i=0.;i<8.;i++){a+=cos(i-d-a*uv.x);d+=sin(uv.y*i+a);} d+=iTime*.1;
  float mixer1=cos(uv.x*d)*.5+.5,mixer2=cos(uv.y*a)*.5+.5,mixer3=sin(d+a)*.5+.5; float smoothAmount=clamp(uSoftness*.1,0.,.9);
  mixer1=mix(mixer1,.5,smoothAmount);mixer2=mix(mixer2,.5,smoothAmount);mixer3=mix(mixer3,.5,smoothAmount);
  vec3 col=mix(uColor1,uColor2,mixer1);col=mix(col,uColor3,mixer2);col=mix(col,uColor4,mixer3*.4);col*=uColorIntensity;gl_FragColor=vec4(col,1.);
}`

const color = (hex: string) => new Vector3(
  parseInt(hex.slice(1, 3), 16) / 255,
  parseInt(hex.slice(3, 5), 16) / 255,
  parseInt(hex.slice(5, 7), 16) / 255,
)

const numeric = (values: SampleParameterValues, key: string, fallback: number) => typeof values[key] === 'number' ? values[key] as number : fallback
const colorValue = (values: SampleParameterValues, key: string, fallback: string) => typeof values[key] === 'string' ? values[key] as string : fallback

export function NewStudioFluid({ interactive = true, className = '', parameters = {} }: { interactive?: boolean; className?: string; parameters?: SampleParameterValues }) {
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    let width = Math.max(1, host.clientWidth)
    let height = Math.max(1, host.clientHeight)
    const scene = new Scene()
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1)
    const renderer = new WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'high-performance', stencil: false, depth: false })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.setSize(width, height)
    renderer.autoClear = false
    host.appendChild(renderer.domElement)

    const targetOptions = { minFilter: LinearFilter, magFilter: LinearFilter, format: RGBAFormat, type: HalfFloatType }
    let current = new WebGLRenderTarget(width, height, targetOptions)
    let previous = new WebGLRenderTarget(width, height, targetOptions)
    const geometry = new PlaneGeometry(2, 2)
    const fluidMaterial = new ShaderMaterial({ vertexShader, fragmentShader: fluidShader, uniforms: {
      iResolution: { value: new Vector2(width, height) }, iMouse: { value: new Vector4(0, 0, 0, 0) }, iFrame: { value: 0 }, iPreviousFrame: { value: null },
      uBrushSize: { value: numeric(parameters, 'brushSize', 30) }, uBrushStrength: { value: numeric(parameters, 'brushStrength', 2) }, uFluidDecay: { value: .98 }, uTrailLength: { value: numeric(parameters, 'trail', .8) }, uStopDecay: { value: .85 },
    } })
    const colorMaterial = new ShaderMaterial({ vertexShader, fragmentShader: colorShader, uniforms: {
      iTime: { value: 0 }, iResolution: { value: new Vector2(width, height) }, iFluid: { value: null }, uDistortionAmount: { value: numeric(parameters, 'distortion', 1) },
      uColor1: { value: color(colorValue(parameters, 'color1', '#002651')) }, uColor2: { value: color(colorValue(parameters, 'color2', '#9CC7FF')) }, uColor3: { value: color(colorValue(parameters, 'color3', '#0000F8')) }, uColor4: { value: color('#459AFF') },
      uColorIntensity: { value: 1 }, uSoftness: { value: 1 },
    } })
    const fluidMesh = new Mesh(geometry, fluidMaterial)
    const colorMesh = new Mesh(geometry, colorMaterial)
    let x = 0, y = 0, previousX = 0, previousY = 0, lastMove = 0, frame = 0, raf = 0
    const move = (event: PointerEvent) => {
      if (!interactive) return
      const rect = host.getBoundingClientRect()
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) return
      previousX = x; previousY = y; x = event.clientX - rect.left; y = rect.height - (event.clientY - rect.top); lastMove = performance.now()
      fluidMaterial.uniforms.iMouse.value.set(x, y, previousX, previousY)
    }
    const leave = () => fluidMaterial.uniforms.iMouse.value.set(0, 0, 0, 0)
    const resize = () => {
      width = Math.max(1, host.clientWidth); height = Math.max(1, host.clientHeight); renderer.setSize(width, height)
      fluidMaterial.uniforms.iResolution.value.set(width, height); colorMaterial.uniforms.iResolution.value.set(width, height)
      current.setSize(width, height); previous.setSize(width, height); frame = 0
    }
    const observer = new ResizeObserver(resize)
    observer.observe(host)
    window.addEventListener('pointermove', move)
    document.addEventListener('mouseleave', leave)
    const render = () => {
      raf = requestAnimationFrame(render)
      const now = performance.now()
      colorMaterial.uniforms.iTime.value = now * .001
      fluidMaterial.uniforms.iFrame.value = frame
      if (now - lastMove > 100) fluidMaterial.uniforms.iMouse.value.set(0, 0, 0, 0)
      fluidMaterial.uniforms.iPreviousFrame.value = previous.texture
      renderer.setRenderTarget(current); renderer.render(fluidMesh, camera)
      renderer.setRenderTarget(null); renderer.clear(); colorMaterial.uniforms.iFluid.value = current.texture; renderer.render(colorMesh, camera)
      const swap = current; current = previous; previous = swap; frame += 1
    }
    render()
    return () => {
      cancelAnimationFrame(raf); observer.disconnect(); window.removeEventListener('pointermove', move); document.removeEventListener('mouseleave', leave)
      renderer.dispose(); current.dispose(); previous.dispose(); geometry.dispose(); fluidMaterial.dispose(); colorMaterial.dispose(); host.removeChild(renderer.domElement)
    }
  }, [interactive, parameters])

  return <div ref={hostRef} className={className} aria-hidden="true" />
}
