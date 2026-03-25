import {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react"
import type { InferenceResult } from "@/lib/inference"

export interface ScanResult {
  id: string
  timestamp: number
  imageDataUrl: string
  detections: InferenceResult[]
}

interface AppState {
  capturedImage: string | null
  setCapturedImage: (img: string | null) => void
  currentResult: ScanResult | null
  setCurrentResult: (r: ScanResult | null) => void
  cameraFacingMode: "environment" | "user"
  setCameraFacingMode: (mode: "environment" | "user") => void
}

const AppContext = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [currentResult, setCurrentResult] = useState<ScanResult | null>(null)
  const [cameraFacingMode, setCameraFacingModeState] = useState<
    "environment" | "user"
  >(() => {
    return (
      (localStorage.getItem("mina_camera_facing") as
        | "environment"
        | "user") || "environment"
    )
  })

  const setCameraFacingMode = useCallback(
    (mode: "environment" | "user") => {
      setCameraFacingModeState(mode)
      localStorage.setItem("mina_camera_facing", mode)
    },
    [],
  )

  return (
    <AppContext.Provider
      value={{
        capturedImage,
        setCapturedImage,
        currentResult,
        setCurrentResult,
        cameraFacingMode,
        setCameraFacingMode,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp must be inside AppProvider")
  return ctx
}
