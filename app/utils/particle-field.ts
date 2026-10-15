/**
 * Minimal WebGL point renderer for the hero ("from scattered to ordered").
 *
 * No Three.js: one vertex buffer of positions updated on the CPU (a few
 * thousand points is cheap), one tiny shader pair drawing soft round dots.
 * Each particle springs toward its target in the current formation and is
 * pushed away by the pointer, then eases back into place.
 *
 * The caller owns the lifecycle: start(), stop() when off screen, destroy().
 */
import { sampleFormation, scatter, type Formation } from './particle-shapes'

export interface FieldOptions {
  count: number
  /** CSS colors per formation; particles cross-fade between them. */
  colors: Record<Formation, string>
  /** Dot radius in CSS pixels. */
  size: number
}

const VERT = `
attribute vec2 a_pos;
attribute float a_seed;
uniform vec2 u_scale;
uniform float u_size;
uniform float u_dpr;
varying float v_seed;
void main() {
  v_seed = a_seed;
  gl_Position = vec4(a_pos * u_scale, 0.0, 1.0);
  gl_PointSize = u_size * u_dpr * (0.75 + a_seed * 0.5);
}`

const FRAG = `
precision mediump float;
uniform vec3 u_color;
uniform float u_alpha;
varying float v_seed;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  float a = smoothstep(0.5, 0.32, d);
  gl_FragColor = vec4(u_color, a * u_alpha * (0.62 + v_seed * 0.38));
}`

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!
  gl.shaderSource(s, src)
  gl.compileShader(s)
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'shader')
  return s
}

