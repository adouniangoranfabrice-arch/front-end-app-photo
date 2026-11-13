import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import api from "../../api/axios";

export interface FaceSearchResult {
  matches: { photo_id: string; similarity: number }[];
  count: number;
  indexed_photos: number;
}

interface FaceSearchModalProps {
  publicToken: string;
  onClose: () => void;
  onResult: (result: FaceSearchResult) => void;
}

type Step = "camera" | "preview" | "searching";

const MAX_SIDE = 1024;

/** Réduit l'image avant l'envoi (plus rapide, suffisant pour la reconnaissance). */
function canvasToBlob(source: CanvasImageSource, width: number, height: number): Promise<Blob> {
  const scale = Math.min(1, MAX_SIDE / Math.max(width, height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  canvas.getContext("2d")!.drawImage(source, 0, 0, canvas.width, canvas.height);

  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Capture impossible"))),
      "image/jpeg",
      0.9
    )
  );
}

async function fileToBlob(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  try {
    return await canvasToBlob(bitmap, bitmap.width, bitmap.height);
  } finally {
    bitmap.close();
  }
}

export default function FaceSearchModal({ publicToken, onClose, onResult }: FaceSearchModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("camera");
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [error, setError] = useState("");
  const [photo, setPhoto] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraReady(false);
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError("");

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Votre navigateur ne permet pas d'utiliser la caméra. Importez plutôt une photo.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraReady(true);
      }
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "";
      setCameraError(
        name === "NotAllowedError"
          ? "L'accès à la caméra a été refusé. Autorisez-le dans votre navigateur, ou importez une photo."
          : name === "NotFoundError"
            ? "Aucune caméra détectée. Importez plutôt une photo."
            : "Impossible d'ouvrir la caméra. Importez plutôt une photo."
      );
    }
  }, []);

  // Ouvrir la caméra à l'ouverture, la fermer en quittant
  useEffect(() => {
    void startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  // Libérer l'aperçu
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // Échap pour fermer
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && step !== "searching") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, step]);

  const showPreview = (blob: Blob) => {
    stopCamera();
    setPhoto(blob);
    setPreviewUrl(URL.createObjectURL(blob));
    setError("");
    setStep("preview");
  };

  const capture = async () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    try {
      showPreview(await canvasToBlob(video, video.videoWidth, video.videoHeight));
    } catch {
      setError("La capture a échoué. Réessayez.");
    }
  };

  const onFileChosen = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Choisissez une image (JPG, PNG ou WEBP).");
      return;
    }
    try {
      showPreview(await fileToBlob(file));
    } catch {
      setError("Impossible de lire cette image.");
    }
  };

  const retake = () => {
    setPhoto(null);
    setPreviewUrl("");
    setError("");
    setStep("camera");
    void startCamera();
  };

  const search = async () => {
    if (!photo) return;

    setStep("searching");
    setError("");

    const formData = new FormData();
    formData.append("selfie", photo, "selfie.jpg");

    try {
      const { data } = await api.post<FaceSearchResult>(
        `/public/events/${encodeURIComponent(publicToken)}/face-search`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" }, timeout: 120000 }
      );
      onResult(data);
    } catch (err) {
      const detail = axios.isAxiosError(err) ? err.response?.data?.detail : null;
      setError(
        typeof detail === "string"
          ? detail
          : "La recherche a échoué. Vérifiez votre connexion et réessayez."
      );
      setStep("preview");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/80 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="face-search-title"
      onClick={() => step !== "searching" && onClose()}
    >
      <div
        className="relative flex max-h-[100dvh] w-full flex-col overflow-y-auto rounded-t-3xl border border-white/10 bg-neutral-900 text-white shadow-2xl sm:max-w-md sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête */}
        <div className="flex items-center justify-between px-5 pb-2 pt-5">
          <div>
            <h2 id="face-search-title" className="text-lg font-semibold">
              Retrouver mes photos
            </h2>
            <p className="mt-0.5 text-sm text-neutral-400">
              Prenez un selfie, on cherche votre visage dans la galerie.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={step === "searching"}
            className="-mr-1 rounded-full p-2 text-neutral-400 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
            aria-label="Fermer"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Zone image */}
        <div className="px-5 pt-3">
          <div className="relative mx-auto aspect-[3/4] w-full max-w-[320px] overflow-hidden rounded-2xl bg-black">
            {step === "camera" ? (
              <>
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className={`h-full w-full -scale-x-100 object-cover transition-opacity ${
                    cameraReady ? "opacity-100" : "opacity-0"
                  }`}
                />

                {/* Guide ovale pour placer le visage */}
                {cameraReady && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="h-[62%] w-[62%] rounded-[50%] border-2 border-dashed border-white/70 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
                  </div>
                )}

                {!cameraReady && !cameraError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-sm text-neutral-400">
                    <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                    Ouverture de la caméra…
                  </div>
                )}

                {cameraError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
                    <svg viewBox="0 0 24 24" width="36" height="36" fill="none" className="text-neutral-500" aria-hidden="true">
                      <path d="M3 3l18 18M10.5 6H14l1.5 2H19a2 2 0 012 2v7M17 19H5a2 2 0 01-2-2v-7a2 2 0 012-2h1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="text-sm leading-6 text-neutral-300">{cameraError}</p>
                  </div>
                )}
              </>
            ) : (
              <>
                <img src={previewUrl} alt="Votre photo" className="h-full w-full object-cover" />

                {step === "searching" && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 text-sm">
                    {/* Ligne de scan animée */}
                    <div className="absolute inset-x-6 h-0.5 animate-[scan_1.6s_ease-in-out_infinite] bg-brand-400 shadow-[0_0_12px_2px_rgba(167,139,250,0.8)]" />
                    <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                    Recherche de votre visage…
                  </div>
                )}
              </>
            )}
          </div>

          <style>{`@keyframes scan { 0%,100% { top: 0 } 50% { top: calc(100% - 2px) } }`}</style>
        </div>

        {/* Conseils */}
        {step === "camera" && !cameraError && (
          <p className="px-5 pt-3 text-center text-xs text-neutral-500">
            Visage bien en face, sans lunettes de soleil, dans un endroit éclairé.
          </p>
        )}

        {error && (
          <p role="alert" className="mx-5 mt-3 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2.5 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          {step === "camera" && (
            <>
              {cameraReady && (
                <button
                  type="button"
                  onClick={() => void capture()}
                  className="flex items-center justify-center gap-2 rounded-xl bg-brand-500 py-3.5 text-sm font-semibold transition hover:bg-brand-400"
                >
                  <span className="h-4 w-4 rounded-full border-2 border-white" aria-hidden="true" />
                  Prendre la photo
                </button>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`rounded-xl py-3 text-sm font-semibold transition ${
                  cameraReady
                    ? "text-neutral-300 hover:bg-white/5"
                    : "bg-brand-500 text-white hover:bg-brand-400"
                }`}
              >
                Importer une photo
              </button>
            </>
          )}

          {step !== "camera" && (
            <>
              <button
                type="button"
                onClick={() => void search()}
                disabled={step === "searching"}
                className="rounded-xl bg-brand-500 py-3.5 text-sm font-semibold transition hover:bg-brand-400 disabled:cursor-wait disabled:opacity-60"
              >
                {step === "searching" ? "Recherche en cours…" : "Rechercher mes photos"}
              </button>
              <button
                type="button"
                onClick={retake}
                disabled={step === "searching"}
                className="rounded-xl py-3 text-sm font-semibold text-neutral-300 transition hover:bg-white/5 disabled:opacity-40"
              >
                Reprendre
              </button>
            </>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="user"
            className="hidden"
            onChange={(e) => {
              void onFileChosen(e.target.files?.[0]);
              e.target.value = "";
            }}
          />

          <p className="flex items-start justify-center gap-1.5 pt-1 text-center text-[11px] leading-4 text-neutral-500">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" className="mt-0.5 shrink-0" aria-hidden="true">
              <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="2" />
              <path d="M8 11V8a4 4 0 018 0v3" stroke="currentColor" strokeWidth="2" />
            </svg>
            Votre photo sert uniquement à la recherche et n'est jamais enregistrée.
          </p>
        </div>
      </div>
    </div>
  );
}
