import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { useEffect, useState } from "react"
import { initHistoryDB, getHistoryItem, type HistoryItem } from "@/lib/history"
import { ResultsView } from "../results"

export default function HistoryDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [result, setResult] = useState<HistoryItem | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const load = async () => {
      try {
        await initHistoryDB()
        if (id) {
          const item = await getHistoryItem(id)
          if (mounted) setResult(item)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center flex-1 text-muted-foreground">
        Loading...
      </div>
    )
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-4 text-muted-foreground">
        <p>Scan not found.</p>
        <button
          className="flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground rounded-md text-sm font-medium"
          onClick={() => navigate("/history")}
        >
          <ArrowLeft size={16} aria-hidden="true" /> Back to History
        </button>
      </div>
    )
  }

  // Convert HistoryItem to ScanResult format for ResultsView
  const scanResult = {
    id: result.id,
    timestamp: result.timestamp,
    imageDataUrl: result.originalImageUrl,
    detections: result.results,
  }

  return (
    <div className="flex flex-col flex-1">
      <header className="flex items-center gap-4 px-5 py-4 border-b border-border bg-card">
        <button
          className="flex items-center gap-2 text-primary text-sm font-medium min-h-9 px-2 py-1 rounded-sm transition-colors hover:bg-accent/50"
          onClick={() => navigate("/history")}
          aria-label="Back to history"
        >
          <ArrowLeft size={18} aria-hidden="true" />
          <span>History</span>
        </button>
        <h1 className="font-mono text-[15px] font-semibold text-foreground">
          Scan Detail
        </h1>
      </header>
      <ResultsView result={scanResult} showTimestamp />
    </div>
  )
}
