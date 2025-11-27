import { TileDrawer } from '../types'
import { quarterCirclePatterns } from './quarter-circles'
import { concentricPatterns } from './concentric'
import { shadowBlockPatterns } from './shadow-blocks'
import { mondrianPatterns } from './mondrian'
import { diamondPatterns } from './diamonds'
import { circlePatterns } from './circles'
import {
  truchetPatterns,
  truchetCurvedPatterns,
  truchetOutlinedPatterns,
  truchetDiagonalPatterns,
  truchetTrianglePatterns,
} from './truchet'
import { generateLayers, layersPatternNames } from './layers'

export const STYLE_PATTERNS: Record<string, TileDrawer[]> = {
  // Bauhaus styles
  'Quarter Circles': quarterCirclePatterns,
  Concentric: concentricPatterns,
  'Shadow Blocks': shadowBlockPatterns,
  Mondrian: mondrianPatterns,
  Diamonds: diamondPatterns,
  Circles: circlePatterns,
  // Truchet styles
  Truchet: truchetPatterns,
  'Curved Pipes': truchetCurvedPatterns,
  'Outlined Pipes': truchetOutlinedPatterns,
  'Diagonal Lines': truchetDiagonalPatterns,
  Triangles: truchetTrianglePatterns,
}

// Non-tile-based styles (full canvas rendering)
export const LAYER_STYLES = ['Mountains', 'Mountains (No Sun)', 'Dunes', 'Waves']

export {
  quarterCirclePatterns,
  concentricPatterns,
  shadowBlockPatterns,
  mondrianPatterns,
  diamondPatterns,
  circlePatterns,
  truchetPatterns,
  truchetCurvedPatterns,
  truchetOutlinedPatterns,
  truchetDiagonalPatterns,
  truchetTrianglePatterns,
  generateLayers,
  layersPatternNames,
}
