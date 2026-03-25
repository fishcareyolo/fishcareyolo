import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AppProvider } from "@/components/app-context"
import Layout from "@/components/layout"
import CameraPage from "@/pages/camera"
import PreviewPage from "@/pages/preview"
import AnalysisPage from "@/pages/analysis"
import ResultsPage from "@/pages/results"
import HistoryPage from "@/pages/history"
import HistoryDetailPage from "@/pages/history/[id]"
import SettingsPage from "@/pages/settings"

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<CameraPage />} />
            <Route path="/preview" element={<PreviewPage />} />
            <Route path="/analysis" element={<AnalysisPage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route
              path="/history/:id"
              element={<HistoryDetailPage />}
            />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
