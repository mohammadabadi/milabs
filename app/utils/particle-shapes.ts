/**
 * Target formations for the hero particle field. Each formation is a list of
 * points in a normalized space ([-1, 1] on x, height scaled by `aspect`).
 * Shapes are sampled from an offscreen canvas, so they are crisp and cheap.
 *
 * Formations tell the story of the page: scattered dots settle into order.
 *   - "mi":     the Mi prefix every product shares
 *   - "board":  MiDesk: columns of task cards (work in order)
 *   - "ring":   MiFin: a split ring chart (money in order)
 */
export type Formation = 'mi' | 'board' | 'ring'

export interface PointSet {
  /** x, y pairs in [-1, 1] space */
  xy: Float32Array
  count: number
}

const W = 400
const H = 260

function rasterize(draw: (ctx: CanvasRenderingContext2D) => void): ImageData {
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = '#fff'
  ctx.strokeStyle = '#fff'
  draw(ctx)
  return ctx.getImageData(0, 0, W, H)
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
  ctx.fill()
}

const drawers: Record<Formation, (ctx: CanvasRenderingContext2D) => void> = {
  mi(ctx) {
    ctx.font = '600 220px "Instrument Sans Variable", "Instrument Sans Fallback", Arial, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('Mi', W / 2 - 8, H / 2 + 12)
    // the accent dot over the i, drawn as a block like the logo
    roundRect(ctx, W / 2 + 92, 30, 30, 30, 4)
  },
  board(ctx) {
    // three kanban columns with cards of varied height
    const cols = [
      [38, 52, 30],
      [60, 34],
      [30, 46, 40],
    ]
    const colW = 92
    const gap = 24
    const x0 = (W - (colW * 3 + gap * 2)) / 2
    cols.forEach((cards, c) => {
      let y = 18
      const x = x0 + c * (colW + gap)
      roundRect(ctx, x, y, colW * 0.55, 8, 4) // column header
      y += 22
      for (const h of cards) {
        roundRect(ctx, x, y, colW, h, 8)
        y += h + 12
      }
    })
  },
  ring(ctx) {
    const cx = W / 2 - 64
    const cy = H / 2
    ctx.lineWidth = 30
    ctx.lineCap = 'butt'
    const segments: [number, number][] = [
      [-0.5, 0.62],
      [0.68, 1.12],
      [1.18, 1.42],
    ]
    for (const [a, b] of segments) {
      ctx.beginPath()
      ctx.arc(cx, cy, 76, a * Math.PI, b * Math.PI)
      ctx.stroke()
    }
    // three horizontal bars to the side: category split
    const bx = cx + 122
    ;[110, 76, 40].forEach((w, i) => roundRect(ctx, bx, cy - 48 + i * 38, w, 16, 8))
  },
}

/** Sample `count` points from a formation, evenly spread over its filled area. */
export function sampleFormation(name: Formation, count: number): PointSet {
  const img = rasterize(drawers[name])
  const filled: number[] = []
  const step = 3
  for (let y = 0; y < H; y += step) {
    for (let x = 0; x < W; x += step) {
      if (img.data[(y * W + x) * 4]! > 128) filled.push(x, y)
    }
  }
  const total = filled.length / 2
  const xy = new Float32Array(count * 2)
  for (let i = 0; i < count; i++) {
    // stratified pick with jitter, so dots cover the shape evenly
    const k = Math.min(total - 1, Math.floor(((i + Math.random()) / count) * total))
    const px = filled[k * 2]! + (Math.random() - 0.5) * step
    const py = filled[k * 2 + 1]! + (Math.random() - 0.5) * step
    xy[i * 2] = (px / W) * 2 - 1
    xy[i * 2 + 1] = -((py / H) * 2 - 1) * (H / W)
  }
  // Shuffle so neighbouring indices land in different places (nicer morphs)
  for (let i = count - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const ax = xy[i * 2]!, ay = xy[i * 2 + 1]!
    xy[i * 2] = xy[j * 2]!
    xy[i * 2 + 1] = xy[j * 2 + 1]!
    xy[j * 2] = ax
    xy[j * 2 + 1] = ay
  }
  return { xy, count }
}

/** Random scatter across the field: the "unordered" starting state. */
export function scatter(count: number, spread = 1.15): PointSet {
  const xy = new Float32Array(count * 2)
  for (let i = 0; i < count; i++) {
    xy[i * 2] = (Math.random() * 2 - 1) * spread
    xy[i * 2 + 1] = (Math.random() * 2 - 1) * spread * (H / W)
  }
  return { xy, count }
}
