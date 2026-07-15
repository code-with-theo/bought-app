import type { ProductImage } from "@/types/product";

const acceptedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export class ImageProcessingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImageProcessingError";
  }
}

export interface ImageCompressionOptions {
  maxDimension?: number;
  quality?: number;
  maxBytes?: number;
}

const readAsDataUrl = (file: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new ImageProcessingError("图片读取失败"));
    reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new ImageProcessingError("图片读取失败"));
    reader.readAsDataURL(file);
  });

const loadImage = (source: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new ImageProcessingError("图片无法解析"));
    image.src = source;
  });

const canvasBlob = (canvas: HTMLCanvasElement, quality: number): Promise<Blob> =>
  new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new ImageProcessingError("图片压缩失败")), "image/webp", quality));

/** Compresses a user-selected image into a recoverable data URL suitable for IndexedDB. */
export async function compressProductImage(file: File, options: ImageCompressionOptions = {}): Promise<ProductImage> {
  const maxDimension = options.maxDimension ?? 1600;
  const quality = options.quality ?? 0.82;
  const maxBytes = options.maxBytes ?? 1_000_000;
  if (!acceptedTypes.has(file.type)) throw new ImageProcessingError("仅支持 JPG、PNG 或 WebP 图片");
  if (typeof window === "undefined" || typeof FileReader === "undefined") throw new ImageProcessingError("图片处理仅可在浏览器中进行");

  const original = await loadImage(await readAsDataUrl(file));
  const scale = Math.min(1, maxDimension / Math.max(original.naturalWidth, original.naturalHeight));
  const width = Math.max(1, Math.round(original.naturalWidth * scale));
  const height = Math.max(1, Math.round(original.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new ImageProcessingError("图片处理不可用");
  context.drawImage(original, 0, 0, width, height);
  const blob = await canvasBlob(canvas, quality);
  if (blob.size > maxBytes) throw new ImageProcessingError("压缩后的图片仍超过 1MB，请换一张试试");
  return { dataUrl: await readAsDataUrl(blob), mimeType: "image/webp", width, height };
}
