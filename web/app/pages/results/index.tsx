import { useRef, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Camera,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
} from "lucide-react"
import type { InferenceResult } from "@/lib/inference"
import type { ScanResult } from "@/components/app-context"
import { useApp } from "@/components/app-context"
import {
  getDiseaseInfo,
  getSeverityColor,
  type Severity,
} from "@/lib/disease-info"

interface Props {
  result: ScanResult
  showTimestamp?: boolean
}

function formatTimestamp(ts: number) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(ts))
}

function SeverityIcon({ severity }: { severity: Severity }) {
  const cls = getSeverityColor(severity)
  switch (severity) {
    case "healthy":
      return <CheckCircle size={15} className={cls.color} aria-hidden="true" />
    case "low":
      return (
        <AlertTriangle size={15} className={cls.color} aria-hidden="true" />
      )
    case "medium":
    case "high":
      return <AlertCircle size={15} className={cls.color} aria-hidden="true" />
  }
}

function AnnotatedImage({
  imageDataUrl,
  detections,
}: {
  imageDataUrl: string
  detections: InferenceResult[]
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 })

  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      setImgSize({ w: img.naturalWidth, h: img.naturalHeight })
    }
    img.src = imageDataUrl
  }, [imageDataUrl])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || imgSize.w === 0) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    detections.forEach((det) => {
      const info = getDiseaseInfo(det.class)
      const colors: Record<string, string> = {
        healthy: "#3fb950",
        low: "#d29922",
        medium: "#f85149",
        high: "#f85149",
      }
      const color = colors[info.severity] ?? "#f85149"

      const x = det.bbox.x * canvas.width
      const y = det.bbox.y * canvas.height
      const w = det.bbox.width * canvas.width
      const h = det.bbox.height * canvas.height

      ctx.strokeStyle = color
      ctx.lineWidth = 2.5
      ctx.strokeRect(x, y, w, h)

      const labelText = `${info.name} ${Math.round(det.confidence * 100)}%`
      ctx.font = "bold 12px 'IBM Plex Mono', monospace"
      const textW = ctx.measureText(labelText).width
      const labelH = 20
      const labelY = y > labelH + 4 ? y - labelH - 2 : y + h + 2

      ctx.fillStyle = color
      ctx.fillRect(x, labelY, textW + 10, labelH)

      ctx.fillStyle = "#000"
      ctx.fillText(labelText, x + 5, labelY + 14)
    })
  }, [detections, imgSize])

  const aspectRatio = imgSize.w > 0 ? imgSize.w / imgSize.h : 16 / 9

  return (
    <div
      className="relative w-full bg-black max-h-[50vh] overflow-hidden"
      style={{ aspectRatio: `${aspectRatio}` }}
      role="img"
      aria-label={`Fish scan with ${detections.length} detection${detections.length !== 1 ? "s" : ""} annotated`}
    >
      <img
        src={imageDataUrl}
        alt=""
        className="w-full h-full object-contain block"
        onLoad={(e) => {
          const img = e.currentTarget
          setImgSize({ w: img.naturalWidth, h: img.naturalHeight })
        }}
      />
      <canvas
        ref={canvasRef}
        width={imgSize.w || 1}
        height={imgSize.h || 1}
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden="true"
      />
    </div>
  )
}

