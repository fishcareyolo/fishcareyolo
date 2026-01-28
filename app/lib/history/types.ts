import type { InferenceResult } from "@/lib/model/inference"

export interface HistoryItem {
    id: string
    timestamp: number
    originalImageUri: string
    processedImageUri: string
    results: InferenceResult
}
