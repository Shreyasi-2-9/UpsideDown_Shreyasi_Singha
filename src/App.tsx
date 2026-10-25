import { useEffect, Suspense, lazy, type ReactNode } from "react"
import { AppProvider, useApp } from "./context/AppContext"
import { AppShell } from "./components/layout/AppShell"
import { initNativeApp } from "./services/nativeApp"
import { SplashScreen } from "./components/landing/SplashScreen"
import { RoleSelectScreen } from "./components/landing/RoleSelectScreen"
import type { CitizenView } from "./types"

// Code-split role applications and heavier screens
const CitizenDashboard = lazy(() =>
  import("./features/citizen/CitizenDashboard").then((m) => ({
    default: m.CitizenDashboard,
  })),
)
const RequestScreen = lazy(() =>
  import("./features/citizen/RequestScreen").then((m) => ({
    default: m.RequestScreen,
  })),
)
const OffersScreen = lazy(() =>
  import("./features/citizen/OffersScreen").then((m) => ({
    default: m.OffersScreen,
  })),
)
const TechnicianDetails = lazy(() =>
  import("./features/citizen/TechnicianDetails").then((m) => ({
    default: m.TechnicianDetails,
  })),
)
const Negotiation = lazy(() =>
  import("./features/citizen/Negotiation").then((m) => ({
    default: m.Negotiation,
  })),
)
const Locked = lazy(() =>
  import("./features/citizen/Locked").then((m) => ({ default: m.Locked })),
)
const GroupBuying = lazy(() =>
  import("./features/citizen/GroupBuying").then((m) => ({
    default: m.GroupBuying,
  })),
)
const ActiveJob = lazy(() =>
  import("./features/citizen/ActiveJob").then((m) => ({
    default: m.ActiveJob,
  })),
)
const Evidence = lazy(() =>
  import("./features/citizen/Evidence").then((m) => ({ default: m.Evidence })),
)
const Completion = lazy(() =>
  import("./features/citizen/Completion").then((m) => ({
    default: m.Completion,
  })),
)
const Receipt = lazy(() =>
  import("./features/citizen/Receipt").then((m) => ({ default: m.Receipt })),
)
const CitizenProfile = lazy(() =>
  import("./features/citizen/CitizenProfile").then((m) => ({
    default: m.CitizenProfile,
  })),
)
const TechnicianApp = lazy(() =>
  import("./features/technician/TechnicianApp").then((m) => ({
    default: m.TechnicianApp,
  })),
)
const AdminApp = lazy(() =>
  import("./features/admin/AdminApp").then((m) => ({ default: m.AdminApp })),
)

function ScreenLoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] py-16 gap-3 text-neutral-400 select-none">
      <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
      <span className="text-xs font-semibold tracking-wide text-neutral-500">
        Loading HomeCare 360...
      </span>
    </div>
  )
}

function AppContent() {
  const {
    currentScreen,
    finishSplash,
    selectRoleAndEnter,
    role,
    view,
    setView,
    searchModalOpen,
    setSearchModalOpen,
  } = useApp()

  useEffect(() => {
    initNativeApp(() => {
      if (searchModalOpen) {
        setSearchModalOpen(false)
        return true
      }
      if (role === "citizen" && view !== "overview") {
        setView("overview")
        return true
      }
      if (role === "technician" && view !== "overview") {
        setView("overview")
        return true
      }
      if (role === "admin" && view !== "operations") {
        setView("operations")
        return true
      }
      return false
    })
  }, [role, view, searchModalOpen, setView, setSearchModalOpen])

  // Animated opening splash screen (runs once per session, taps to skip)
  if (currentScreen === "splash") {
    return <SplashScreen onFinish={finishSplash} />
  }

  // One-tap role selection screen (Citizen, Technician, Admin)
  if (currentScreen === "role-select") {
    return <RoleSelectScreen onSelectRole={selectRoleAndEnter} />
  }

  const citizenGo = (v: CitizenView) => setView(v)

  let content: ReactNode

  if (role === "citizen") {
    const views: Record<CitizenView, ReactNode> = {
      overview: <CitizenDashboard go={citizenGo} />,
      request: <RequestScreen go={citizenGo} />,
      offers: <OffersScreen go={citizenGo} />,
      technician: <TechnicianDetails go={citizenGo} />,
      negotiate: <Negotiation go={citizenGo} />,
      locked: <Locked go={citizenGo} />,
      group: <GroupBuying go={citizenGo} />,
      job: <ActiveJob go={citizenGo} />,
      evidence: <Evidence go={citizenGo} />,
      complete: <Completion go={citizenGo} />,
      receipt: <Receipt go={citizenGo} />,
      review: <CitizenProfile go={citizenGo} />,
    }
    content = views[(view as CitizenView)] || views.overview
  } else if (role === "technician") {
    content = <TechnicianApp view={view} setView={setView} />
  } else {
    content = <AdminApp view={view} setView={setView} />
  }

  return (
    <AppShell>
      <Suspense fallback={<ScreenLoadingFallback />}>{content}</Suspense>
    </AppShell>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