function DetectionCard({ det }: { det: InferenceResult }) {
  const [expanded, setExpanded] = useState(false)
  const info = getDiseaseInfo(det.class)
  const colors = getSeverityColor(info.severity)

  return (
    <article
      className="bg-card border border-border rounded-md overflow-hidden"
      style={{ borderLeftWidth: 3, borderLeftColor: colors.dot.replace("bg-", "") }}
    >
      <button
        className="w-full flex items-center justify-between p-4 min-h-14 text-left text-foreground transition-colors hover:bg-accent/50"
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
        aria-controls={`det-body-${det.class}`}
      >
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <SeverityIcon severity={info.severity} />
          <div>
            <p className="text-sm font-semibold text-foreground mb-1 truncate">
              {info.name}
            </p>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold font-mono tracking-wider uppercase ${colors.bg} ${colors.color} border ${colors.border}`}
            >
              {info.severity} severity
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 text-muted-foreground">
          <span className="font-mono text-sm font-semibold text-foreground">
            {Math.round(det.confidence * 100)}%
          </span>
          {expanded ? (
            <ChevronUp size={14} aria-hidden="true" />
          ) : (
            <ChevronDown size={14} aria-hidden="true" />
          )}
        </div>
      </button>

      {expanded && (
        <div
          className="px-4 pb-4 border-t border-border/50 flex flex-col gap-4"
          id={`det-body-${det.class}`}
        >
          <p className="text-sm text-muted-foreground leading-relaxed pt-3">
            {info.description}
          </p>

          {info.symptoms.length > 0 && (
            <div className="flex flex-col gap-2">
              <h4 className="font-mono text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Symptoms
              </h4>
              <ul className="list-disc pl-5 flex flex-col gap-1">
                {info.symptoms.map((s, i) => (
                  <li
                    key={i}
                    className="text-sm text-muted-foreground leading-relaxed"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {info.treatment.length > 0 && (
            <div className="flex flex-col gap-2">
              <h4 className="font-mono text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Treatment
              </h4>
              <ol className="list-decimal pl-5 flex flex-col gap-1">
                {info.treatment.map((t, i) => (
                  <li
                    key={i}
                    className="text-sm text-muted-foreground leading-relaxed"
                  >
                    {t}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </article>
  )
}

function ResultsSummary({
  detections,
}: {
  detections: InferenceResult[]
}) {
  const hasDisease = detections.some(
    (d) => getDiseaseInfo(d.class).severity !== "healthy",
  )
  const highCount = detections.filter((d) => {
    const s = getDiseaseInfo(d.class).severity
    return s === "high" || s === "medium"
  }).length

  if (!hasDisease) {
    return (
      <div
        className="flex items-center gap-2 p-3 px-4 bg-green-500/10 border border-green-500/30 rounded-md text-green-500 text-sm font-medium"
        role="status"
      >
        <CheckCircle size={18} aria-hidden="true" />
        <span>No diseases detected &mdash; fish appears healthy</span>
      </div>
    )
  }

  return (
    <div
      className="flex items-start gap-2 p-3 px-4 bg-orange-500/10 border rounded-md text-foreground text-sm font-medium"
      style={{
        borderColor:
          highCount > 0
            ? "var(--color-destructive)"
            : "var(--color-yellow-500, #d29922)",
      }}
      role="status"
    >
      <AlertCircle
        size={18}
        className={`shrink-0 ${highCount > 0 ? "text-red-500" : "text-yellow-500"}`}
        aria-hidden="true"
      />
      <span>
        {detections.length} detection
        {detections.length !== 1 ? "s" : ""} found
        {highCount > 0
          ? ` \u2014 ${highCount} require urgent attention`
          : ""}
      </span>
    </div>
  )
}

export function ResultsView({ result, showTimestamp }: Props) {
  return (
    <div className="flex flex-col flex-1 md:grid md:grid-cols-[1fr_400px] md:grid-rows-[auto_1fr]">
      {showTimestamp && (
        <p className="px-5 py-3 font-mono text-xs text-muted-foreground border-b border-border/50 bg-card uppercase tracking-wider md:col-span-2">
          Scan &mdash; {formatTimestamp(result.timestamp)}
        </p>
      )}

      <AnnotatedImage
        imageDataUrl={result.imageDataUrl}
        detections={result.detections}
      />

      <div className="p-4 pb-8 flex flex-col gap-4 md:col-start-2 md:row-start-2 md:border-l md:border-border md:overflow-y-auto md:max-h-[calc(100dvh-120px)] md:p-6">
        <ResultsSummary detections={result.detections} />

        <h2 className="font-mono text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          Detections
          <span className="bg-muted border border-border text-muted-foreground text-xs px-2 py-0.5 rounded-full">
            {result.detections.length}
          </span>
        </h2>

        <div className="flex flex-col gap-2">
          {result.detections.map((det) => (
            <DetectionCard key={det.class} det={det} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ResultsPage() {
  const { currentResult } = useApp()
  const navigate = useNavigate()

  if (!currentResult) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-4 text-muted-foreground">
        <p>No results available.</p>
        <button
          className="flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground rounded-md text-sm font-medium"
          onClick={() => navigate("/")}
        >
          <Camera size={16} aria-hidden="true" /> Go to Camera
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1">
      <header className="flex items-center justify-between px-5 py-4 border-b border-border bg-card">
        <h1 className="font-mono text-lg font-semibold text-foreground">
          Results
        </h1>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-md border border-border text-muted-foreground text-sm font-medium bg-muted transition-colors hover:bg-accent hover:text-foreground min-h-9"
          onClick={() => navigate("/")}
        >
          <Camera size={16} aria-hidden="true" />
          <span>New scan</span>
        </button>
      </header>
      <ResultsView result={currentResult} />
    </div>
  )
}