function parseColor(css: string): [number, number, number] {
  const m = css.match(/^#([0-9a-f]{6})$/i)
  if (!m) return [0.08, 0.08, 0.07]
  const n = parseInt(m[1]!, 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

export class ParticleField {
  private gl: WebGLRenderingContext
  private program: WebGLProgram
  private posBuffer: WebGLBuffer
  private pos: Float32Array
  private vel: Float32Array
  private target: Float32Array
  private formations = new Map<Formation, Float32Array>()
  private raf = 0
  private running = false
  private pointer = { x: 9, y: 9, active: false }
  private color: [number, number, number]
  private colorTarget: [number, number, number]
  private alpha = 0
  private uni: Record<string, WebGLUniformLocation | null> = {}
  private aspect = 1
  private dpr = 1

  constructor(
    private canvas: HTMLCanvasElement,
    private opts: FieldOptions,
  ) {
    const gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false, alpha: true })
    if (!gl) throw new Error('webgl unavailable')
    this.gl = gl

    const program = gl.createProgram()!
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT))
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(program)
    gl.useProgram(program)
    this.program = program
    for (const u of ['u_scale', 'u_size', 'u_dpr', 'u_color', 'u_alpha']) this.uni[u] = gl.getUniformLocation(program, u)

    const n = opts.count
    this.pos = scatter(n, 1.4).xy
    this.vel = new Float32Array(n * 2)
    this.target = scatter(n).xy

    this.posBuffer = gl.createBuffer()!
    gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, this.pos, gl.DYNAMIC_DRAW)
    const aPos = gl.getAttribLocation(program, 'a_pos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    const seeds = new Float32Array(n).map(() => Math.random())
    const seedBuffer = gl.createBuffer()!
    gl.bindBuffer(gl.ARRAY_BUFFER, seedBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, seeds, gl.STATIC_DRAW)
    const aSeed = gl.getAttribLocation(program, 'a_seed')
    gl.enableVertexAttribArray(aSeed)
    gl.vertexAttribPointer(aSeed, 1, gl.FLOAT, false, 0, 0)

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    this.color = parseColor(opts.colors.mi)
    this.colorTarget = [...this.color]
    this.resize()
  }

  resize() {
    const r = this.canvas.getBoundingClientRect()
    this.dpr = Math.min(window.devicePixelRatio || 1, 2)
    this.canvas.width = Math.max(1, Math.round(r.width * this.dpr))
    this.canvas.height = Math.max(1, Math.round(r.height * this.dpr))
    this.aspect = r.width / Math.max(1, r.height)
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height)
    // Fit the [-1,1] × [-0.65,0.65] formation space inside the canvas
    const fit = Math.min(1, this.aspect / 1.54) * 0.92
    this.gl.uniform2f(this.uni.u_scale!, fit, fit * this.aspect)
    this.gl.uniform1f(this.uni.u_dpr!, this.dpr)
    this.gl.uniform1f(this.uni.u_size!, this.opts.size)
    this.scale = [fit, fit * this.aspect]
  }

  private scale: [number, number] = [1, 1]

  private ensure(name: Formation) {
    let set = this.formations.get(name)
    if (!set) {
      set = sampleFormation(name, this.opts.count).xy
      this.formations.set(name, set)
    }
    return set
  }

  /** Sample the given formations ahead of time, one per idle period. */
  prepare(names: Formation[]) {
    const idle = (cb: () => void) =>
      'requestIdleCallback' in window ? requestIdleCallback(cb, { timeout: 2500 }) : setTimeout(cb, 200)
    const next = (i: number) => {
      if (i >= names.length) return
      idle(() => {
        this.ensure(names[i]!)
        next(i + 1)
      })
    }
    next(0)
  }

  /** Move every particle toward a formation. */
  form(name: Formation) {
    const set = this.ensure(name)
    this.target = set
    this.colorTarget = parseColor(this.opts.colors[name])
    // A small kick so the transition reads as particles leaving and regrouping
    for (let i = 0; i < this.vel.length; i++) this.vel[i]! += (Math.random() - 0.5) * 0.02
  }

  /** Pointer in client coordinates (or null when it leaves). */
  setPointer(clientX: number | null, clientY?: number) {
    if (clientX === null || clientY === undefined) {
      this.pointer.active = false
      return
    }
    const r = this.canvas.getBoundingClientRect()
    const nx = ((clientX - r.left) / r.width) * 2 - 1
    const ny = -(((clientY - r.top) / r.height) * 2 - 1)
    this.pointer.x = nx / this.scale[0]
    this.pointer.y = ny / this.scale[1]
    this.pointer.active = true
  }

  start() {
    if (this.running) return
    this.running = true
    let last = performance.now()
    const tick = (now: number) => {
      if (!this.running) return
      const dt = Math.min(2.5, (now - last) / 16.67)
      last = now
      this.step(dt)
      this.draw()
      this.raf = requestAnimationFrame(tick)
    }
    this.raf = requestAnimationFrame(tick)
  }

  stop() {
    this.running = false
    cancelAnimationFrame(this.raf)
  }

  private step(dt: number) {
    const { pos, vel, target, pointer } = this
    const n = this.opts.count
    const spring = 0.018 * dt
    const damping = Math.pow(0.86, dt)
    const r2 = 0.045
    const t = performance.now() * 0.001
    for (let i = 0; i < n; i++) {
      const ix = i * 2, iy = ix + 1
      // a whisper of drift so the settled shape still breathes
      const tx = target[ix]! + Math.sin(t * 0.8 + i) * 0.0025
      const ty = target[iy]! + Math.cos(t * 0.7 + i * 1.3) * 0.0025
      let vx = vel[ix]! + (tx - pos[ix]!) * spring
      let vy = vel[iy]! + (ty - pos[iy]!) * spring
      if (pointer.active) {
        const dx = pos[ix]! - pointer.x
        const dy = pos[iy]! - pointer.y
        const d2 = dx * dx + dy * dy
        if (d2 < r2) {
          const f = (1 - d2 / r2) * 0.012 * dt
          const d = Math.sqrt(d2) || 1
          vx += (dx / d) * f
          vy += (dy / d) * f
        }
      }
      vel[ix] = vx * damping
      vel[iy] = vy * damping
      pos[ix]! += vel[ix]! * dt
      pos[iy]! += vel[iy]! * dt
    }
    this.alpha = Math.min(1, this.alpha + 0.02 * dt)
    for (let k = 0; k < 3; k++) this.color[k]! += (this.colorTarget[k]! - this.color[k]!) * 0.06 * dt
  }

  private draw() {
    const gl = this.gl
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer)
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.pos)
    gl.uniform3f(this.uni.u_color!, this.color[0], this.color[1], this.color[2])
    gl.uniform1f(this.uni.u_alpha!, this.alpha)
    gl.drawArrays(gl.POINTS, 0, this.opts.count)
  }

  destroy() {
    this.stop()
    this.gl.getExtension('WEBGL_lose_context')?.loseContext()
  }
}
