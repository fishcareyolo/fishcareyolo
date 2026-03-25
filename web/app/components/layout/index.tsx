import { NavLink, Outlet } from "react-router-dom"
import { Camera, Clock, Settings } from "lucide-react"

const NAV_ITEMS = [
  { to: "/", label: "Camera", icon: Camera, end: true },
  { to: "/history", label: "History", icon: Clock },
  { to: "/settings", label: "Settings", icon: Settings },
]

export default function Layout() {
  return (
    <div className="flex min-h-dvh relative">
      {/* Desktop sidebar */}
      <nav
        className="hidden md:flex flex-col w-[220px] bg-card border-r border-border fixed top-0 left-0 h-dvh z-50"
        aria-label="Main navigation"
      >
        <div className="flex items-center gap-3 p-6 border-b border-border">
          <span className="w-8 h-8 bg-primary text-primary-foreground font-mono text-lg font-semibold flex items-center justify-center rounded-md shrink-0">
            M
          </span>
          <span className="font-mono text-lg font-semibold text-foreground tracking-wide">
            Mina
          </span>
        </div>

        <ul className="list-none p-4 flex flex-col gap-1 flex-1" role="list">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-colors min-h-11 ${
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  }`
                }
              >
                <Icon size={18} aria-hidden="true" />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="p-5 border-t border-border">
          <span className="font-mono text-xs text-muted-foreground">
            v1.0.0
          </span>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-dvh md:ml-[220px] pb-[60px] md:pb-0">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav
        className="flex md:hidden fixed bottom-0 left-0 right-0 h-[60px] bg-card border-t border-border z-50"
        aria-label="Main navigation"
      >
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors min-h-11 ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`
            }
          >
            <Icon size={22} aria-hidden="true" />
            <span className="text-[10px] uppercase tracking-wider">
              {label}
            </span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
