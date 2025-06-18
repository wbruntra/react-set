// Import colors from SCSS module - single source of truth
import colorModule from './bts/colors.module.scss'

// Export individual color constants for easy importing
export const DARK_PURPLE = colorModule.darkPurple
export const GREY = colorModule.grey
export const LIGHT_ORANGE = colorModule.lightOrange
export const DARK_ORANGE = colorModule.darkOrange
export const LIGHT_BLUE = colorModule.lightBlue
export const PINK = colorModule.pink
export const AMBER = colorModule.amber
export const PURPLE = colorModule.purple
export const LIGHT_GREEN = colorModule.lightGreen

// New soft theme colors
export const SOFT_BACKGROUND = colorModule.softBackground
export const SOFT_CARD_BACKGROUND = colorModule.softCardBackground
export const SOFT_BORDER_COLOR = colorModule.softBorderColor
export const SOFT_TEXT_COLOR = colorModule.softTextColor
export const LIGHT_PURPLE_BACKGROUND = colorModule.lightPurpleBackground

// Game card colors
export const CARD_GREEN = colorModule.cardGreen
export const CARD_BLUE = colorModule.cardBlue
export const CARD_RED = colorModule.cardRed

// For backwards compatibility with existing color.module.scss usage
export const colors = [
  'light-blue',
  'pink',
  'amber',
  'light-green',
  'purple',
  'orange',
  'error-red',
]

// Color object for easier access - all values come from SCSS module
export const colorValues = {
  darkPurple: DARK_PURPLE,
  grey: GREY,
  lightOrange: LIGHT_ORANGE,
  darkOrange: DARK_ORANGE,
  lightBlue: LIGHT_BLUE,
  pink: PINK,
  amber: AMBER,
  purple: PURPLE,
  lightGreen: LIGHT_GREEN,
  // New soft theme colors
  softBackground: SOFT_BACKGROUND,
  softCardBackground: SOFT_CARD_BACKGROUND,
  softBorderColor: SOFT_BORDER_COLOR,
  softTextColor: SOFT_TEXT_COLOR,
  lightPurpleBackground: LIGHT_PURPLE_BACKGROUND,
  // Game card colors
  cardGreen: CARD_GREEN,
  cardBlue: CARD_BLUE,
  cardRed: CARD_RED,
}

// Also export the raw module for direct access
export { colorModule }

export default colorValues
