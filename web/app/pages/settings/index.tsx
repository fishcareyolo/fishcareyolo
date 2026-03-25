import { Monitor, Moon, Sun, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useTheme } from "@/components/theme-provider"
import { initHistoryDB, clearHistory, getHistoryItems } from "@/lib/history"

const THEME_OPTIONS: {
  value: "light" | "dark" | "system"
  label: string
  icon: typeof Sun
}[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
]

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [scanCount, setScanCount] = useState(0)

  useEffect(() => {
    const load = async () => {
      try {
        await initHistoryDB()
        const items = await getHistoryItems()
        setScanCount(items.length)
      } catch {
        // Failed to load
      }
    }
    load()
  }, [])

  const handleClearHistory = async () => {
    if (
      window.confirm(
        `Delete all ${scanCount} scan${scanCount !== 1 ? "s" : ""}? This cannot be undone.`,
      )
    ) {
      try {
        await initHistoryDB()
        await clearHistory()
        setScanCount(0)
      } catch {
        // Failed to clear
      }
    }
  }

  return (
    <div className="flex flex-col flex-1">
      <header className="px-5 py-4 border-b border-border bg-card">
        <h1 className="font-mono text-lg font-semibold text-foreground">
          Settings
        </h1>
      </header>

      <div className="flex flex-col gap-6 p-4 pb-10 max-w-xl w-full md:p-8">
        {/* Appearance */}
        <section className="flex flex-col gap-2" aria-labelledby="theme-heading">
          <h2
            className="font-mono text-xs font-semibold text-muted-foreground uppercase tracking-widest px-1"
            id="theme-heading"
          >
            Appearance
          </h2>
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="flex items-center justify-between gap-4 p-4 px-5 min-h-16">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground mb-0.5">
                  Theme
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Choose your preferred colour scheme
                </p>
              </div>
              <div
                className="flex gap-1 shrink-0"
                role="radiogroup"
                aria-label="Theme selection"
              >
                {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
                  <label
                    key={value}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-sm border text-xs font-medium cursor-pointer transition-colors min-h-9 whitespace-nowrap ${
                      theme === value
                        ? "bg-accent text-accent-foreground border-primary"
                        : "bg-muted text-muted-foreground border-border hover:bg-accent/50 hover:text-foreground"
                    }`}
                  >
                    <input
                      type="radio"
                      name="theme"
                      value={value}
                      checked={theme === value}
                      onChange={() => setTheme(value)}
                      className="sr-only"
                      aria-label={`${label} theme`}
                    />
                    <Icon size={15} aria-hidden="true" />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Data */}
        <section className="flex flex-col gap-2" aria-labelledby="data-heading">
          <h2
            className="font-mono text-xs font-semibold text-muted-foreground uppercase tracking-widest px-1"
            id="data-heading"
          >
            Data
          </h2>
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="flex items-center justify-between gap-4 p-4 px-5 min-h-16">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground mb-0.5">
                  Scan history
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {scanCount} scan{scanCount !== 1 ? "s" : ""} stored locally on
                  this device
                </p>
              </div>
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-md border border-red-500/30 text-red-500 bg-red-500/10 text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-35 disabled:cursor-not-allowed min-h-9 shrink-0"
                onClick={handleClearHistory}
                disabled={scanCount === 0}
                aria-label="Clear all scan history"
              >
                <Trash2 size={14} aria-hidden="true" />
                Clear
              </button>
            </div>
          </div>
        </section>

        {/* About */}
        <section className="flex flex-col gap-2" aria-labelledby="about-heading">
          <h2
            className="font-mono text-xs font-semibold text-muted-foreground uppercase tracking-widest px-1"
            id="about-heading"
          >
            About
          </h2>
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="flex items-center justify-between gap-4 p-4 px-5 min-h-16">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground mb-0.5">
                  Mina
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Fish disease detection &mdash; on-device ML
                </p>
              </div>
              <span className="font-mono text-xs text-muted-foreground shrink-0">
                v1.0.0
              </span>
            </div>
            <div className="h-px bg-border/50" aria-hidden="true" />
            <div className="flex items-center justify-between gap-4 p-4 px-5 min-h-16">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground mb-0.5">
                  Privacy
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  All analysis runs on your device. No photos or data are ever
                  uploaded.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
