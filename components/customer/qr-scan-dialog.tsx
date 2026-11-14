"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { Camera, CameraOff, Loader2, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const CODE_PATTERN = /^[A-Z0-9]{4,20}$/;

function readCode(raw: string) {
  const text = raw.trim();
  if (!text) return null;

  try {
    const url = new URL(text);
    const fromQuery = url.searchParams.get("code")?.trim().toUpperCase();
    if (fromQuery && CODE_PATTERN.test(fromQuery)) return fromQuery;
  } catch {
    // Bukan URL, lanjut sebagai kode mentah.
  }

  const plain = text.toUpperCase();
  return CODE_PATTERN.test(plain) ? plain : null;
}

type ScanStatus = "idle" | "starting" | "scanning" | "error";

export function QrScanDialog({
  onResult,
}: {
  onResult: (code: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<ScanStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const handledRef = useRef(false);

  const stopCamera = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const scan = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || handledRef.current) return;

    if (video.readyState >= video.HAVE_ENOUGH_DATA) {
      const width = video.videoWidth;
      const height = video.videoHeight;

      if (width && height) {
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d", { willReadFrequently: true });

        if (context) {
          context.drawImage(video, 0, 0, width, height);
          const image = context.getImageData(0, 0, width, height);
          const decoded = jsQR(image.data, width, height, {
            inversionAttempts: "dontInvert",
          });
          const code = decoded?.data ? readCode(decoded.data) : null;

          if (code) {
            handledRef.current = true;
            stopCamera();
            setOpen(false);
            onResult(code);
          }
        }
      }
    }
  }, [onResult, stopCamera]);

  const startCamera = useCallback(async () => {
    stopCamera();
    handledRef.current = false;
    setError(null);
    setStatus("starting");

    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("error");
      setError("Browser ini tidak mendukung akses kamera.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) {
        stopCamera();
        return;
      }

      video.srcObject = stream;
      await video.play();
      setStatus("scanning");
      intervalRef.current = setInterval(scan, 200);
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "";
      setStatus("error");

      if (name === "NotAllowedError") {
        setError(
          "Izin kamera ditolak. Aktifkan izin kamera di browser, lalu coba lagi.",
        );
      } else if (name === "NotFoundError") {
        setError("Kamera tidak ditemukan di perangkat ini.");
      } else if (name === "NotReadableError") {
        setError("Kamera sedang dipakai aplikasi lain. Tutup aplikasi itu lalu coba lagi.");
      } else {
        setError("Kamera tidak bisa dibuka. Pastikan halaman diakses lewat HTTPS.");
      }
    }
  }, [scan, stopCamera]);

  useEffect(() => {
    if (!open) return;

    // Tunggu dialog ter-mount agar elemen video tersedia.
    const id = requestAnimationFrame(() => {
      void startCamera();
    });

    return () => {
      cancelAnimationFrame(id);
      stopCamera();
    };
  }, [open, startCamera, stopCamera]);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      stopCamera();
      handledRef.current = false;
      setStatus("idle");
      setError(null);
    }
    setOpen(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className="h-11 cursor-pointer gap-2 rounded-xl px-4 text-sm font-semibold"
          />
        }
      >
        <ScanLine className="size-4" aria-hidden="true" />
        Scan QR
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scan QR Code</DialogTitle>
          <DialogDescription>
            Arahkan kamera ke QR code pada poster UMKM atau paguyuban.
          </DialogDescription>
        </DialogHeader>

        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-neutral-950">
          <video
            ref={videoRef}
            className="size-full object-cover"
            width={640}
            height={640}
            playsInline
            muted
            autoPlay
            aria-label="Pratinjau kamera untuk scan QR"
          />

          {status !== "scanning" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center text-sm text-white">
              {status === "starting" && (
                <>
                  <Loader2
                    className="size-6 animate-spin"
                    aria-hidden="true"
                  />
                  <p>Membuka kamera...</p>
                </>
              )}

              {status === "error" && (
                <>
                  <CameraOff className="size-7" aria-hidden="true" />
                  <p role="alert" className="text-pretty leading-relaxed">
                    {error}
                  </p>
                  <Button
                    type="button"
                    variant="secondary"
                    className="h-11 cursor-pointer px-4"
                    onClick={() => void startCamera()}
                  >
                    Coba Lagi
                  </Button>
                </>
              )}

              {status === "idle" && (
                <>
                  <Camera className="size-7" aria-hidden="true" />
                  <p>Kamera belum aktif.</p>
                </>
              )}
            </div>
          )}

          {status === "scanning" && (
            <div
              className="pointer-events-none absolute inset-6 rounded-lg border-2 border-white/80"
              aria-hidden="true"
            />
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

        <p className="text-center text-xs text-muted-foreground">
          Kamera memerlukan HTTPS atau localhost.
        </p>
      </DialogContent>
    </Dialog>
  );
}
