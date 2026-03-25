import { useNavigate } from "react-router-dom"
import { Clock, ChevronRight, Scan } from "lucide-react"
import { useEffect, useState } from "react"
import {
  initHistoryDB,
  getHistoryItems,
  revokeHistoryItemUrls,
  type HistoryItem,
} from "@/lib/history"
import { getDiseaseInfo, getSeverityColor, type Severity } from "@/lib/disease-info"
import type { InferenceResult } from "@/lib/inference"

function getSummary(results: InferenceResult[]) {
  const diseases = results.filter(
    (d) => getDiseaseInfo(d.class).severity !== "healthy",
  )
  if (diseases.length === 0) return "No diseases detected"
  if (diseases.length === 1) return getDiseaseInfo(diseases[0].class).name
  return `${diseases.length} diseases detected`
}

function getWorstSeverity(results: InferenceResult[]): Severity {
  const order: Severity[] = ["high", "medium", "low", "healthy"]
  for (const s of order) {
    if (
      results.some((d) => getDiseaseInfo(d.class).severity === s)
    )
      return s
  }
  return "healthy"
}

function formatDate(ts: number) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(ts))
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true

    const load = async () => {
      try {
        await initHistoryDB()
        const items = await getHistoryItems()
        if (mounted) {
          setHistory(items)
        }
      } catch {
        // Failed to load history
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()

    return () => {
      mounted = false
      // Revoke object URLs on unmount
      history.forEach(revokeHistoryItemUrls)
    }
  }, [])

  return (
    <div className="flex flex-col flex-1">
      <header className="flex items-center justify-between px-5 py-4 border-b border-border bg-card">
        <h1 className="font-mono text-lg font-semibold text-foreground">
          History
        </h1>
        <span className="font-mono text-xs text-muted-foreground bg-muted border border-border px-2 py-1 rounded-full">
          {history.length} scans
        </span>
      </header>

      {loading ? (
        <div className="flex items-center justify-center flex-1 text-muted-foreground">
          Loading...
        </div>
      ) : history.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-3 p-10 text-center">
          <Clock
            size={36}
            className="text-muted-foreground/50"
            aria-hidden="true"
          />
          <p className="text-lg font-semibold text-foreground">No scans yet</p>
          <p className="text-sm text-muted-foreground max-w-70 leading-relaxed">
            Your scan history will appear here after you analyse a fish photo.
          </p>
          <button
            className="flex items-center gap-2 mt-2 px-5 py-3 bg-primary text-primary-foreground rounded-md text-sm font-medium transition-colors hover:opacity-90 min-h-11"
            onClick={() => navigate("/")}
          >
            <Scan size={16} aria-hidden="true" /> Start scanning
          </button>
        </div>
      ) : (
        <ul className="list-none flex flex-col" role="list">
          {history.map((item) => {
            const severity = getWorstSeverity(item.results)
            const colors = getSeverityColor(severity)
            const summary = getSummary(item.results)

            return (
              <li key={item.id}>
                <button
                  className="flex items-center gap-4 px-4 py-3 border-b border-border/50 bg-card text-left w-full transition-colors hover:bg-accent/50 min-h-[72px] md:border md:border-border md:border-b-border md:rounded-lg md:mx-4 md:my-1"
                  onClick={() => navigate(`/history/${item.id}`)}
                  aria-label={`View scan from ${formatDate(item.timestamp)}: ${summary}`}
                >
                  <div className="w-14 h-14 rounded-md overflow-hidden shrink-0 bg-muted border border-border md:w-16 md:h-16">
                    <img
                      src={item.originalImageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${colors.dot}`}
                        aria-hidden="true"
                      />
                      <p className="text-sm font-medium text-foreground truncate">
                        {summary}
                      </p>
                    </div>
                    <time
                      className="font-mono text-xs text-muted-foreground"
                      dateTime={new Date(item.timestamp).toISOString()}
                    >
                      {formatDate(item.timestamp)}
                    </time>
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold font-mono uppercase tracking-wider ${colors.bg} ${colors.color} border ${colors.border} w-fit`}
                    >
                      {severity}
                    </span>
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-muted-foreground shrink-0"
                    aria-hidden="true"
                  />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
