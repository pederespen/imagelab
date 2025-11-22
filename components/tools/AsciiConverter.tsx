'use client'

import { useState, useRef } from 'react'
import {
  imageToAscii,
  loadImageData,
  calculateFontSize,
  CHARACTER_SETS,
  type CharacterSet,
  type AsciiOptions,
} from '@/lib/utils/ascii'

export default function AsciiConverter() {
  const [imageData, setImageData] = useState<ImageData | null>(null)
  const [asciiArt, setAsciiArt] = useState<string>('')
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [fontSize, setFontSize] = useState<number>(8)
  const [isProcessing, setIsProcessing] = useState(false)

  // Settings
  const [width, setWidth] = useState<number>(40)
  const [characterSet, setCharacterSet] = useState<CharacterSet>('braille')
  const [invert, setInvert] = useState<boolean>(false)
  const [edgeDetection, setEdgeDetection] = useState<boolean>(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsProcessing(true)
    setAsciiArt('') // Clear previous ASCII art
    try {
      // Create preview
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)

      // Load image data
      const data = await loadImageData(file)
      setImageData(data)
    } catch (error) {
      console.error('Error loading image:', error)
      alert('Failed to load image. Please try another file.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleConvert = () => {
    if (!imageData) return

    const options: AsciiOptions = { width, characterSet, invert, edgeDetection }
    const ascii = imageToAscii(imageData, options)
    setAsciiArt(ascii)
    setFontSize(calculateFontSize(ascii))
  }

  const handleCopyToClipboard = async () => {
    try {
      // Create a blob with the text to preserve formatting
      const blob = new Blob([asciiArt], { type: 'text/plain;charset=utf-8' })
      const clipboardItem = new ClipboardItem({ 'text/plain': blob })
      await navigator.clipboard.write([clipboardItem])
      alert('Copied to clipboard!')
    } catch (error) {
      // Fallback to standard clipboard API
      try {
        await navigator.clipboard.writeText(asciiArt)
        alert('Copied to clipboard!')
      } catch (fallbackError) {
        console.error('Failed to copy:', fallbackError)
        alert('Failed to copy to clipboard')
      }
    }
  }

  const handleDownload = () => {
    const blob = new Blob([asciiArt], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ascii-art.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="w-full flex flex-col lg:flex-row gap-6">
      {/* Sidebar with Settings */}
      <div className="w-full lg:w-64 flex-shrink-0">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 lg:p-6 lg:sticky lg:top-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Settings</h3>

          {/* Mobile: Grid layout, Desktop: Stacked */}
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 lg:gap-0">
            {/* Width Slider */}
            <div className="col-span-2 lg:mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Width: {width} chars
              </label>
              <input
                type="range"
                min="20"
                max="80"
                value={width}
                onChange={e => setWidth(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => setWidth(30)}
                  className="text-xs px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded"
                >
                  Small (30)
                </button>
                <button
                  onClick={() => setWidth(40)}
                  className="text-xs px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded"
                >
                  Medium (40)
                </button>
                <button
                  onClick={() => setWidth(60)}
                  className="text-xs px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded"
                >
                  Large (60)
                </button>
              </div>
            </div>

            {/* Character Set */}
            <div className="col-span-2 lg:mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">Character Set</label>
              <select
                value={characterSet}
                onChange={e => setCharacterSet(e.target.value as CharacterSet)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="block">Block</option>
                <option value="braille">Braille</option>
                <option value="simple">Simple</option>
                <option value="detailed">Detailed</option>
                <option value="traditional">Traditional</option>
              </select>
            </div>

            {/* Invert Toggle */}
            <div className="lg:mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">Invert Colors</label>
              <button
                onClick={() => setInvert(!invert)}
                className={`w-full px-4 py-2 rounded-md font-medium transition-colors ${
                  invert
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                {invert ? 'On' : 'Off'}
              </button>
            </div>

            {/* Edge Detection Toggle */}
            <div className="lg:mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">Edge Enhance</label>
              <button
                onClick={() => setEdgeDetection(!edgeDetection)}
                className={`w-full px-4 py-2 rounded-md font-medium transition-colors ${
                  edgeDetection
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                {edgeDetection ? 'On' : 'Off'}
              </button>
            </div>

            {/* Divider - hidden on mobile */}
            <div className="hidden lg:block border-t border-slate-200 my-6 col-span-2"></div>

            {/* Upload Button */}
            <div className="lg:mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2 lg:hidden">
                Upload
              </label>
              <button
                onClick={handleUploadClick}
                disabled={isProcessing}
                className="w-full px-4 py-3 bg-slate-600 text-white rounded-md hover:bg-slate-700 transition-colors font-medium disabled:opacity-50"
              >
                {isProcessing ? 'Loading...' : 'Upload'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Convert Button */}
            <div className="lg:mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2 lg:hidden">
                Generate
              </label>
              <button
                onClick={handleConvert}
                disabled={!imageData || isProcessing}
                className="w-full px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Convert
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          {asciiArt && (
            <>
              <div className="border-t border-slate-200 my-4 lg:my-6"></div>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                <button
                  onClick={handleCopyToClipboard}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Copy
                </button>
                <button
                  onClick={handleDownload}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Download
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0">
        {/* Two Column Layout - Stack on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Original Image */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">Original</h2>
            <div className="bg-slate-100 rounded-lg overflow-hidden aspect-square flex items-center justify-center border border-slate-200">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Original"
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div className="text-center text-slate-400">
                  <div className="text-6xl mb-2">📷</div>
                  <p>No image loaded</p>
                </div>
              )}
            </div>
          </div>

          {/* ASCII Output */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">ASCII Art</h2>
            <div className="bg-white border border-slate-200 rounded-lg overflow-auto aspect-square">
              {asciiArt ? (
                <pre
                  style={{ fontSize: `${fontSize}px` }}
                  className="font-mono leading-none p-4 whitespace-pre h-full"
                >
                  {asciiArt}
                </pre>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400">
                  <div className="text-center">
                    <div className="text-6xl mb-2">📝</div>
                    <p>ASCII art will appear here</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info Note */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900 mb-2">
            <strong>💡 For Chat Apps:</strong>
          </p>
          <ul className="text-sm text-blue-900 space-y-1 ml-4">
            <li>
              • <strong>Braille</strong> works best in Discord, Slack, Twitch
            </li>
            <li>
              • <strong>Block</strong> is good for wider compatibility
            </li>
            <li>
              • Keep width <strong>30-50 chars</strong> for mobile viewers
            </li>
            <li>
              • Use code blocks in Discord:{' '}
              <code className="bg-blue-100 px-1 rounded">```text</code>
            </li>
          </ul>
        </div>
      </div>

      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
