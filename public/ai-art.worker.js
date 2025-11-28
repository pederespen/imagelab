// AI Art Generator Web Worker
// Uses @huggingface/transformers with Janus-Pro-1B-ONNX for text-to-image generation

const MODEL_ID = 'onnx-community/Janus-Pro-1B-ONNX'

// Dynamic import from CDN
let transformers = null

async function loadTransformers() {
  if (transformers) return transformers
  transformers = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.0')
  return transformers
}

// Feature detection for WebGPU fp16 support
let fp16_supported = false

async function check() {
  try {
    const adapter = await navigator.gpu?.requestAdapter()
    if (!adapter) {
      self.postMessage({ type: 'error', message: 'WebGPU is not supported in this browser.' })
      return
    }
    fp16_supported = adapter.features.has('shader-f16')
    self.postMessage({ type: 'status', status: 'idle' })
  } catch (e) {
    self.postMessage({ type: 'error', message: 'Failed to initialize WebGPU: ' + e.message })
  }
}

// Singleton pattern for model loading
let processorPromise = null
let modelPromise = null

async function getInstance(progressCallback = null) {
  const { AutoProcessor, MultiModalityCausalLM } = await loadTransformers()

  if (!processorPromise) {
    processorPromise = AutoProcessor.from_pretrained(MODEL_ID, {
      progress_callback: progressCallback,
    })
  }

  if (!modelPromise) {
    modelPromise = MultiModalityCausalLM.from_pretrained(MODEL_ID, {
      dtype: fp16_supported
        ? {
            prepare_inputs_embeds: 'q4',
            language_model: 'q4f16',
            lm_head: 'fp16',
            gen_head: 'fp16',
            gen_img_embeds: 'fp16',
            image_decode: 'fp32',
          }
        : {
            prepare_inputs_embeds: 'fp32',
            language_model: 'q4',
            lm_head: 'fp32',
            gen_head: 'fp32',
            gen_img_embeds: 'fp32',
            image_decode: 'fp32',
          },
      device: {
        prepare_inputs_embeds: 'wasm',
        language_model: 'webgpu',
        lm_head: 'webgpu',
        gen_head: 'webgpu',
        gen_img_embeds: 'webgpu',
        image_decode: 'webgpu',
      },
      progress_callback: progressCallback,
    })
  }

  return Promise.all([processorPromise, modelPromise])
}

// Progress streamer for image generation
class ProgressStreamer {
  constructor(total, callback) {
    this.total = total
    this.callback = callback
    this.count = 0
    this.startTime = null
  }

  put(value) {
    if (this.startTime === null) {
      this.startTime = performance.now()
    }
    this.count += value.length
    const progress = this.count / this.total
    this.callback({ progress })
  }

  end() {
    const time = performance.now() - this.startTime
    this.callback({ progress: 1, time })
  }
}

async function load() {
  self.postMessage({ type: 'status', status: 'loading' })

  try {
    const progressCallback = data => {
      if (data.status === 'progress') {
        self.postMessage({
          type: 'progress',
          file: data.file,
          progress: data.progress,
          total: data.total,
        })
      }
    }

    await getInstance(progressCallback)
    self.postMessage({ type: 'status', status: 'ready' })
  } catch (e) {
    console.error('Error loading model:', e)
    self.postMessage({
      type: 'error',
      message: e.message || 'Failed to load the AI model.',
    })
  }
}

async function generate(prompt) {
  self.postMessage({ type: 'status', status: 'generating' })

  try {
    const startTime = performance.now()
    const [processor, model] = await getInstance()

    // Prepare conversation for text-to-image (Janus-Pro uses <|User|> role format)
    const conversation = [
      {
        role: '<|User|>',
        content: prompt,
      },
    ]

    const inputs = await processor(conversation, {
      chat_template: 'text_to_image',
    })

    // Progress callback during generation
    const progressCallback = data => {
      self.postMessage({
        type: 'generation-progress',
        progress: data.progress,
      })
    }

    const numImageTokens = processor.num_image_tokens
    const streamer = new ProgressStreamer(numImageTokens, progressCallback)

    // Generate the image
    const outputs = await model.generate_images({
      ...inputs,
      min_new_tokens: numImageTokens,
      max_new_tokens: numImageTokens,
      do_sample: true,
      streamer,
    })

    // Convert to blob and create URL
    const blob = await outputs[0].toBlob()
    const imageUrl = URL.createObjectURL(blob)
    const generationTime = performance.now() - startTime

    self.postMessage({
      type: 'result',
      imageUrl,
      generationTime,
    })
  } catch (e) {
    console.error('Error generating image:', e)
    self.postMessage({
      type: 'error',
      message: e.message || 'Failed to generate image.',
    })
  }
}

// Listen for messages from main thread
self.addEventListener('message', async e => {
  const { type, ...data } = e.data

  switch (type) {
    case 'check':
      await check()
      break

    case 'load':
      await load()
      break

    case 'generate':
      await generate(data.prompt)
      break
  }
})
