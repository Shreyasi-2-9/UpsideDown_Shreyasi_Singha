export type SupportedLanguage = "en" | "hi" | "mr"

export interface TranslationSchema {
  // Brand & Navigation
  brand: string
  roles: {
    citizen: string
    technician: string
    admin: string
    citizenWorkspace: string
    technicianWorkspace: string
    municipalOperations: string
  }
  nav: {
    overview: string
    findService: string
    requests: string
    activeJob: string
    groupDiscounts: string
    payments: string
    profile: string
    earnings: string
    passport: string
    verification: string
    operations: string
    jobs: string
    citizens: string
    technicians: string
    sos: string
    transactions: string
    settings: string
  }
  common: {
    back: string
    cancel: string
    confirm: string
    submit: string
    dismiss: string
    save: string
    edit: string
    close: string
    retry: string
    callToBook: string
    seniorMode: string
    seniorModeOn: string
    search: string
    notifications: string
    tapToSpeak: string
    tapToStop: string
    listening: string
    voiceHelp: string
    voiceHelpActive: string
    voicePrivacy: string
    speechUnsupported: string
    micDenied: string
    noSpeech: string
    networkError: string
    correctConfirm: string
    yes: string
    change: string
    accept: string
    decline: string
    offline: string
    online: string
    sos: string
  }
  services: {
    "SRV-01": { name: string; desc: string; popular: string }
    "SRV-02": { name: string; desc: string; popular: string }
    "SRV-03": { name: string; desc: string; popular: string }
    "SRV-04": { name: string; desc: string; popular: string }
    "SRV-05": { name: string; desc: string; popular: string }
    "SRV-06": { name: string; desc: string; popular: string }
    "SRV-07": { name: string; desc: string; popular: string }
    "SRV-08": { name: string; desc: string; popular: string }
  }
  citizen: {
    morningGreeting: string
    greetingSub: string
    findServiceHeader: string
    verifiedLocalServices: string
    viewAllServices: string
    requestTitle: string
    requestSub: string
    describeProblem: string
    describePlaceholder: string
    serviceAddress: string
    addressPlaceholder: string
    findQuotes: string
    voiceDetectTitle: string
    offersFound: string
    incomingOffers: string
    viewDetails: string
    negotiate: string
    acceptOffer: string
    fairPrice: string
    counterOfferTitle: string
    setFairAmount: string
    originalQuote: string
    quickPresets: string
    speakCounterAmount: string
    confirmCounter: string
    priceLockedBadge: string
    serviceConfirmed: string
    escrowTitle: string
    escrowDesc: string
    dispatchTech: string
    inviteNeighbours: string
    trackingTitle: string
    timelineDispatched: string
    timelineArrived: string
    timelineInProgress: string
    timelineCompleted: string
    techArrivedPrompt: string
    sosTriggered: string
    releasePayment: string
  }
  senior: {
    modeBadge: string
    headerTitle: string
    headerDesc: string
    phoneHotline: string
    serviceSelect: string
    phoneLabel: string
    addressLabel: string
    urgencyLabel: string
    standardBooking: string
    standardDesc: string
    urgentEmergency: string
    urgentDesc: string
    confirmBtn: string
    confirmedTitle: string
    operatorAssigned: string
  }
  technician: {
    greeting: string
    activeJobsSub: string
    todayEarnings: string
    activeJobs: string
    completedJobs: string
    trustScore: string
    incomingRequests: string
    inspectDetails: string
    submitQuote: string
    feeLabel: string
    instantAccept: string
    decline: string
    speakRate: string
    confirmSpokenRate: string
    confirmRateBtn: string
    retypeBtn: string
    quoteSentSuccess: string
    waitingCustomer: string
    acceptClaimJob: string
    passportTitle: string
    earningsTitle: string
  }
}
