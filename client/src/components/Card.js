import React, { Component, Fragment } from 'react'
import { range } from '../utils/helpers'
import './card.css'

const config = {
  width: 120,
  height: 200,
  strokeWidth: 4,
  padding: 25,
}

const Rectangle = ({ fill, color }) => {
  let { padding, height, width, strokeWidth } = config
  return (
    <g>
      {/* triangle */}
      {/* <polygon
    points={`${padding},${height - padding}
    ${width / 2},${padding}
    ${width - padding},${height - padding}`}
    style={{ fill: fill, stroke: color, strokeWidth: config.strokeWidth }}
  /> */}
      {/* rectangle */}
      <polygon
        points={`${padding},${padding}
    ${width - padding},${padding}
    ${width - padding},${height - padding}
    ${padding},${height - padding}`}
        style={{ fill: fill, stroke: color, strokeWidth: strokeWidth }}
      />
    </g>
  )
}

const Squiggle = ({ fill, color }) => {
  let { padding, height, width, strokeWidth } = config
  return (
    <svg width="120" height="200" xmlns="http://www.w3.org/2000/svg">
      <g>
        <rect fill="#fff" id="canvas_background" height="202" width="122" y="-1" x="-1" />
        <g display="none" overflow="visible" y="0" x="0" height="100%" width="100%" id="canvasGrid">
          <rect 
          fill="#fff"
          strokeWidth="0" 
          y="0" x="0" height="100%" width="100%" />
        </g>
      </g>
      <g>
        <path
          stroke={color}
          transform="rotate(89.69688415527344 58.75771713256837,97.92066192626952) "
          id="svg_5"
          d="m-17.485088,66.013951c50.828541,-35.451902 101.657071,35.451899 152.485601,0l0,63.813412c-50.82853,35.451904 -101.657061,-35.451896 -152.485601,0l0,-63.813412z"
          fillOpacity="null"
          strokeOpacity="null"
          strokeWidth={strokeWidth}
          fill={fill}
        />
      </g>
    </svg>
  )
}

const Shape = ({ shape, fill, color }) => {
  let { padding, height, width, strokeWidth } = config
  if (shape === '0') {
    padding = padding + 1
    return <Squiggle fill={fill} color={color} />
  }
  if (shape === '1') {
    return (
      <g>
        <ellipse
          stroke={color}
          ry={(height - 2 * padding) / 2}
          rx={(width - 2 * padding) / 2}
          cy={height / 2}
          cx={width / 2}
          fillOpacity="null"
          strokeOpacity="null"
          strokeWidth={config.strokeWidth}
          fill={fill}
        />
      </g>
    )
  }
  if (shape === '2') {
    return (
      <g>
        {/* diamond */}

        <polygon
          points={`${padding},${height / 2}
          ${width / 2},${padding}
          ${width - padding},${height / 2}
          ${width / 2},${height - padding}`}
          style={{ fill: fill, stroke: color, strokeWidth: config.strokeWidth }}
        />
      </g>
    )
  }
}

class Card extends Component {
  colors = {
    0: '#00A91D',
    1: '#3E009E',
    2: '#FF0000',
    white: '#fff',
  }

  getFill = (color, fill) => {
    if (fill === '1') {
      return `url(#card-${color}-${fill})`
    }
    if (fill === '2') {
      return this.colors[color]
    }
    return this.colors.white
  }

  drawShape = () => {
    const [, color, shape, fill] = this.props.desc.split('')
    return (
      <Fragment>
        <g>
          <title>background</title>
          <rect fill={this.colors.white} id="canvas_background" y="-1" x="-1" />
          <g
            display="none"
            overflow="visible"
            y="0"
            x="0"
            height="100%"
            width="100%"
            id="canvasGrid"
          >
            <rect strokeWidth="0" y="0" x="0" height="100%" width="100%" />
          </g>
        </g>
        <Shape shape={shape} fill={this.getFill(color, fill)} color={this.colors[color]} />
      </Fragment>
    )
  }

  render() {
    const [number, color, , fill] = this.props.desc.split('')
    return (
      <div className="game-card">
        <svg width="0" height="0">
          <pattern
            id={`card-${color}-${fill}`}
            width={120 / 7}
            height="10"
            patternTransform="rotate(45 0 0)"
            patternUnits="userSpaceOnUse"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="10"
              style={{ stroke: this.colors[color], strokeWidth: '5' }}
            />
          </pattern>
        </svg>

        {range(Number(number) + 1).map(i => {
          return (
            <svg
              key={i}
              className="shape"
              viewBox={`0 0 ${config.width} ${config.height}`}
              xmlns="http://www.w3.org/2000/svg"
            >
              {this.drawShape()}
            </svg>
          )
        })}
      </div>
    )
  }
}

export default Card
