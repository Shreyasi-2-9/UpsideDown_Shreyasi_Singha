import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react"
import type {
  Role,
  CitizenView,
  TechnicianView,
  AdminView,
  ServiceCategory,
  ServiceRequest,
  Offer,
  TechnicianRecord,
  CitizenRecord,
  SOSAlert,
  TransactionRecord,
} from "../types"
import { dataStore, INITIAL_SERVICES } from "../services/dataStore"
import { storage } from "../services/storage/localStorageService"

import {
  type SupportedLanguage,
  type TranslationSchema,
  detectDefaultLanguage,
  getTranslations,
  formatCurrency,
  formatDate,
  formatNumber,
} from "../i18n"

export type AppScreen = "splash" | "role-select" | "app"

export interface AppNotification {
  id: string
  title: string
  desc: string
  time: string
  type: "info" | "success" | "alert"
  read: boolean
}

interface AppContextType {
  currentScreen: AppScreen
  setCurrentScreen: (screen: AppScreen) => void
  finishSplash: () => void
  selectRoleAndEnter: (role: Role) => void
  role: Role
  setRole: (role: Role) => void
  view: string
  setView: (view: string) => void
  activeRequestId: string
  setActiveRequestId: (id: string) => void
  activeJob?: ServiceRequest
  seniorMode: boolean
  setSeniorMode: (val: boolean) => void
  isCallToBookOpen: boolean
  openCallToBook: (category?: ServiceCategory) => void
  closeCallToBook: () => void
  callToBookCategory?: ServiceCategory

  // Multilingual & Voice Help
  language: SupportedLanguage
  setLanguage: (lang: SupportedLanguage) => void
  voiceHelp: boolean
  setVoiceHelp: (val: boolean) => void
  t: TranslationSchema

  requests: ServiceRequest[]
  offers: Offer[]
  technicians: TechnicianRecord[]
  citizens: CitizenRecord[]
  sosAlerts: SOSAlert[]
  transactions: TransactionRecord[]
  services: ServiceCategory[]
  notifications: AppNotification[]

  createServiceRequest: (data: {
    serviceCode: string
    serviceName: string
    description: string
    address: string
    priority: "standard" | "urgent"
    citizenName?: string
    citizenPhone?: string
    scheduledTime?: string
    bookingSource?: "citizen_web" | "senior_call_to_book"
    agreedPrice?: number
    beforePhotoUrl?: string
    beforePhotoName?: string
  }) => ServiceRequest
  acceptOffer: (requestId: string, offer: Offer) => void
  dispatchJob: (requestId: string) => void
  advanceJobStep: (requestId: string, nextStep: number) => void
  confirmAndReleaseEscrow: (requestId: string) => void
  reassignJob: (requestId: string) => ServiceRequest | undefined
  submitReview: (
    requestId: string,
    rating: number,
    reviewText: string,
    photoUrl?: string,
  ) => void
  updateTechnicianVerification: (
    techId: string,
    status: "verified" | "rejected" | "pending",
  ) => void
  resolveSOSAlert: (alertId: string) => void
  triggerEmergencySOS: (jobId: string, location: string) => void
  resetDemoData: () => void
  markNotificationsAsRead: () => void
  searchModalOpen: boolean
  setSearchModalOpen: (val: boolean) => void
  negotiatingOffer?: Offer
  setNegotiatingOffer: (offer?: Offer) => void
  refreshAllState: () => void
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(() => {
    try {
      const hasSplashShown =
        sessionStorage.getItem("hc360_splash_shown") === "true"
      const hasRoleSelected =
        sessionStorage.getItem("hc360_role_selected") === "true"
      if (!hasSplashShown) return "splash"
      if (!hasRoleSelected) return "role-select"
      return "app"
    } catch {
      return "splash"
    }
  })

  const [role, setRoleState] = useState<Role>(() => {
    const savedRole = storage.get<Role | null>("user_role", null)
    return savedRole || "citizen"
  })

  const [view, setViewState] = useState<string>(() => {
    const savedRole = storage.get<Role | null>("user_role", null)
    return savedRole === "admin" ? "operations" : "overview"
  })
  const [activeRequestId, setActiveRequestId] = useState<string>("HC-301")
  const [seniorMode, setSeniorMode] = useState<boolean>(false)
  const [isCallToBookOpen, setIsCallToBookOpen] = useState<boolean>(false)
  const [callToBookCategory, setCallToBookCategory] =
    useState<ServiceCategory | undefined>(undefined)
  const [searchModalOpen, setSearchModalOpen] = useState<boolean>(false)
  const [negotiatingOffer, setNegotiatingOffer] = useState<Offer | undefined>(
    undefined,
  )

