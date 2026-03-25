import { useNavigate } from "react-router-dom"
import { RotateCcw, Scan } from "lucide-react"
import { useApp } from "@/components/app-context"
import { useEffect } from "react"

export default function PreviewPage() {
  const { capturedImage, setCapturedImage } = useApp()
  const navigate = useNavigate()

  useEffect(() => {
    if (!capturedImage) navigate("/", { replace: true })
  }, [capturedImage, navigate])

  const handleRetake = () => {
    setCapturedImage(null)
    navigate("/")
  }

  const handleAnalyse = () => {
    navigate("/analysis")
  }

  if (!capturedImage) return null

  return (
    <div className="flex flex-col flex-1 bg-black relative overflow-hidden">
      <div className="flex-1 flex items-center justify-center overflow-hidden min-h-0">
        <img
          src={capturedImage}
          alt="Captured photo ready for analysis"
          className="w-full h-full object-contain block"
        />
      </div>

      <div className="flex gap-3 px-6 pb-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent absolute bottom-0 left-0 right-0 z-20">
        <button
          className="flex items-center justify-center gap-2 px-6 h-[52px] rounded-md border border-white/20 text-white text-[15px] font-medium flex-1 bg-white/10 backdrop-blur-sm transition-colors hover:bg-white/20"
          onClick={handleRetake}
        >
          <RotateCcw size={18} aria-hidden="true" />
          <span>Retake</span>
        </button>
        <button
          className="flex items-center justify-center gap-2 px-6 h-[52px] rounded-md bg-primary text-primary-foreground text-[15px] font-semibold flex-[2] transition-colors hover:opacity-90 active:scale-[0.98] shadow-lg shadow-black/30"
          onClick={handleAnalyse}
        >
          <Scan size={18} aria-hidden="true" />
          <span>Analyse</span>
        </button>
      </div>
    </div>
  )
}
