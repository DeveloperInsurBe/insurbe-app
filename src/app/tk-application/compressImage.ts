/**
 * Shrinks large JPG/PNG uploads in the browser before they are sent, so a
 * few phone photos stay within the request size limit and TK's upload time.
 *
 * Other formats (PDF, TIFF, BMP, Word, ...) and small images are returned
 * unchanged. Images are never scaled below `minWidth` x `minHeight`.
 */

const COMPRESSIBLE = ["image/jpeg", "image/png"];

const MAX_DIMENSION = 2000;

const TARGET_BYTES = 900 * 1024;

const loadImage = (file: File) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image"));
    };
    image.src = url;
  });

const toJpegBlob = (canvas: HTMLCanvasElement, quality: number) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));

export async function compressImage(file: File, minWidth = 0, minHeight = 0): Promise<File> {
  if (!COMPRESSIBLE.includes(file.type) || file.size <= TARGET_BYTES) return file;

  try {
    const image = await loadImage(file);
    const { naturalWidth: width, naturalHeight: height } = image;

    // Scale down to MAX_DIMENSION, but never below the required minimum.
    const minScale = Math.max(minWidth / width, minHeight / height, 0);
    const scale = Math.min(1, Math.max(MAX_DIMENSION / Math.max(width, height), minScale));

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);

    const context = canvas.getContext("2d");
    if (!context) return file;

    // JPEG has no transparency: paint PNGs onto white.
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    let blob: Blob | null = null;
    for (const quality of [0.85, 0.75, 0.65, 0.55]) {
      blob = await toJpegBlob(canvas, quality);
      if (blob && blob.size <= TARGET_BYTES) break;
    }

    if (!blob || blob.size >= file.size) return file;

    const name = file.name.replace(/\.(png|jpe?g)$/i, "") + ".jpg";
    return new File([blob], name, { type: "image/jpeg", lastModified: Date.now() });
  } catch {
    return file;
  }
}
