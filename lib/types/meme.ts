export interface TextLayer {
  id: string
  text: string
  x: number // Absolute pixel position on canvas
  y: number
  fontSize: number
  fontFamily: string
  color: string
  strokeColor: string
  strokeWidth: number
  rotation: number
  textAlign: 'left' | 'center' | 'right'
  maxWidth?: number
}

// Relative text position (0-1) for template definitions
export interface RelativeTextPosition {
  x: number // 0-1 relative to canvas width
  y: number // 0-1 relative to canvas height
  fontSize: number
  text: string
  textAlign?: 'left' | 'center' | 'right'
}

export interface MemeTemplate {
  id: string
  name: string
  imagePath: string // Local path in /public/memes/
  defaultTexts: RelativeTextPosition[]
}

export interface MemeConfig {
  width: number
  height: number
  backgroundColor: string
}

export const DEFAULT_TEXT_LAYER: Omit<TextLayer, 'id'> = {
  text: 'Your text here',
  x: 50,
  y: 50,
  fontSize: 48,
  fontFamily: 'Impact',
  color: '#FFFFFF',
  strokeColor: '#000000',
  strokeWidth: 5,
  rotation: 0,
  textAlign: 'center',
  maxWidth: undefined,
}

export const FONT_OPTIONS = [
  { value: 'Impact', label: 'Impact' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Comic Sans MS', label: 'Comic Sans' },
  { value: 'Courier New', label: 'Courier' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Times New Roman', label: 'Times' },
]

export const MEME_TEMPLATES: MemeTemplate[] = [
  {
    id: 'custom',
    name: 'Custom Upload',
    imagePath: '',
    defaultTexts: [],
  },
  {
    id: 'drake',
    name: 'Drake Hotline Bling',
    imagePath: '/memes/drake.jpg',
    defaultTexts: [
      { x: 0.65, y: 0.25, fontSize: 36, text: 'text1', textAlign: 'center' },
      { x: 0.65, y: 0.75, fontSize: 36, text: 'text2', textAlign: 'center' },
    ],
  },
  {
    id: 'distracted-boyfriend',
    name: 'Distracted Boyfriend',
    imagePath: '/memes/distracted-boyfriend.jpg',
    defaultTexts: [
      { x: 0.279, y: 0.683, fontSize: 40, text: 'text1', textAlign: 'center' },
      { x: 0.603, y: 0.519, fontSize: 41, text: 'text2', textAlign: 'center' },
      { x: 0.842, y: 0.578, fontSize: 37, text: 'text3', textAlign: 'center' },
    ],
  },
  {
    id: 'two-buttons',
    name: 'Two Buttons',
    imagePath: '/memes/two-buttons.jpg',
    defaultTexts: [
      { x: 0.38, y: 0.162, fontSize: 26, text: 'text1', textAlign: 'center' },
      { x: 0.546, y: 0.114, fontSize: 26, text: 'text2', textAlign: 'center' },
      { x: 0.51, y: 0.896, fontSize: 32, text: 'text3', textAlign: 'center' },
    ],
  },
  {
    id: 'change-my-mind',
    name: 'Change My Mind',
    imagePath: '/memes/change-my-mind.jpg',
    defaultTexts: [{ x: 0.661, y: 0.679, fontSize: 52, text: 'text1', textAlign: 'center' }],
  },
  {
    id: 'expanding-brain',
    name: 'Expanding Brain',
    imagePath: '/memes/expanding-brain.jpg',
    defaultTexts: [
      { x: 0.635, y: 0.19, fontSize: 28, text: 'text1', textAlign: 'center' },
      { x: 0.639, y: 0.447, fontSize: 28, text: 'text2', textAlign: 'center' },
      { x: 0.63, y: 0.685, fontSize: 28, text: 'text3', textAlign: 'center' },
      { x: 0.632, y: 0.959, fontSize: 28, text: 'text4', textAlign: 'center' },
    ],
  },
  {
    id: 'woman-yelling-at-cat',
    name: 'Woman Yelling at Cat',
    imagePath: '/memes/woman-yelling-at-cat.jpg',
    defaultTexts: [
      { x: 0.233, y: 0.181, fontSize: 47, text: 'text1', textAlign: 'center' },
      { x: 0.751, y: 0.183, fontSize: 46, text: 'text2', textAlign: 'center' },
    ],
  },
  {
    id: 'is-this-a-pigeon',
    name: 'Is This A Pigeon',
    imagePath: '/memes/is-this-a-pigeon.jpg',
    defaultTexts: [
      { x: 0.304, y: 0.318, fontSize: 28, text: 'text1', textAlign: 'center' },
      { x: 0.802, y: 0.231, fontSize: 28, text: 'text2', textAlign: 'center' },
      { x: 0.496, y: 0.952, fontSize: 32, text: 'text3', textAlign: 'center' },
    ],
  },
  {
    id: 'running-away-balloon',
    name: 'Running Away Balloon',
    imagePath: '/memes/running-away-balloon.jpg',
    defaultTexts: [
      { x: 0.312, y: 0.349, fontSize: 28, text: 'text1', textAlign: 'center' },
      { x: 0.677, y: 0.21, fontSize: 28, text: 'text2', textAlign: 'center' },
      { x: 0.292, y: 0.797, fontSize: 28, text: 'text3', textAlign: 'center' },
    ],
  },
  {
    id: 'left-exit-12',
    name: 'Left Exit 12 Off Ramp',
    imagePath: '/memes/left-exit-12.jpg',
    defaultTexts: [
      { x: 0.351, y: 0.223, fontSize: 26, text: 'text1', textAlign: 'center' },
      { x: 0.586, y: 0.229, fontSize: 26, text: 'text2', textAlign: 'center' },
      { x: 0.521, y: 0.758, fontSize: 26, text: 'text3', textAlign: 'center' },
    ],
  },
  {
    id: 'disaster-girl',
    name: 'Disaster Girl',
    imagePath: '/memes/disaster-girl.jpg',
    defaultTexts: [
      { x: 0.298, y: 0.391, fontSize: 40, text: 'text1', textAlign: 'center' },
      { x: 0.78, y: 0.4, fontSize: 40, text: 'text2', textAlign: 'center' },
    ],
  },
  {
    id: 'hide-the-pain-harold',
    name: 'Hide the Pain Harold',
    imagePath: '/memes/hide-the-pain-harold.jpg',
    defaultTexts: [
      { x: 0.622, y: 0.299, fontSize: 36, text: 'text1', textAlign: 'center' },
      { x: 0.618, y: 0.82, fontSize: 36, text: 'text2', textAlign: 'center' },
    ],
  },
  {
    id: 'success-kid',
    name: 'Success Kid',
    imagePath: '/memes/success-kid.jpg',
    defaultTexts: [
      { x: 0.5, y: 0.1, fontSize: 36, text: 'text1', textAlign: 'center' },
      { x: 0.5, y: 0.9, fontSize: 36, text: 'text2', textAlign: 'center' },
    ],
  },
  {
    id: 'mocking-spongebob',
    name: 'Mocking Spongebob',
    imagePath: '/memes/mocking-spongebob.jpg',
    defaultTexts: [{ x: 0.517, y: 0.893, fontSize: 36, text: 'text1', textAlign: 'center' }],
  },
  {
    id: 'scroll-of-truth',
    name: 'Scroll Of Truth',
    imagePath: '/memes/scroll-of-truth.jpg',
    defaultTexts: [{ x: 0.327, y: 0.69, fontSize: 28, text: 'text1', textAlign: 'center' }],
  },
  {
    id: 'batman-slapping-robin',
    name: 'Batman Slapping Robin',
    imagePath: '/memes/batman-slapping-robin.jpg',
    defaultTexts: [
      { x: 0.312, y: 0.097, fontSize: 28, text: 'text1', textAlign: 'center' },
      { x: 0.708, y: 0.09, fontSize: 28, text: 'text2', textAlign: 'center' },
    ],
  },
  {
    id: 'boardroom-meeting',
    name: 'Boardroom Meeting Suggestion',
    imagePath: '/memes/boardroom-meeting.jpg',
    defaultTexts: [
      { x: 0.55, y: 0.047, fontSize: 26, text: 'text1', textAlign: 'center' },
      { x: 0.299, y: 0.4, fontSize: 18, text: 'text2', textAlign: 'center' },
      { x: 0.447, y: 0.417, fontSize: 21, text: 'text3', textAlign: 'center' },
      { x: 0.634, y: 0.433, fontSize: 21, text: 'text4', textAlign: 'center' },
    ],
  },
  {
    id: 'they-are-the-same-picture',
    name: "They're The Same Picture",
    imagePath: '/memes/they-are-the-same-picture.jpg',
    defaultTexts: [
      { x: 0.3, y: 0.45, fontSize: 28, text: 'text1', textAlign: 'center' },
      { x: 0.7, y: 0.45, fontSize: 28, text: 'text2', textAlign: 'center' },
      { x: 0.5, y: 0.85, fontSize: 30, text: 'text3', textAlign: 'center' },
    ],
  },
]
