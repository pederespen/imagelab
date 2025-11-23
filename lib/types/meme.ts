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
  strokeWidth: 3,
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
      { x: 0.3, y: 0.15, fontSize: 28, text: 'text1', textAlign: 'center' },
      { x: 0.5, y: 0.5, fontSize: 28, text: 'text2', textAlign: 'center' },
      { x: 0.75, y: 0.15, fontSize: 28, text: 'text3', textAlign: 'center' },
    ],
  },
  {
    id: 'two-buttons',
    name: 'Two Buttons',
    imagePath: '/memes/two-buttons.jpg',
    defaultTexts: [
      { x: 0.25, y: 0.2, fontSize: 26, text: 'text1', textAlign: 'center' },
      { x: 0.6, y: 0.2, fontSize: 26, text: 'text2', textAlign: 'center' },
      { x: 0.5, y: 0.85, fontSize: 32, text: 'text3', textAlign: 'center' },
    ],
  },
  {
    id: 'change-my-mind',
    name: 'Change My Mind',
    imagePath: '/memes/change-my-mind.jpg',
    defaultTexts: [{ x: 0.45, y: 0.65, fontSize: 32, text: 'text1', textAlign: 'center' }],
  },
  {
    id: 'expanding-brain',
    name: 'Expanding Brain',
    imagePath: '/memes/expanding-brain.jpg',
    defaultTexts: [
      { x: 0.6, y: 0.13, fontSize: 28, text: 'text1', textAlign: 'center' },
      { x: 0.6, y: 0.38, fontSize: 28, text: 'text2', textAlign: 'center' },
      { x: 0.6, y: 0.63, fontSize: 28, text: 'text3', textAlign: 'center' },
      { x: 0.6, y: 0.88, fontSize: 28, text: 'text4', textAlign: 'center' },
    ],
  },
  {
    id: 'woman-yelling-at-cat',
    name: 'Woman Yelling at Cat',
    imagePath: '/memes/woman-yelling-at-cat.jpg',
    defaultTexts: [
      { x: 0.25, y: 0.15, fontSize: 32, text: 'text1', textAlign: 'center' },
      { x: 0.75, y: 0.15, fontSize: 32, text: 'text2', textAlign: 'center' },
    ],
  },
  {
    id: 'is-this-a-pigeon',
    name: 'Is This A Pigeon',
    imagePath: '/memes/is-this-a-pigeon.jpg',
    defaultTexts: [
      { x: 0.35, y: 0.2, fontSize: 28, text: 'text1', textAlign: 'center' },
      { x: 0.5, y: 0.45, fontSize: 28, text: 'text2', textAlign: 'center' },
      { x: 0.5, y: 0.75, fontSize: 32, text: 'text3', textAlign: 'center' },
    ],
  },
  {
    id: 'running-away-balloon',
    name: 'Running Away Balloon',
    imagePath: '/memes/running-away-balloon.jpg',
    defaultTexts: [
      { x: 0.25, y: 0.15, fontSize: 28, text: 'text1', textAlign: 'center' },
      { x: 0.5, y: 0.15, fontSize: 28, text: 'text2', textAlign: 'center' },
      { x: 0.75, y: 0.35, fontSize: 28, text: 'text3', textAlign: 'center' },
    ],
  },
  {
    id: 'left-exit-12',
    name: 'Left Exit 12 Off Ramp',
    imagePath: '/memes/left-exit-12.jpg',
    defaultTexts: [
      { x: 0.25, y: 0.35, fontSize: 26, text: 'text1', textAlign: 'center' },
      { x: 0.65, y: 0.2, fontSize: 26, text: 'text2', textAlign: 'center' },
      { x: 0.85, y: 0.65, fontSize: 26, text: 'text3', textAlign: 'center' },
    ],
  },
  {
    id: 'disaster-girl',
    name: 'Disaster Girl',
    imagePath: '/memes/disaster-girl.jpg',
    defaultTexts: [
      { x: 0.5, y: 0.1, fontSize: 40, text: 'text1', textAlign: 'center' },
      { x: 0.5, y: 0.9, fontSize: 40, text: 'text2', textAlign: 'center' },
    ],
  },
  {
    id: 'hide-the-pain-harold',
    name: 'Hide the Pain Harold',
    imagePath: '/memes/hide-the-pain-harold.jpg',
    defaultTexts: [
      { x: 0.5, y: 0.1, fontSize: 36, text: 'text1', textAlign: 'center' },
      { x: 0.5, y: 0.9, fontSize: 36, text: 'text2', textAlign: 'center' },
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
    defaultTexts: [
      { x: 0.5, y: 0.1, fontSize: 36, text: 'text1', textAlign: 'center' },
      { x: 0.5, y: 0.9, fontSize: 36, text: 'text2', textAlign: 'center' },
    ],
  },
  {
    id: 'scroll-of-truth',
    name: 'Scroll Of Truth',
    imagePath: '/memes/scroll-of-truth.jpg',
    defaultTexts: [
      { x: 0.5, y: 0.3, fontSize: 28, text: 'text1', textAlign: 'center' },
      { x: 0.5, y: 0.75, fontSize: 32, text: 'text2', textAlign: 'center' },
    ],
  },
  {
    id: 'batman-slapping-robin',
    name: 'Batman Slapping Robin',
    imagePath: '/memes/batman-slapping-robin.jpg',
    defaultTexts: [
      { x: 0.25, y: 0.15, fontSize: 28, text: 'text1', textAlign: 'center' },
      { x: 0.75, y: 0.15, fontSize: 28, text: 'text2', textAlign: 'center' },
    ],
  },
  {
    id: 'boardroom-meeting',
    name: 'Boardroom Meeting Suggestion',
    imagePath: '/memes/boardroom-meeting.jpg',
    defaultTexts: [
      { x: 0.5, y: 0.15, fontSize: 26, text: 'text1', textAlign: 'center' },
      { x: 0.25, y: 0.65, fontSize: 26, text: 'text2', textAlign: 'center' },
      { x: 0.5, y: 0.65, fontSize: 26, text: 'text3', textAlign: 'center' },
      { x: 0.75, y: 0.65, fontSize: 26, text: 'text4', textAlign: 'center' },
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
