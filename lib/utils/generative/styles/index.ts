import { TileDrawer } from '../types'
import { quarterCirclePatterns } from './quarter-circles'
import { concentricPatterns } from './concentric'
import { shadowBlockPatterns } from './shadow-blocks'
import { mondrianPatterns } from './mondrian'
import { diamondPatterns } from './diamonds'
import { circlePatterns } from './circles'
import { artDecoPatterns } from './art-deco'
import { memphisPatterns } from './memphis'
import {
  truchetPatterns,
  truchetCurvedPatterns,
  truchetOutlinedPatterns,
  truchetDiagonalPatterns,
  truchetTrianglePatterns,
  truchetWeavePatterns,
} from './truchet'

export const STYLE_PATTERNS: Record<string, TileDrawer[]> = {
  // Bauhaus styles
  'Quarter Circles': quarterCirclePatterns,
  Concentric: concentricPatterns,
  'Shadow Blocks': shadowBlockPatterns,
  Mondrian: mondrianPatterns,
  Diamonds: diamondPatterns,
  Circles: circlePatterns,
  // Art Deco styles
  'Art Deco': artDecoPatterns,
  // Memphis styles
  Memphis: memphisPatterns,
  // Truchet styles
  Truchet: truchetPatterns,
  'Curved Pipes': truchetCurvedPatterns,
  'Outlined Pipes': truchetOutlinedPatterns,
  'Diagonal Lines': truchetDiagonalPatterns,
  Triangles: truchetTrianglePatterns,
  Weave: truchetWeavePatterns,
}

export {
  quarterCirclePatterns,
  concentricPatterns,
  shadowBlockPatterns,
  mondrianPatterns,
  diamondPatterns,
  circlePatterns,
  artDecoPatterns,
  memphisPatterns,
  truchetPatterns,
  truchetCurvedPatterns,
  truchetOutlinedPatterns,
  truchetDiagonalPatterns,
  truchetTrianglePatterns,
  truchetWeavePatterns,
}