  // Multilingual & Voice Help state
  const [language, setLanguageState] = useState<SupportedLanguage>(() =>
    detectDefaultLanguage(),
  )
  const [voiceHelp, setVoiceHelpState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("hc360_voice_help")
      if (saved !== null) return saved === "true"
    } catch {}
    return false
  })

  // Sync <html lang> and localStorage
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = language
    }
    try {
      localStorage.setItem("hc360_lang", language)
    } catch {}
  }, [language])

  const setLanguage = (newLang: SupportedLanguage) => {
    setLanguageState(newLang)
    try {
      localStorage.setItem("hc360_lang", newLang)
    } catch {}
  }

  const setVoiceHelp = (val: boolean) => {
    setVoiceHelpState(val)
    try {
      localStorage.setItem("hc360_voice_help", String(val))
    } catch {}
  }

  const [requests, setRequests] = useState<ServiceRequest[]>(() =>
    dataStore.getRequests(),
  )
  const [offers, setOffers] = useState<Offer[]>(() => dataStore.getOffers())
  const [technicians, setTechnicians] = useState<TechnicianRecord[]>(() =>
    dataStore.getTechnicians(),
  )
  const [citizens, setCitizens] = useState<CitizenRecord[]>(() =>
    dataStore.getCitizens(),
  )
  const [sosAlerts, setSosAlerts] = useState<SOSAlert[]>(() =>
    dataStore.getSOSAlerts(),
  )
  const [transactions, setTransactions] = useState<TransactionRecord[]>(() =>
    dataStore.getTransactions(),
  )
  const [services] = useState<ServiceCategory[]>(INITIAL_SERVICES)

  const finishSplash = () => {
    try {
      sessionStorage.setItem("hc360_splash_shown", "true")
      const hasRoleSelected =
        sessionStorage.getItem("hc360_role_selected") === "true"
      setCurrentScreen(hasRoleSelected ? "app" : "role-select")
    } catch {
      setCurrentScreen("role-select")
    }
  }

  const selectRoleAndEnter = (newRole: Role) => {
    setRole(newRole)
    try {
      sessionStorage.setItem("hc360_role_selected", "true")
    } catch {}
    setCurrentScreen("app")
  }

  const setRole = (newRole: Role) => {
    storage.set("user_role", newRole)
    setRoleState(newRole)
    if (newRole === "admin") {
      setViewState("operations")
    } else {
      setViewState("overview")
    }
  }

  const setView = (v: string) => {
    setViewState(v)
  }

  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: "N1",
      title: "Technician Ravi Verma En Route",
      desc: "Estimated arrival in 8 minutes for Kitchen Pipe Repair (HC-301).",
      time: "2 min ago",
      type: "info",
      read: false,
    },
    {
      id: "N2",
      title: "Group Discount Opportunity",
      desc: "2 neighbours in Silver Oak joined plumbing group service.",
      time: "15 min ago",
      type: "success",
      read: false,
    },
    {
      id: "N3",
      title: "System Operational",
      desc: "Escrow smart contract verified. All payments protected.",
      time: "1 hour ago",
      type: "info",
      read: true,
    },
  ])

  // Sync active request with loaded requests
  const activeJob =
    requests.find((r) => r.id === activeRequestId) || requests[0]

  const refreshAllState = () => {
    setRequests(dataStore.getRequests())
    setOffers(dataStore.getOffers())
    setTechnicians(dataStore.getTechnicians())
    setCitizens(dataStore.getCitizens())
    setSosAlerts(dataStore.getSOSAlerts())
    setTransactions(dataStore.getTransactions())
  }

  const openCallToBook = (category?: ServiceCategory) => {
    setCallToBookCategory(category)
    setIsCallToBookOpen(true)
  }

  const closeCallToBook = () => {
    setIsCallToBookOpen(false)
    setCallToBookCategory(undefined)
  }

  const createServiceRequest = (data: {
    serviceCode: string
    serviceName: string
    description: string
    address: string
    priority: "standard" | "urgent"
    citizenName?: string
    citizenPhone?: string
    scheduledTime?: string
    bookingSource?: "citizen_web" | "senior_call_to_book"
    agreedPrice?: number
    beforePhotoUrl?: string
    beforePhotoName?: string
  }) => {
    const newReq = dataStore.createRequest(data)
    refreshAllState()
    setActiveRequestId(newReq.id)

    setNotifications((prev) => [
      {
        id: `N-${Date.now()}`,
        title: `Service Request ${newReq.id} Created`,
        desc: `${newReq.serviceName} request broadcasted to nearby verified specialists.`,
        time: "Just now",
        type: "success",
        read: false,
      },
      ...prev,
    ])

    return newReq
  }

  const acceptOffer = (requestId: string, offer: Offer) => {
    dataStore.acceptOffer(requestId, offer)
    refreshAllState()
    setActiveRequestId(requestId)

    setNotifications((prev) => [
      {
        id: `N-${Date.now()}`,
        title: `Offer Accepted for ${requestId}`,
        desc: `Agreed ₹${offer.price} with ${offer.name}. Escrow locked securely.`,
        time: "Just now",
        type: "success",
        read: false,
      },
      ...prev,
    ])
  }

  const dispatchJob = (requestId: string) => {
    dataStore.dispatchJob(requestId)
    refreshAllState()
  }

  const reassignJob = (requestId: string): ServiceRequest | undefined => {
    const updated = dataStore.reassignJob(requestId)
    if (!updated) return undefined

    refreshAllState()

    setNotifications((prev) => [
      {
        id: `N-${Date.now()}`,
        title: `Technician Reassigned for ${requestId}`,
        desc: `${updated.assignedTechName} has been assigned and is en route.`,
        time: "Just now",
        type: "info",
        read: false,
      },
      ...prev,
    ])

    return updated
  }

  const advanceJobStep = (requestId: string, nextStep: number) => {
    dataStore.advanceJobStep(requestId, nextStep)
    refreshAllState()

    const stepNames = ["", "En Route", "Arrived", "In Progress", "Completed"]
    setNotifications((prev) => [
      {
        id: `N-${Date.now()}`,
        title: `Job ${requestId} Update: ${stepNames[nextStep] || "Updated"}`,
        desc: `Technician updated progress to ${stepNames[nextStep]}.`,
        time: "Just now",
        type: "info",
        read: false,
      },
      ...prev,
    ])
  }

  const confirmAndReleaseEscrow = (requestId: string) => {
    dataStore.confirmAndReleaseEscrow(requestId)
    refreshAllState()

    setNotifications((prev) => [
      {
        id: `N-${Date.now()}`,
        title: `Escrow Released for ${requestId}`,
        desc: `Repair confirmed. Digital receipt generated and payout processed.`,
        time: "Just now",
        type: "success",
        read: false,
      },
      ...prev,
    ])
  }

  const submitReview = (
    requestId: string,
    rating: number,
    reviewText: string,
    photoUrl?: string,
  ) => {
    dataStore.submitReview(requestId, rating, reviewText, photoUrl)
    refreshAllState()
  }

  const updateTechnicianVerification = (
    techId: string,
    status: "verified" | "rejected" | "pending",
  ) => {
    dataStore.updateTechnicianVerification(techId, status)
    refreshAllState()

    setNotifications((prev) => [
      {
        id: `N-${Date.now()}`,
        title: `Technician Verification ${status.toUpperCase()}`,
        desc: `Municipal admin updated credential status for technician.`,
        time: "Just now",
        type: status === "verified" ? "success" : "alert",
        read: false,
      },
      ...prev,
    ])
  }

  const resolveSOSAlert = (alertId: string) => {
    dataStore.resolveSOSAlert(alertId)
    refreshAllState()

    setNotifications((prev) => [
      {
        id: `N-${Date.now()}`,
        title: `SOS Alert ${alertId} Resolved`,
        desc: `Emergency case marked resolved by municipal supervisor.`,
        time: "Just now",
        type: "success",
        read: false,
      },
      ...prev,
    ])
  }

  const triggerEmergencySOS = (jobId: string, location: string) => {
    const alert = dataStore.createSOSAlert(
      jobId,
      activeJob?.citizenName || "Rahul Sharma",
      activeJob?.assignedTechName || "Ravi Verma",
      location,
    )
    refreshAllState()

    setNotifications((prev) => [
      {
        id: `N-${Date.now()}`,
        title: `EMERGENCY SOS ALERT TRIGGERED`,
        desc: `Active safety case ${alert.id} opened for ${jobId}. Emergency desk notified.`,
        time: "Just now",
        type: "alert",
        read: false,
      },
      ...prev,
    ])
  }

  const resetDemoData = () => {
    dataStore.resetAllDemoData()
    refreshAllState()
    setActiveRequestId("HC-301")
    setViewState(role === "admin" ? "operations" : "overview")
    setNotifications([
      {
        id: `N-${Date.now()}`,
        title: "Demo Data Reset",
        desc: "Application restored to pristine demo records.",
        time: "Just now",
        type: "info",
        read: false,
      },
    ])
  }

  const markNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  return (
    <AppContext.Provider
      value={{
        currentScreen,
        setCurrentScreen,
        finishSplash,
        selectRoleAndEnter,
        role,
        setRole,
        view,
        setView,
        activeRequestId,
        setActiveRequestId,
        activeJob,
        seniorMode,
        setSeniorMode,
        isCallToBookOpen,
        openCallToBook,
        closeCallToBook,
        callToBookCategory,

        // Multilingual & Voice Help
        language,
        setLanguage,
        voiceHelp,
        setVoiceHelp,
        t: getTranslations(language),

        requests,
        offers,
        technicians,
        citizens,
        sosAlerts,
        transactions,
        services,
        notifications,
        createServiceRequest,
        acceptOffer,
        dispatchJob,
        reassignJob,
        advanceJobStep,
        confirmAndReleaseEscrow,
        submitReview,
        updateTechnicianVerification,
        resolveSOSAlert,
        triggerEmergencySOS,
        resetDemoData,
        markNotificationsAsRead,
        searchModalOpen,
        setSearchModalOpen,
        negotiatingOffer,
        setNegotiatingOffer,
        refreshAllState,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}

export function useT() {
  const { language, setLanguage, t } = useApp()
  return {
    t,
    language,
    setLanguage,
    formatCurrency: (amount: number) => formatCurrency(amount, language),
    formatDate: (
      date: Date | string | number,
      options?: Intl.DateTimeFormatOptions,
    ) => formatDate(date, language, options),
    formatNumber: (num: number) => formatNumber(num, language),
  }
}
