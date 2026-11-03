import { formatINR } from '@/utils/currency'

export interface SavingsCardData {
  name: string
  monthLabel: string
  saved: number
  goal: number
  percentOfGoal: number
  headline: string
  topSources: Array<{ label: string; saved: number }>
}

const WIDTH = 1200
const HEIGHT = 630

/** Greedy word wrap; canvas has no built-in text layout. */
function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = []
  let line = ''
  for (const word of text.split(' ')) {
    const candidate = line ? `${line} ${word}` : word
    if (ctx.measureText(candidate).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = candidate
    }
  }
  if (line) lines.push(line)
  return lines
}

/**
 * Draws the shareable savings summary straight onto a canvas, so the PNG looks identical in
 * every browser and needs no screenshot library. Every number is already computed by the
 * backend; this only lays it out.
 */
export function drawSavingsCard(data: SavingsCardData): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  const scale = 2
  canvas.width = WIDTH * scale
  canvas.height = HEIGHT * scale
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas is not supported in this browser.')
  ctx.scale(scale, scale)

  const font = (weight: number, size: number) =>
    `${weight} ${size}px Inter, "Segoe UI", system-ui, sans-serif`

  // Background: the brand gradient with two soft highlights.
  const bg = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT)
  bg.addColorStop(0, '#0f766e')
  bg.addColorStop(1, '#155e75')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, WIDTH, HEIGHT)

  ctx.fillStyle = 'rgba(255,255,255,0.06)'
  ctx.beginPath()
  ctx.arc(WIDTH - 120, 90, 260, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(140, HEIGHT + 40, 220, 0, Math.PI * 2)
  ctx.fill()

  // Brand row.
  ctx.fillStyle = 'rgba(255,255,255,0.16)'
  ctx.beginPath()
  ctx.roundRect(64, 56, 48, 48, 12)
  ctx.fill()
  ctx.fillStyle = '#ffffff'
  ctx.font = font(800, 22)
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'center'
  ctx.fillText('₹', 88, 81)
  ctx.textAlign = 'left'
  ctx.font = font(700, 26)
  ctx.fillText('BachelorBuddy', 128, 80)

  ctx.fillStyle = 'rgba(255,255,255,0.75)'
  ctx.font = font(500, 20)
  ctx.textAlign = 'right'
  ctx.fillText(data.monthLabel, WIDTH - 64, 80)
  ctx.textAlign = 'left'

  // Headline number.
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = 'rgba(255,255,255,0.8)'
  ctx.font = font(500, 26)
  ctx.fillText(`${data.name} saved`, 64, 196)

  ctx.fillStyle = '#ffffff'
  ctx.font = font(800, 104)
  ctx.fillText(formatINR(data.saved), 60, 304)

  ctx.fillStyle = 'rgba(255,255,255,0.8)'
  ctx.font = font(500, 24)
  ctx.fillText(`${data.percentOfGoal}% of a ${formatINR(data.goal)} monthly goal`, 64, 352)

  // Goal bar.
  const barX = 64
  const barY = 384
  const barW = 620
  ctx.fillStyle = 'rgba(255,255,255,0.18)'
  ctx.beginPath()
  ctx.roundRect(barX, barY, barW, 14, 7)
  ctx.fill()
  ctx.fillStyle = '#6ee7b7'
  ctx.beginPath()
  ctx.roundRect(barX, barY, Math.max(14, (barW * Math.min(100, data.percentOfGoal)) / 100), 14, 7)
  ctx.fill()

  // Headline sentence.
  ctx.fillStyle = 'rgba(255,255,255,0.88)'
  ctx.font = font(500, 22)
  wrap(ctx, data.headline, 620)
    .slice(0, 2)
    .forEach((line, index) => ctx.fillText(line, 64, 452 + index * 32))

  // Where it came from.
  const panelX = 760
  const panelY = 150
  ctx.fillStyle = 'rgba(255,255,255,0.1)'
  ctx.beginPath()
  ctx.roundRect(panelX, panelY, 376, 330, 20)
  ctx.fill()

  ctx.fillStyle = 'rgba(255,255,255,0.7)'
  ctx.font = font(600, 16)
  ctx.fillText('WHERE THE SAVINGS CAME FROM', panelX + 28, panelY + 44)

  data.topSources.slice(0, 5).forEach((source, index) => {
    const y = panelY + 96 + index * 52
    ctx.fillStyle = '#ffffff'
    ctx.font = font(500, 22)
    ctx.textAlign = 'left'
    ctx.fillText(source.label, panelX + 28, y)
    ctx.font = font(700, 22)
    ctx.textAlign = 'right'
    ctx.fillText(formatINR(source.saved), panelX + 348, y)
    ctx.textAlign = 'left'
  })

  // Footer.
  ctx.fillStyle = 'rgba(255,255,255,0.65)'
  ctx.font = font(500, 18)
  ctx.fillText('Spend less on everything, without thinking about it.', 64, HEIGHT - 52)

  return canvas
}

export async function downloadSavingsCard(data: SavingsCardData): Promise<void> {
  // Wait for Inter so the PNG never renders in a fallback font on first click.
  if ('fonts' in document) {
    try {
      await Promise.all([
        document.fonts.load('800 104px Inter'),
        document.fonts.load('500 22px Inter'),
      ])
    } catch {
      // Font loading failed (offline) — the system font fallback is fine.
    }
  }

  const canvas = drawSavingsCard(data)
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
  if (!blob) throw new Error('Could not create the image.')

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `bachelorbuddy-savings-${data.monthLabel.toLowerCase().replace(/\s+/g, '-')}.png`
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
