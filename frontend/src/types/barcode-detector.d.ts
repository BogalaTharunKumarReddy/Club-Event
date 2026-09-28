/**
 * Minimal ambient declarations for the Barcode Detection API.
 *
 * The API ships in Chromium-based browsers (Chrome, Edge, Android WebView) but
 * is not yet part of the standard TypeScript DOM typings, so we declare only the
 * surface the QR scanner uses. Runtime code must still feature-detect via
 * `window.BarcodeDetector` because Safari and Firefox do not implement it.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/BarcodeDetector
 */

interface DetectedBarcode {
  readonly rawValue: string;
  readonly format: string;
  readonly boundingBox: DOMRectReadOnly;
  readonly cornerPoints: ReadonlyArray<{ readonly x: number; readonly y: number }>;
}

interface BarcodeDetectorOptions {
  formats?: string[];
}

declare class BarcodeDetector {
  constructor(options?: BarcodeDetectorOptions);
  static getSupportedFormats(): Promise<string[]>;
  detect(source: CanvasImageSource | Blob | ImageData): Promise<DetectedBarcode[]>;
}

interface Window {
  BarcodeDetector?: typeof BarcodeDetector;
}
