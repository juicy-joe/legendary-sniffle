"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, ScanLine, X } from "lucide-react";
import { lookupProductByCode } from "@/app/admin/(dashboard)/warehouse/actions";

// Text input first, camera second — a physical USB/Bluetooth barcode
// scanner is a keyboard-wedge device: it just types the code into whatever
// input has focus and sends Enter, so the input alone already covers that
// hardware with zero extra code. The camera path (dynamically imported —
// see below) is only for scanning with a phone/tablet that has no separate
// scanner attached.
export default function BarcodeLookup() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [scanning, setScanning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function lookup(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return;
    setPending(true);
    setError(null);
    const result = await lookupProductByCode(trimmed);
    setPending(false);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    router.push(`/admin/products/${result.productId}/edit`);
  }

  return (
    <div className="rounded-[6px] border border-ink/10 bg-paper p-6">
      <p className="mb-3 flex items-center gap-2 text-sm font-medium text-ink">
        <ScanLine className="h-4 w-4" /> Look Up by SKU / Barcode
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          lookup(code);
        }}
        className="flex flex-wrap items-center gap-3"
      >
        <input
          ref={inputRef}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Scan or type a code, then press Enter"
          autoComplete="off"
          className="w-full max-w-xs rounded-[3px] border border-ink/20 bg-transparent px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-gold-dark"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-[3px] border border-ink px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.1em] text-ink transition-colors hover:bg-ink hover:text-paper disabled:opacity-60"
        >
          {pending ? "Looking up..." : "Look Up"}
        </button>
        <button
          type="button"
          onClick={() => setScanning((s) => !s)}
          className="flex items-center gap-1.5 rounded-[3px] border border-ink/20 px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.1em] text-ink/70 transition-colors hover:border-ink hover:text-ink"
        >
          {scanning ? <X className="h-3.5 w-3.5" /> : <Camera className="h-3.5 w-3.5" />}
          {scanning ? "Stop Camera" : "Scan with Camera"}
        </button>
      </form>
      {error && (
        <p role="alert" className="mt-2 text-xs text-red-700">
          {error}
        </p>
      )}
      {scanning && (
        <CameraScanner
          onResult={(text) => {
            setScanning(false);
            setCode(text);
            lookup(text);
          }}
        />
      )}
    </div>
  );
}

function CameraScanner({ onResult }: { onResult: (text: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    // Dynamically imported: @zxing/browser pulls in decoding logic that has
    // no reason to be in the main admin bundle for the (much more common)
    // keyboard-wedge/typed-code path above.
    let stopFn: (() => void) | undefined;

    import("@zxing/browser")
      .then(({ BrowserMultiFormatReader }) => {
        if (cancelled || !videoRef.current) return;
        const reader = new BrowserMultiFormatReader();
        return reader.decodeFromVideoDevice(undefined, videoRef.current, (result, err, controls) => {
          stopFn = () => controls.stop();
          if (result) {
            controls.stop();
            onResult(result.getText());
          }
          // NotFoundException fires continuously between frames while
          // nothing is in view — that's the normal idle state, not a
          // failure, so it's deliberately not surfaced as an error here.
        });
      })
      .catch((err) => {
        if (!cancelled) setCameraError(err instanceof Error ? err.message : "Couldn't access the camera.");
      });

    return () => {
      cancelled = true;
      stopFn?.();
    };
  }, [onResult]);

  return (
    <div className="mt-4">
      <video ref={videoRef} className="w-full max-w-sm rounded-[3px] border border-ink/15" muted playsInline />
      {cameraError && <p className="mt-2 text-xs text-red-700">{cameraError}</p>}
    </div>
  );
}
