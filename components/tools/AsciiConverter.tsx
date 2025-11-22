'use client'

import { useState, useRef, useEffect } from 'react'
import {
  imageToAscii,
  loadImageData,
  calculateFontSize,
  CHARACTER_SETS,
  type CharacterSet,
  type AsciiOptions,
} from '@/lib/utils/ascii'
import { Button, Card, CardHeader, CardTitle, Dropdown, Slider } from '@/components/ui'

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
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const asciiContainerRef = useRef<HTMLDivElement>(null)

  // Handle paste from clipboard
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault()
          const file = item.getAsFile()
          if (!file) continue

          setIsProcessing(true)
          setAsciiArt('')
          try {
            const url = URL.createObjectURL(file)
            setPreviewUrl(url)
            const data = await loadImageData(file)
            setImageData(data)
          } catch (error) {
            console.error('Error loading pasted image:', error)
          } finally {
            setIsProcessing(false)
          }
          break
        }
      }
    }

    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, [])

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

    const options: AsciiOptions = { width, characterSet, invert }
    const ascii = imageToAscii(imageData, options)
    setAsciiArt(ascii)

    // Calculate font size based on container width (default to 600 for desktop, but will recalc on resize)
    const containerWidth = asciiContainerRef.current?.clientWidth || 600
    setFontSize(calculateFontSize(ascii, containerWidth))
  }

  // Recalculate font size on window resize
  useEffect(() => {
    if (!asciiArt) return

    const handleResize = () => {
      const containerWidth = asciiContainerRef.current?.clientWidth || 600
      setFontSize(calculateFontSize(asciiArt, containerWidth))
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [asciiArt])

  const handleCopyToClipboard = async () => {
    try {
      // Create a blob with the text to preserve formatting
      const blob = new Blob([asciiArt], { type: 'text/plain;charset=utf-8' })
      const clipboardItem = new ClipboardItem({ 'text/plain': blob })
      await navigator.clipboard.write([clipboardItem])
      setCopyStatus('copied')
      setTimeout(() => setCopyStatus('idle'), 2000)
    } catch (error) {
      // Fallback to standard clipboard API
      try {
        await navigator.clipboard.writeText(asciiArt)
        setCopyStatus('copied')
        setTimeout(() => setCopyStatus('idle'), 2000)
      } catch (fallbackError) {
        console.error('Failed to copy:', fallbackError)
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
        <Card className="lg:sticky lg:top-8">
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <div className="px-4 pb-4 lg:px-6 lg:pb-6">
            {/* Width Slider */}
            <div className="mb-6">
              <Slider
                label={`Width: ${width} chars`}
                min={20}
                max={80}
                value={width}
                onChange={e => setWidth(Number(e.target.value))}
              />
              <div className="flex flex-wrap gap-2 mt-2">
                <Button variant="ghost" size="sm" onClick={() => setWidth(30)}>
                  Twitch (30)
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setWidth(40)}>
                  Discord (40)
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setWidth(60)}>
                  Large (60)
                </Button>
              </div>
            </div>

            {/* Character Set */}
            <div className="mb-6">
              <Dropdown
                label="Character Set"
                value={characterSet}
                onChange={value => setCharacterSet(value as CharacterSet)}
                options={[
                  { value: 'braille', label: 'Braille' },
                  { value: 'block', label: 'Block' },
                  { value: 'simple', label: 'Simple' },
                  { value: 'detailed', label: 'Detailed' },
                  { value: 'traditional', label: 'Traditional' },
                ]}
                helperText="Braille works best in Discord, Slack, Twitch"
              />
            </div>

            {/* Invert Toggle */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">Invert Colors</label>
              <Button
                variant={invert ? 'primary' : 'secondary'}
                fullWidth
                onClick={() => setInvert(!invert)}
              >
                {invert ? 'On' : 'Off'}
              </Button>
            </div>

            <div className="border-t border-slate-200 my-6"></div>

            {/* Upload Button */}
            <div className="mb-4">
              <Button
                variant="secondary"
                size="lg"
                fullWidth
                onClick={handleUploadClick}
                disabled={isProcessing}
              >
                {isProcessing ? 'Loading...' : 'Upload Image'}
              </Button>
              <p className="text-xs text-slate-500 mt-2 text-center">or paste image (Ctrl/Cmd+V)</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Convert Button */}
            <div className="mb-6">
              <Button
                variant="success"
                size="lg"
                fullWidth
                onClick={handleConvert}
                disabled={!imageData || isProcessing}
              >
                Convert to ASCII
              </Button>
            </div>

            {/* Action Buttons */}
            {asciiArt && (
              <>
                <div className="border-t border-slate-200 my-6"></div>
                <Button
                  variant={copyStatus === 'copied' ? 'success' : 'primary'}
                  fullWidth
                  onClick={handleCopyToClipboard}
                >
                  {copyStatus === 'copied' ? 'Copied!' : 'Copy to Clipboard'}
                </Button>
              </>
            )}
          </div>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0">
        {/* Two Column Layout - Stack on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Original Image */}
          <div>
            <div className="bg-slate-100 rounded-lg overflow-hidden aspect-square flex items-center justify-center border border-slate-200">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Original"
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div className="text-center text-slate-400">
                  <p>No image loaded</p>
                </div>
              )}
            </div>
          </div>

          {/* ASCII Output */}
          <div>
            <div
              ref={asciiContainerRef}
              className="bg-white border border-slate-200 rounded-lg overflow-auto aspect-square"
            >
              {asciiArt ? (
                <pre
                  style={{ fontSize: `${fontSize}px`, lineHeight: '1.2' }}
                  className="font-mono p-4 whitespace-pre h-full flex items-center justify-center"
                >
                  {asciiArt}
                </pre>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400">
                  <div className="text-center">
                    <p>ASCII art will appear here</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
