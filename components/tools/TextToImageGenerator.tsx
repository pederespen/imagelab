'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Download, Sparkles, AlertCircle, Loader2 } from 'lucide-react'
import { Button, Card, CardHeader, CardTitle, Dropdown } from '@/components/ui'
import {
  ART_STYLES,
  buildPrompt,
  getStyleById,
  isWebGPUSupported,
  type ModelStatus,
} from '@/lib/utils/text-to-image'

// The main language model file - this is the largest and takes the longest
const MAIN_MODEL_FILE = 'language_model'

export default function TextToImageGenerator() {
  const [subject, setSubject] = useState('')
  const [styleId, setStyleId] = useState('none')
  const [status, setStatus] = useState<ModelStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [loadingProgress, setLoadingProgress] = useState<{
    progress: number
    total: number
  } | null>(null)
  const [generationProgress, setGenerationProgress] = useState<number>(0)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [generationTime, setGenerationTime] = useState<number | null>(null)
  const [webGPUSupported, setWebGPUSupported] = useState<boolean | null>(null)

  const workerRef = useRef<Worker | null>(null)

  // Check WebGPU support on mount
  useEffect(() => {
    setWebGPUSupported(isWebGPUSupported())
  }, [])

  // Initialize worker
  useEffect(() => {
    if (typeof window === 'undefined') return

    workerRef.current = new Worker('/text-to-image.worker.js', { type: 'module' })

    workerRef.current.onmessage = e => {
      const { type, ...data } = e.data

      switch (type) {
        case 'status':
          setStatus(data.status)
          if (data.error) setError(data.error)
          break

        case 'progress':
          // Track progress of the main language model (largest file)
          if (data.file && data.file.includes(MAIN_MODEL_FILE)) {
            setLoadingProgress({ progress: data.progress, total: data.total })
          }
          break

        case 'generation-progress':
          setGenerationProgress(data.progress)
          break

        case 'result':
          setGeneratedImage(data.imageUrl)
          setGenerationTime(data.generationTime)
          setStatus('ready')
          setGenerationProgress(0)
          break

        case 'error':
          setError(data.message)
          setStatus('error')
          break
      }
    }

    // Check if WebGPU is available
    workerRef.current.postMessage({ type: 'check' })

    return () => {
      workerRef.current?.terminate()
    }
  }, [])

  const handleLoadModel = useCallback(() => {
    if (!workerRef.current) return
    setError(null)
    setLoadingProgress(null)
    workerRef.current.postMessage({ type: 'load' })
  }, [])

  const handleGenerate = useCallback(() => {
    if (!workerRef.current || !subject.trim()) return

    const style = getStyleById(styleId)
    if (!style) return

    const prompt = buildPrompt(subject, style)
    setError(null)
    setGeneratedImage(null)
    setGenerationTime(null)
    setGenerationProgress(0)

    workerRef.current.postMessage({ type: 'generate', prompt })
  }, [subject, styleId])

  const handleDownload = useCallback(() => {
    if (!generatedImage) return

    const link = document.createElement('a')
    link.href = generatedImage
    link.download = `text-to-image-${styleId}-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [generatedImage, styleId])

  const styleOptions = ART_STYLES.map(style => ({
    value: style.id,
    label: style.name,
  }))

  // WebGPU not supported
  if (webGPUSupported === false) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">WebGPU Not Supported</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          This tool requires WebGPU, which is available in Chrome 113+, Edge 113+, and Firefox
          Nightly. Please update your browser or try a different one.
        </p>
      </Card>
    )
  }

  // Initial state - prompt to load model
  if (status === 'idle' || status === 'checking') {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-8">
        <div className="text-center max-w-2xl">
          <Sparkles className="w-16 h-16 text-primary mx-auto mb-6" />
          <h2 className="text-3xl font-semibold text-foreground mb-4">Text-to-Image Generator</h2>
          <p className="text-lg text-muted-foreground mb-4">
            Generate unique artwork from text descriptions using AI, powered by{' '}
            <span className="font-medium text-foreground">Janus-Pro-1B</span> from DeepSeek.
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            🔒 100% private — runs entirely in your browser using WebGPU. No data is sent to any
            server. The model (~1.4 GB) will be downloaded and cached locally.
          </p>
          <Button onClick={handleLoadModel} size="lg" disabled={status === 'checking'}>
            {status === 'checking' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Load Model & Start
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground mt-4">
            First load may take 30-60 seconds. Subsequent visits will be faster.
          </p>
        </div>
      </div>
    )
  }

  // Loading model
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-8">
        <div className="text-center max-w-2xl">
          <h2 className="text-3xl font-semibold text-foreground mb-6">Loading Model...</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Downloading and initializing the AI model. This may take a minute.
          </p>
          <div className="max-w-lg mx-auto">
            {loadingProgress ? (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground">Downloading model</span>
                  <span className="text-muted-foreground">
                    {loadingProgress.progress.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all duration-300"
                    style={{ width: `${loadingProgress.progress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Initializing...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (status === 'error') {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">Something went wrong</h2>
        <p className="text-muted-foreground max-w-md mx-auto mb-6">
          {error || 'An unexpected error occurred while loading the model.'}
        </p>
        <Button onClick={handleLoadModel}>Try Again</Button>
      </Card>
    )
  }

  // Ready / Generating state
  return (
    <div className="w-full h-full flex flex-col gap-4">
      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 flex-1 min-h-0">
        {/* Image Preview Area */}
        <div className="lg:col-span-2 flex flex-col gap-2 min-h-0 order-2 lg:order-1">
          <div className="bg-muted rounded-lg overflow-hidden flex-1 flex items-center justify-center border-2 border-border min-h-[300px] lg:min-h-[500px] relative">
            {status === 'generating' ? (
              <div className="text-center p-8">
                <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                <p className="text-foreground font-medium mb-2">Generating artwork...</p>
                {generationProgress > 0 && (
                  <div className="max-w-xs mx-auto">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="text-muted-foreground">
                        {(generationProgress * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-primary h-full transition-all duration-150"
                        style={{ width: `${generationProgress * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : generatedImage ? (
              <img
                src={generatedImage}
                alt="Generated artwork"
                className="w-full h-full object-contain rounded-lg"
              />
            ) : (
              <div className="text-center text-muted-foreground p-8">
                <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm font-medium">Your generated artwork will appear here</p>
                <p className="text-xs mt-2 opacity-75">Output: 384×384 pixels</p>
              </div>
            )}
          </div>
        </div>

        {/* Controls Panel */}
        <div className="order-1 lg:order-2">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle>Generate Art</CardTitle>
            </CardHeader>
            <div className="p-5 pt-0 flex-1 flex flex-col">
              <div className="space-y-4 flex-1">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="e.g., a cute fox with big eyes, autumn leaves in the background"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                    disabled={status === 'generating'}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Tip: More detailed descriptions produce better results
                  </p>
                </div>

                <Dropdown
                  label="Art Style"
                  value={styleId}
                  onChange={setStyleId}
                  options={styleOptions}
                />

                <Button
                  onClick={handleGenerate}
                  disabled={!subject.trim() || status === 'generating'}
                  fullWidth
                  size="lg"
                >
                  {status === 'generating' ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate
                    </>
                  )}
                </Button>
              </div>

              {/* Download section */}
              {generatedImage && (
                <div className="mt-4 pt-4 border-t border-border">
                  <Button onClick={handleDownload} variant="secondary" fullWidth>
                    <Download className="w-4 h-4 mr-2" />
                    Download Image
                  </Button>
                  {generationTime && (
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      Generated in {(generationTime / 1000).toFixed(1)}s
                    </p>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
