import { useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useApp } from "@/components/app-context"
import { inferenceService, type InferenceResult } from "@/lib/inference"
import { generateUUID } from "@/lib/utils/uuid"

const STEPS = [
  "Loading image data",
  "Running disease detection model",
  "Scoring detections",
  "Preparing results",
]

export default function AnalysisPage() {
  const { capturedImage, setCurrentResult } = useApp()
  const navigate = useNavigate()
  const ran = useRef(false)

  useEffect(() => {
    if (!capturedImage) {
      navigate("/", { replace: true })
      return
    }
    if (ran.current) return
    ran.current = true

    const run = async () => {
      const img = new Image()
      img.src = capturedImage

      await new Promise<void>((resolve) => {
        if (img.complete) resolve()
        img.onload = () => resolve()
      })

      if (inferenceService.getStatus().status !== "ready") {
        await inferenceService.serve()
      }

      const results: InferenceResult[] =
        await inferenceService.run(img)

      const result = {
        id: generateUUID(),
        timestamp: Date.now(),
        imageDataUrl: capturedImage,
        detections: results,
      }

      setCurrentResult(result)

      // Save to IndexedDB history
      try {
        const { initHistoryDB, saveHistoryItem } = await import(
          "@/lib/history"
        )
        await initHistoryDB()

        const response = await fetch(capturedImage)
        const originalBlob = await response.blob()

        // Create processed image with annotations
        const processedCanvas = document.createElement("canvas")
        processedCanvas.width = 640
        processedCanvas.height = 640
        const ctx = processedCanvas.getContext("2d")
        if (ctx) {
          const tempImg = new Image()
          await new Promise<void>((resolve) => {
            tempImg.onload = () => resolve()
            tempImg.src = capturedImage
          })
          ctx.drawImage(tempImg, 0, 0, 640, 640)
        }
        const processedBlob: Blob = await new Promise((resolve) =>
          processedCanvas.toBlob(
            (b) => resolve(b ?? originalBlob),
            "image/jpeg",
            0.9,
          ),
        )

        await saveHistoryItem({
          timestamp: result.timestamp,
          originalImage: originalBlob,
          processedImage: processedBlob,
          results: results,
        })
      } catch {
        // History save failed silently
      }

      navigate("/results", { replace: true })
    }

    run().catch(() => {
      navigate("/", { replace: true })
    })
  }, [capturedImage, navigate, setCurrentResult])

  return (
    <div
      className="flex flex-1 items-center justify-center bg-background p-8"
      role="status"
      aria-label="Analysing image, please wait"
    >
      <div className="flex flex-col items-center gap-6 max-w-80 w-full">
        <div className="relative w-[72px] h-[72px]">
          <div className="absolute inset-0 rounded-full border-[3px] border-border" />
          <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-primary animate-spin" />
        </div>

        <p className="font-mono text-xl font-semibold text-foreground tracking-wider">
          Analysing
        </p>

        <ul className="flex flex-col gap-3 w-full list-none">
          {STEPS.map((step, i) => (
            <li
              key={i}
              className="flex items-center gap-3 text-sm text-muted-foreground font-mono animate-[stepFade_0.4s_ease_forwards] opacity-0"
              style={{ animationDelay: `${i * 0.4}s` }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              <span>{step}</span>
            </li>
          ))}
        </ul>

        <p className="text-xs text-muted-foreground text-center font-mono tracking-wide">
          Running on-device &mdash; no data is transmitted
        </p>
      </div>

      <style>{`
        @keyframes stepFade {
          to { opacity: 1; color: var(--color-muted-foreground); }
        }
      `}</style>
    </div>
  )
}
