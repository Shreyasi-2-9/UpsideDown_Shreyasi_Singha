import { useApp } from "../../context/AppContext"
import { Icon } from "../common/Icon"
import type { IconName } from "../../types"

interface NavTabItem {
  id: string
  label: string
  icon: IconName
  badge?: number
}

export function BottomNav() {
  const { role, view, setView, requests, sosAlerts, t } = useApp()

  const activeJobsCount = requests.filter(
    (r) => r.status !== "completed" && r.status !== "cancelled",
  ).length
  const activeSosCount = sosAlerts.filter((a) => a.status === "active").length

  const tabs: Record<string, NavTabItem[]> = {
    citizen: [
      { id: "overview", label: t.nav.overview, icon: "home" },
      { id: "request", label: t.nav.findService, icon: "search" },
      {
        id: "job",
        label: t.nav.activeJob,
        icon: "briefcase",
        badge: activeJobsCount,
      },
      { id: "offers", label: t.nav.requests, icon: "document" },
      { id: "review", label: t.nav.profile, icon: "user" },
    ],
    technician: [
      { id: "overview", label: t.nav.overview, icon: "grid" },
      { id: "request", label: t.nav.requests, icon: "document" },
      {
        id: "job",
        label: t.nav.activeJob,
        icon: "briefcase",
        badge: activeJobsCount,
      },
      { id: "earnings", label: t.nav.earnings, icon: "wallet" },
      { id: "profile", label: t.nav.profile, icon: "user" },
    ],
    admin: [
      { id: "operations", label: t.nav.operations, icon: "grid" },
      { id: "jobs", label: t.nav.jobs, icon: "briefcase" },
      { id: "sos", label: t.nav.sos, icon: "alert", badge: activeSosCount },
      { id: "technicians", label: t.nav.technicians, icon: "tools" },
      { id: "citizens", label: t.nav.citizens, icon: "users" },
    ],
  }

  const currentTabs = tabs[role] || tabs.citizen

  // Check if current view is a child view of any tab
  const isTabActive = (tabId: string) => {
    if (view === tabId) return true
    if (
      tabId === "request" &&
      (view === "technician" || view === "negotiate" || view === "locked")
    )
      return true
    if (
      tabId === "job" &&
      (view === "evidence" || view === "complete" || view === "receipt")
    )
      return true
    return false
  }

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
      <div className="mobile-bottom-nav-inner">
        {currentTabs.map((tab) => {
          const active = isTabActive(tab.id)
          return (
            <button
              key={tab.id}
              className={`mobile-tab-btn ${active ? "active" : ""}`}
              onClick={() => setView(tab.id as any)}
              type="button"
              aria-label={tab.label}
              aria-current={active ? "page" : undefined}
            >
              <div className="tab-icon-wrapper">
                <Icon name={tab.icon} size={20} />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={`tab-badge ${
                      tab.id === "sos" ? "badge-red" : "badge-blue"
                    }`}
                  >
                    {tab.badge > 9 ? "9+" : tab.badge}
                  </span>
                )}
              </div>
              <span className="tab-label">{tab.label}</span>
              {active && <span className="tab-active-indicator" />}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
