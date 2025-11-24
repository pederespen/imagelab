'use client'

import { useState, useRef, useEffect } from 'react'
import { Upload, Copy, Check, Download } from 'lucide-react'
import {
  imageToAscii,
  loadImageData,
  calculateFontSize,
  type CharacterSet,
  type AsciiOptions,
} from '@/lib/utils/ascii'
import { isGif, parseGifFrames, generateAsciiGif, type GifFrame } from '@/lib/utils/gif'
import { Button, Card, Dropdown, Slider } from '@/components/ui'

export default function AsciiConverter() {
  const [imageData, setImageData] = useState<ImageData | null>(null)
  const [asciiArt, setAsciiArt] = useState<string>('')
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [fontSize, setFontSize] = useState<number>(8)
  const [isProcessing, setIsProcessing] = useState(false)

  // GIF-specific state
  const [isGifFile, setIsGifFile] = useState<boolean>(false)
  const [gifFrames, setGifFrames] = useState<GifFrame[]>([])
  const [isGeneratingGif, setIsGeneratingGif] = useState<boolean>(false)
  const [gifProgress, setGifProgress] = useState<number>(0)

  // Settings
  const [width, setWidth] = useState<number>(40)
  const [debouncedWidth, setDebouncedWidth] = useState<number>(40)
  const [characterSet, setCharacterSet] = useState<CharacterSet>('braille')
  const [invert, setInvert] = useState<boolean>(false)
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const asciiContainerRef = useRef<HTMLDivElement>(null)

  // Debounce width changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedWidth(width)
    }, 150)

    return () => clearTimeout(timer)
  }, [width])

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

          await handleFileLoad(file)
          break
        }
      }
    }

    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, [])

  // Animate GIF frames for ASCII preview
  useEffect(() => {
    if (!isGifFile || gifFrames.length === 0) return

    let frameIndex = 0
    let timeoutId: NodeJS.Timeout

    const animate = () => {
      setImageData(gifFrames[frameIndex].imageData)

      const delay = gifFrames[frameIndex].delay
      frameIndex = (frameIndex + 1) % gifFrames.length

      timeoutId = setTimeout(animate, delay)
    }

    animate()

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [isGifFile, gifFrames])

  const handleFileLoad = async (file: File) => {
    setIsProcessing(true)
    setAsciiArt('')
    setIsGifFile(false)
    setGifFrames([])

    try {
      // Create preview URL
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)

      // Check if it's a GIF
      if (isGif(file)) {
        setIsGifFile(true)
        const frames = await parseGifFrames(file)
        setGifFrames(frames)
        setImageData(frames[0].imageData)
      } else {
        // Load regular image
        const data = await loadImageData(file)
        setImageData(data)
      }
    } catch (error) {
      console.error('Error loading image:', error)
      alert('Failed to load image. Please try another file.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    await handleFileLoad(file)
  }

  // Auto-convert when settings change or image loads
  useEffect(() => {
    if (imageData) {
      const options: AsciiOptions = {
        width: debouncedWidth,
        characterSet,
        invert,
      }
      const ascii = imageToAscii(imageData, options)
      setAsciiArt(ascii)

      // Calculate font size based on container width
      const containerWidth = asciiContainerRef.current?.clientWidth || 600
      setFontSize(calculateFontSize(ascii, containerWidth))
    }
  }, [imageData, debouncedWidth, characterSet, invert, isGifFile])

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
    } catch {
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

  const handleDownloadGif = async () => {
    if (!isGifFile || gifFrames.length === 0) return

    setIsGeneratingGif(true)
    setGifProgress(0)

    try {
      const options: AsciiOptions = { width, characterSet, invert }
      const blob = await generateAsciiGif(gifFrames, options, progress => {
        setGifProgress(Math.floor(progress * 100))
      })

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'ascii-art.gif'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error generating GIF:', error)
      alert('Failed to generate GIF. Please try again.')
    } finally {
      setIsGeneratingGif(false)
      setGifProgress(0)
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="w-full h-full flex flex-col gap-4">
      {/* Controls Bar */}
      <div className="flex-shrink-0">
        <Card>
          <div className="p-2">
            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
              <Button
                variant="primary"
                size="sm"
                onClick={handleUploadClick}
                disabled={isProcessing}
                className="inline-flex items-center justify-center"
              >
                <Upload className="w-3.5 h-3.5 mr-1.5" />
                {isProcessing ? 'Loading...' : 'Upload'}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {imageData && (
                <>
                  <div className="hidden sm:block h-6 w-px bg-border" />

                  <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                    <span className="text-xs text-muted-foreground">Width:</span>
                    <div className="flex gap-1">
                      <Button
                        variant={width === 30 ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => setWidth(30)}
                      >
                        30
                      </Button>
                      <Button
                        variant={width === 40 ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => setWidth(40)}
                      >
                        40
                      </Button>
                      <Button
                        variant={width === 60 ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => setWidth(60)}
                      >
                        60
                      </Button>
                    </div>

                    <div className="flex-1 min-w-32 w-full sm:w-auto sm:max-w-48">
                      <Slider
                        min={20}
                        max={80}
                        value={width}
                        onChange={e => setWidth(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="hidden sm:block h-6 w-px bg-border" />

                  <div className="w-full sm:w-32">
                    <Dropdown
                      value={characterSet}
                      onChange={value => setCharacterSet(value as CharacterSet)}
                      size="sm"
                      options={[
                        { value: 'braille', label: 'Braille' },
                        { value: 'block', label: 'Block' },
                        { value: 'simple', label: 'Simple' },
                        { value: 'detailed', label: 'Detailed' },
                        { value: 'traditional', label: 'Traditional' },
                      ]}
                    />
                  </div>

                  <Button
                    variant={invert ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setInvert(!invert)}
                    className="w-full sm:w-auto"
                  >
                    {invert ? 'Inverted' : 'Normal'}
                  </Button>
                </>
              )}

              {asciiArt && (
                <>
                  <div className="hidden sm:block flex-1" />
                  {!isGifFile && (
                    <Button
                      variant={copyStatus === 'copied' ? 'success' : 'secondary'}
                      size="sm"
                      onClick={handleCopyToClipboard}
                      className="inline-flex items-center justify-center w-full sm:w-auto"
                    >
                      {copyStatus === 'copied' ? (
                        <>
                          <Check className="w-3.5 h-3.5 mr-1.5" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 mr-1.5" />
                          Copy
                        </>
                      )}
                    </Button>
                  )}
                  {isGifFile && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleDownloadGif}
                      disabled={isGeneratingGif}
                      className="inline-flex items-center justify-center w-full sm:w-auto"
                    >
                      <Download className="w-3.5 h-3.5 mr-1.5" />
                      {isGeneratingGif ? `${gifProgress}%` : 'Download GIF'}
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Image and Output Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        {/* Original Image */}
        <div className="flex flex-col gap-2">
          <div className="bg-muted rounded-lg overflow-hidden aspect-square flex items-center justify-center border border-border p-2 relative">
            {isProcessing && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
                <div className="text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] mb-2" />
                  <p className="text-sm text-muted-foreground">Loading GIF...</p>
                </div>
              </div>
            )}
            {previewUrl ? (
              isGifFile ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={previewUrl} alt="Original GIF" className="w-full h-full object-contain" />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={previewUrl} alt="Original" className="w-full h-full object-contain" />
              )
            ) : (
              <div className="text-center text-muted-foreground">
                <p className="text-sm">No image loaded</p>
                <p className="text-xs mt-1">Upload or paste an image</p>
                <p className="text-xs mt-1 opacity-75">
                  (GIFs must be uploaded to preserve animation)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ASCII Output */}
        <div className="flex flex-col gap-2">
          <div
            ref={asciiContainerRef}
            className="bg-muted border border-border rounded-lg overflow-auto aspect-square relative"
          >
            {isProcessing && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
                <div className="text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] mb-2" />
                  <p className="text-sm text-muted-foreground">Processing...</p>
                </div>
              </div>
            )}
            {asciiArt ? (
              <pre
                style={{ fontSize: `${fontSize}px`, lineHeight: '1.2' }}
                className="font-mono p-4 whitespace-pre h-full flex items-center justify-center text-foreground"
              >
                {asciiArt}
              </pre>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p className="text-sm">ASCII art will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
