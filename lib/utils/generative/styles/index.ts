import { TileDrawer } from '../types'
import { quarterCirclePatterns } from './quarter-circles'
import { concentricPatterns } from './concentric'
import { shadowBlockPatterns } from './shadow-blocks'
import { mondrianPatterns } from './mondrian'
import { diamondPatterns } from './diamonds'
import { circlePatterns } from './circles'

export const STYLE_PATTERNS: Record<string, TileDrawer[]> = {
  'Quarter Circles': quarterCirclePatterns,
  Concentric: concentricPatterns,
  'Shadow Blocks': shadowBlockPatterns,
  Mondrian: mondrianPatterns,
  Diamonds: diamondPatterns,
  Circles: circlePatterns,
}

export {
  quarterCirclePatterns,
  concentricPatterns,
  shadowBlockPatterns,
  mondrianPatterns,
  diamondPatterns,
  circlePatterns,
}
