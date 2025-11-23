declare module 'gif.js.optimized' {
  interface GIFOptions {
    workers?: number
    quality?: number
    width: number
    height: number
    workerScript?: string
  }

  interface AddFrameOptions {
    delay?: number
    copy?: boolean
  }

  export default class GIF {
    constructor(options: GIFOptions)
    addFrame(
      canvas: HTMLCanvasElement | CanvasRenderingContext2D | ImageData,
      options?: AddFrameOptions
    ): void
    on(event: 'finished', callback: (blob: Blob) => void): void
    on(event: 'progress', callback: (progress: number) => void): void
    render(): void
    abort(): void
  }
}
