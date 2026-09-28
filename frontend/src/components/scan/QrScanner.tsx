import { useCallback, useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { Camera, CameraOff, Loader2, ScanLine } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

type ScannerState = 'idle' | 'starting' | 'running' | 'error';

interface QrScannerProps {
  /**
   * Called with the decoded QR value each time a code is detected. Detections
   * are debounced internally (a short cooldown between fires) so a single QR
   * held in frame doesn't trigger a burst of callbacks.
   */
  onDetected: (value: string) => void;
  /**
   * When true, detections are ignored — e.g. while a check-in request is in
   * flight — so the same ticket can't be submitted twice in quick succession.
   * The camera keeps running; only the callback is suppressed.
   */
  paused?: boolean;
  className?: string;
}

/**
 * Camera capability is the only hard requirement — every modern browser that
 * can open a camera can also decode QR codes here. Chromium exposes the fast
 * native {@link BarcodeDetector}; Safari and Firefox fall back to a WASM-free
 * JavaScript decoder (jsQR) that reads pixels off a hidden canvas.
 */
const CAN_USE_CAMERA =
  typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;
const HAS_BARCODE_DETECTOR =
  typeof window !== 'undefined' && 'BarcodeDetector' in window;

/** jsQR fallback runs a few times per second — enough to feel instant without pinning the CPU. */
const FALLBACK_SCAN_INTERVAL_MS = 180;

/**
 * Live QR-code scanner backed by the device's rear camera. It works in every
 * browser that grants camera access: Chromium uses the native Barcode Detection
 * API, while Safari/Firefox decode frames with the bundled jsQR library. A short
 * cooldown debounces repeated detections of the same code.
 *
 * Only the decoded value (an opaque ticket code) ever leaves the component —
 * the video stream is processed entirely on-device and released on unmount.
 */
export function QrScanner({ onDetected, paused = false, className }: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<BarcodeDetector | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const runningRef = useRef(false);
  const cooldownRef = useRef(false);
  const lastScanRef = useRef(0);

  // The detect loop is created once; keep the latest callback / paused flag in
  // refs so it always observes current values without being torn down.
  const onDetectedRef = useRef(onDetected);
  const pausedRef = useRef(paused);
  useEffect(() => {
    onDetectedRef.current = onDetected;
  }, [onDetected]);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  const [state, setState] = useState<ScannerState>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const stop = useCallback(() => {
    runningRef.current = false;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    const stream = streamRef.current;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setState('idle');
  }, []);

  /**
   * Decode the current video frame to a QR string, or null if none is found.
   * Prefers the native detector; otherwise reads pixels through a reused canvas
   * and hands them to jsQR.
   */
  const decodeFrame = useCallback(async (video: HTMLVideoElement): Promise<string | null> => {
    const detector = detectorRef.current;
    if (detector) {
      try {
        const codes = await detector.detect(video);
        return codes[0]?.rawValue?.trim() || null;
      } catch {
        // Transient per-frame decode failures are expected — keep scanning.
        return null;
      }
    }

    const width = video.videoWidth;
    const height = video.videoHeight;
    if (!width || !height) return null;

    let canvas = canvasRef.current;
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvasRef.current = canvas;
    }
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, width, height);

    let image: ImageData;
    try {
      image = ctx.getImageData(0, 0, width, height);
    } catch {
      return null;
    }
    const result = jsQR(image.data, image.width, image.height, {
      inversionAttempts: 'dontInvert',
    });
    return result?.data?.trim() || null;
  }, []);

  const tick = useCallback(async () => {
    if (!runningRef.current) return;
    const video = videoRef.current;
    // readyState >= 2 (HAVE_CURRENT_DATA) means there's a frame to analyse.
    if (video && video.readyState >= 2) {
      // The JS fallback is comparatively expensive, so pace it; the native
      // detector is cheap enough to run every animation frame.
      const now = performance.now();
      const throttled = !detectorRef.current && now - lastScanRef.current < FALLBACK_SCAN_INTERVAL_MS;
      if (!throttled) {
        lastScanRef.current = now;
        const value = await decodeFrame(video);
        if (
          value &&
          runningRef.current &&
          !cooldownRef.current &&
          !pausedRef.current
        ) {
          cooldownRef.current = true;
          window.setTimeout(() => {
            cooldownRef.current = false;
          }, 1500);
          onDetectedRef.current(value);
        }
      }
    }
    if (runningRef.current) {
      rafRef.current = requestAnimationFrame(tick);
    }
  }, [decodeFrame]);

  const start = useCallback(async () => {
    if (!CAN_USE_CAMERA) {
      setState('error');
      setMessage('Camera access is unavailable here — type the ticket code instead.');
      return;
    }
    setState('starting');
    setMessage(null);
    try {
      if (!detectorRef.current && HAS_BARCODE_DETECTOR && window.BarcodeDetector) {
        detectorRef.current = new window.BarcodeDetector({ formats: ['qr_code'] });
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });
      const video = videoRef.current;
      if (!video) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;
      video.srcObject = stream;
      await video.play();
      runningRef.current = true;
      cooldownRef.current = false;
      lastScanRef.current = 0;
      setState('running');
      rafRef.current = requestAnimationFrame(tick);
    } catch (err) {
      const name = (err as { name?: string } | undefined)?.name;
      stop();
      setState('error');
      setMessage(
        name === 'NotAllowedError' || name === 'SecurityError'
          ? 'Camera permission was denied. Allow it in your browser settings, or type the code below.'
          : name === 'NotFoundError' || name === 'OverconstrainedError'
            ? 'No camera was found on this device — type the ticket code below instead.'
            : "Couldn't start the camera — type the ticket code below instead.",
      );
    }
  }, [stop, tick]);

  // Release the camera whenever the scanner leaves the screen.
  useEffect(() => stop, [stop]);

  if (!CAN_USE_CAMERA) {
    return (
      <div
        className={cn(
          'flex items-start gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-400',
          className,
        )}
      >
        <CameraOff className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          Camera access isn't available in this browser. Open the page over HTTPS on a device
          with a camera, or type the ticket code below.
        </span>
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-700">
        <video
          ref={videoRef}
          className={cn(
            'h-full w-full object-cover transition-opacity',
            state === 'running' ? 'opacity-100' : 'opacity-0',
          )}
          muted
          playsInline
        />

        {state !== 'running' && (
          <div className="absolute inset-0 grid place-items-center px-4 text-center">
            {state === 'starting' ? (
              <span className="inline-flex items-center gap-2 text-sm text-slate-200">
                <Loader2 className="h-4 w-4 animate-spin" /> Starting camera…
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 text-sm text-slate-300">
                <Camera className="h-4 w-4" /> Camera is off
              </span>
            )}
          </div>
        )}

        {/* Framing reticle shown while live. */}
        {state === 'running' && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="h-40 w-40 rounded-2xl border-2 border-white/80 shadow-[0_0_0_9999px_rgba(15,23,42,0.35)]" />
            <ScanLine className="absolute h-6 w-6 animate-pulse text-white/90" />
          </div>
        )}
      </div>

      {message && (
        <p className="text-xs text-rose-600 dark:text-rose-400">{message}</p>
      )}

      {state === 'running' ? (
        <Button type="button" variant="secondary" size="sm" fullWidth onClick={stop}>
          <CameraOff className="h-4 w-4" /> Stop camera
        </Button>
      ) : (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          fullWidth
          loading={state === 'starting'}
          onClick={start}
        >
          <Camera className="h-4 w-4" /> Scan with camera
        </Button>
      )}
    </div>
  );
}
