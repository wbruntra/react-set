import { range } from '@/utils/helpers'

const CARD_COLORS: Record<string, string> = {
  '0': '#61d020',
  '1': '#1b2f92',
  '2': '#ff0000',
  white: '#fafafa',
}

const cfg = {
  width: 120,
  height: 200,
  strokeWidth: 4,
  padding: 25,
}

function getFill(color: string, fill: string): string {
  if (fill === '1') {
    return `url(#card-${color}-${fill})`
  }
  if (fill === '2') {
    return CARD_COLORS[color]
  }
  return CARD_COLORS.white
}

const SQUIGGLE_PATH = [
  'm-17.49,66',
  'c50.83,-35.45 101.7,35.45',
  '152.5,0',
  'c30,-10 30,43.8',
  '0,63.8',
  'c-50.8,35.45 -101.6,-35.45',
  '-152.5,0',
  'c-30,15 -30,-45',
  '0,-63.59',
  'z',
].join(' ')

interface CardProps {
  desc: string
}

export function Card({ desc }: CardProps) {
  if (desc === '0333') {
    return (
      <div class="game-card d-flex justify-content-center">
        <svg
          class="shape blank-card"
          viewBox={`0 0 ${cfg.width} ${cfg.height}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="2"
            y="2"
            width={cfg.width - 4}
            height={cfg.height - 4}
            fill="#f8f9fa"
            stroke="#dee2e6"
            stroke-width={2}
            stroke-dasharray="5,5"
            rx="8"
          />
        </svg>
      </div>
    )
  }

  const [number, color, shape, fill] = desc.split('')
  const fillColor = getFill(color, fill)
  const strokeColor = CARD_COLORS[color]
  const { padding, height, width, strokeWidth } = cfg
  const count = Number(number) + 1
  const doubleClass = number === '1' ? 'double' : ''

  function renderShape(i: number) {
    const cx = width / 2
    const cy = height / 2
    const rx = (width - 2 * padding) / 2
    const ry = (height - 2 * padding) / 2

    return (
      <svg
        key={i}
        class={`shape ${doubleClass}`}
        viewBox={`0 0 ${width} ${height}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {shape === '0' ? (
          <g>
            <path
              stroke={strokeColor}
              transform="rotate(270,58.8,98) scale(0.8 1) translate(10 0)"
              d={SQUIGGLE_PATH}
              stroke-width={strokeWidth}
              fill={fillColor}
            />
          </g>
        ) : shape === '1' ? (
          <ellipse
            stroke={strokeColor}
            ry={ry}
            rx={rx}
            cy={cy}
            cx={cx}
            stroke-width={strokeWidth}
            fill={fillColor}
          />
        ) : (
          <polygon
            points={`${padding},${cy} ${cx},${padding} ${width - padding},${cy} ${cx},${height - padding}`}
            fill={fillColor}
            stroke={strokeColor}
            stroke-width={strokeWidth}
          />
        )}
      </svg>
    )
  }

  return (
    <div class="game-card d-flex justify-content-center">
      <svg width="0" height="0" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id={`card-${color}-${fill}`}
            width={120 / 12}
            height="10"
            patternTransform="rotate(45 0 0)"
            patternUnits="userSpaceOnUse"
          >
            <line x1="0" y1="0" x2="0" y2="10" stroke={strokeColor} stroke-width={strokeWidth} />
          </pattern>
        </defs>
      </svg>
      {range(count).map((i) => renderShape(i))}
    </div>
  )
}
