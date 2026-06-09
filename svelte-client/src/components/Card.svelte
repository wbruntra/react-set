<script lang="ts">
  import { range } from '@/utils/helpers'

  const CARD_COLORS: Record<string, string> = {
    0: '#61d020',
    1: '#1b2f92',
    2: '#ff0000',
    white: '#fafafa',
  }

  const config = {
    width: 120,
    height: 200,
    strokeWidth: 4,
    padding: 25,
  }

  let { desc }: { desc: string } = $props()

  function getFill(color: string, fill: string): string {
    if (fill === '1') {
      return `url(#card-${color}-${fill})`
    }
    if (fill === '2') {
      return CARD_COLORS[color]
    }
    return CARD_COLORS.white
  }

  function getSquigglePath(): string {
    return `
    m-17.49,66
    c50.83,-35.45 101.7,35.45
    152.5,0
    c30,-10 30,43.8
    0,63.8
    c-50.8,35.45 -101.6,-35.45
    -152.5,0
    c-30,15 -30,-45
    0,-63.59
    z
    `
  }
</script>

{#if desc === '0333'}
  <div class="game-card d-flex justify-content-center">
    <svg
      class="shape blank-card"
      viewBox="0 0 {config.width} {config.height}"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="2"
        y="2"
        width={config.width - 4}
        height={config.height - 4}
        fill="#f8f9fa"
        stroke="#dee2e6"
        stroke-width="2"
        stroke-dasharray="5,5"
        rx="8"
      />
    </svg>
  </div>
{:else}
  {@const [number, color, shape, fill] = desc.split('')}
  {@const fillColor = getFill(color, fill)}
  {@const strokeColor = CARD_COLORS[color]}
  {@const { padding, height, width, strokeWidth } = config}

  <div class="game-card d-flex justify-content-center">
    <svg width="0" height="0">
      <pattern
        id="card-{color}-{fill}"
        width={120 / 12}
        height="10"
        patternTransform="rotate(45 0 0)"
        patternUnits="userSpaceOnUse"
      >
        <line x1="0" y1="0" x2="0" y2="10" style="stroke: {strokeColor}; stroke-width: {strokeWidth}" />
      </pattern>
    </svg>

    {#each range(Number(number) + 1) as _i}
      <svg
        class="shape {number === '1' ? 'double' : ''}"
        viewBox="0 0 {config.width} {config.height}"
        xmlns="http://www.w3.org/2000/svg"
      >
        {#if shape === '0'}
          <!-- Squiggle -->
          <g>
            <path
              stroke={strokeColor}
              transform="rotate(270,58.8,98) scale(0.8 1) translate(10 0)"
              d={getSquigglePath()}
              stroke-width={strokeWidth}
              fill={fillColor}
            />
          </g>
        {:else if shape === '1'}
          <!-- Oval -->
          <ellipse
            stroke={strokeColor}
            ry={(height - 2 * padding) / 2}
            rx={(width - 2 * padding) / 2}
            cy={height / 2}
            cx={width / 2}
            stroke-width={config.strokeWidth}
            fill={fillColor}
          />
        {:else if shape === '2'}
          <!-- Diamond -->
          <polygon
            points="{padding},{height / 2} {width / 2},{padding} {width - padding},{height / 2} {width / 2},{height - padding}"
            style="fill: {fillColor}; stroke: {strokeColor}; stroke-width: {config.strokeWidth}"
          />
        {/if}
      </svg>
    {/each}
  </div>
{/if}

<style>
  .game-card {
    display: flex;
    justify-content: center;
  }

  .shape {
    width: 32%;
    margin: auto;
  }

  .shape.double {
    margin: 0 3px;
  }
</style>
