import { useRef, useEffect, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { Camera, Image, AlertCircle, RefreshCw } from "lucide-react"
import { useApp } from "@/components/app-context"

export default function CameraPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [permission, setPermission] = useState<
    "pending" | "granted" | "denied"
  >("pending")
  const [cameraError, setCameraError] = useState<string | null>(null)

  const {
    setCapturedImage,
    cameraFacingMode: facingMode,
    setCameraFacingMode: setFacingMode,
  } = useApp()
  const navigate = useNavigate()

  const requestInProgressRef = useRef(false)
  const pendingRequestRef = useRef<"environment" | "user" | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [])

  const startCamera = useCallback(
    async (facing: "environment" | "user") => {
      if (requestInProgressRef.current) {
        pendingRequestRef.current = facing
        return
      }
      requestInProgressRef.current = true
      let currentFacing = facing

      while (currentFacing) {
        try {
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop())
            if (videoRef.current) {
              videoRef.current.srcObject = null
            }
            streamRef.current = null
            await new Promise((resolve) => setTimeout(resolve, 500))
          }

          if (
            !navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia
          ) {
            if (mountedRef.current) {
              setPermission("denied")
              setCameraError(
                "Camera API is unavailable. Please ensure you are using HTTPS.",
              )
            }
            break
          }

          let stream: MediaStream
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              video: {
                facingMode: currentFacing,
                width: { ideal: 1920 },
                height: { ideal: 1080 },
              },
            })
          } catch (err: unknown) {
            const error = err as { name?: string }
            if (
              error.name === "NotReadableError" ||
              error.name === "TrackStartError" ||
              error.name === "OverconstrainedError"
            ) {
              await new Promise((resolve) => setTimeout(resolve, 500))
              stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: currentFacing },
              })
            } else {
              throw err
            }
          }

          if (!mountedRef.current) {
            stream.getTracks().forEach((t) => t.stop())
            break
          }

          if (pendingRequestRef.current) {
            stream.getTracks().forEach((t) => t.stop())
            await new Promise((resolve) => setTimeout(resolve, 500))
          } else {
            streamRef.current = stream
            if (videoRef.current) {
              videoRef.current.srcObject = stream
            }
            setPermission("granted")
            setCameraError(null)
          }
        } catch (err: unknown) {
          if (!mountedRef.current) break
          if (!pendingRequestRef.current) {
            const error = err as { name?: string }
            if (error.name === "NotAllowedError") {
              setPermission("denied")
              setCameraError(
                "Camera permission was denied. Please allow camera access in your browser settings, or use the gallery option.",
              )
            } else if (error.name === "NotFoundError") {
              setPermission("denied")
              setCameraError(
                "No camera found on this device. Please use the gallery option to select a photo.",
              )
            } else if (
              error.name === "NotReadableError" ||
              error.name === "TrackStartError"
            ) {
              setCameraError(
                "Camera is already in use by another application. Please try switching cameras.",
              )
            } else {
              setPermission("denied")
              setCameraError(
                "Unable to access camera. Please use the gallery option to select a photo.",
              )
            }
            break
          }
        }

        const nextMode = pendingRequestRef.current
        pendingRequestRef.current = null
        currentFacing = nextMode as typeof currentFacing
      }

      requestInProgressRef.current = false
    },
    [],
  )

  useEffect(() => {
    startCamera(facingMode)
  }, [facingMode, startCamera])

  const handleCapture = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    if (facingMode === "user") {
      ctx.translate(canvas.width, 0)
      ctx.scale(-1, 1)
    }

    ctx.drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92)
    setCapturedImage(dataUrl)
    navigate("/preview")
  }

  const handleGallery = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result
      if (typeof result === "string") {
        setCapturedImage(result)
        navigate("/preview")
      }
    }
    reader.readAsDataURL(file)
  }

  const toggleCamera = () => {
    setFacingMode(facingMode === "environment" ? "user" : "environment")
  }

  return (
    <div className="flex flex-col flex-1 bg-black relative">
      <div className="flex-1 relative overflow-hidden bg-[#0a0a0a] min-h-0">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover block ${
            facingMode === "user" ? "scale-x-[-1]" : ""
          }`}
          style={{ display: permission === "granted" ? "block" : "none" }}
          aria-label="Live camera feed"
        />

        {permission !== "granted" && (
          <div
            className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground"
            role="status"
          >
            <Camera size={40} className="opacity-40" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">
              Camera unavailable
            </p>
          </div>
        )}

        {/* Corner brackets */}
        <div
          className="absolute w-6 h-6 border-t-2 border-l-2 border-white/60 pointer-events-none top-5 left-5"
          aria-hidden="true"
        />
        <div
          className="absolute w-6 h-6 border-t-2 border-r-2 border-white/60 pointer-events-none top-5 right-5"
          aria-hidden="true"
        />
        <div
          className="absolute w-6 h-6 border-b-2 border-l-2 border-white/60 pointer-events-none bottom-5 left-5"
          aria-hidden="true"
        />
        <div
          className="absolute w-6 h-6 border-b-2 border-r-2 border-white/60 pointer-events-none bottom-5 right-5"
          aria-hidden="true"
        />
      </div>

      {cameraError && (
        <div
          className="absolute top-0 left-0 right-0 flex items-start gap-2 p-4 bg-black/80 backdrop-blur-sm border-b border-white/10 text-red-300 text-sm z-30"
          role="alert"
        >
          <AlertCircle size={16} className="shrink-0 mt-0.5" aria-hidden="true" />
          <p className="leading-relaxed">{cameraError}</p>
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-8 pb-8 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-20">
        <button
          className="flex flex-col items-center gap-1 text-white/70 hover:text-white transition-colors min-w-14 min-h-14 justify-center rounded-md"
          onClick={() => fileInputRef.current?.click()}
          aria-label="Choose from gallery"
        >
          <Image size={20} aria-hidden="true" />
          <span className="text-[11px] font-medium tracking-wide uppercase">
            Gallery
          </span>
        </button>

        <button
          className="w-[72px] h-[72px] rounded-full bg-transparent border-[3px] border-white/80 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed shrink-0 md:w-20 md:h-20"
          onClick={handleCapture}
          disabled={permission !== "granted"}
          aria-label="Capture photo for analysis"
        >
          <span className="w-[54px] h-[54px] rounded-full bg-white block md:w-[62px] md:h-[62px]" />
        </button>

        {permission === "granted" ? (
          <button
            className="w-12 h-12 bg-white/15 text-white rounded-full flex items-center justify-center transition-colors hover:bg-white/25 active:scale-95 shrink-0"
            onClick={toggleCamera}
            aria-label="Flip camera"
          >
            <RefreshCw size={22} aria-hidden="true" />
          </button>
        ) : (
          <div className="w-14" aria-hidden="true" />
        )}
      </div>

      <p className="absolute bottom-[calc(100px+env(safe-area-inset-bottom,0px))] left-0 right-0 text-center px-4 text-xs text-white/60 z-15 pointer-events-none">
        Position the fish clearly in frame. Ensure good lighting.
      </p>

      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleGallery}
        aria-label="Upload image from gallery"
      />
    </div>
  )
}
