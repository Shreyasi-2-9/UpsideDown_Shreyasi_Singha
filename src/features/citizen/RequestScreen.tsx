import { useState, useEffect, useRef } from "react"
import { useApp, useT } from "../../context/AppContext"
import { Icon } from "../../components/common/Icon"
import { Button } from "../../components/common/Button"
import { dataStore } from "../../services/dataStore"
import { ProcessingOverlay } from "../../components/common/ProcessingOverlay"
import { ms } from "../../components/common/fxConfig"
import { MicButton } from "../../components/voice/MicButton"
import { SpeakButton } from "../../components/voice/SpeakButton"
import { useSpeak } from "../../hooks/useSpeak"
import { compressImage } from "../../services/imageUtils"
import {
  detectService,
  type DetectedServiceResult,
} from "../../utils/detectService"
import type { CitizenView, ServiceCategory } from "../../types"

export function RequestScreen({ go }: { go: (v: CitizenView) => void }) {
  const { services, createServiceRequest, openCallToBook, voiceHelp } = useApp()
  const { t, language, formatCurrency } = useT()
  const { speak } = useSpeak(language)

  const [selectedServiceCode, setSelectedServiceCode] =
    useState<string>("SRV-01")
  const [description, setDescription] = useState(
    language === "hi"
      ? "किचन के सिंक के नीचे का पाइप फूट गया है। पानी लगातार बह रहा है।"
      : language === "mr"
        ? "स्वयंपाकघरातील सिंकखालील पाईप फुटला आहे. पाणी सतत गळत आहे."
        : "Burst pipe under kitchen sink. Water leaking continuously.",
  )
  const [address, setAddress] = useState(
    "Flat 302, Silver Oak Residency, Andheri West, Mumbai",
  )
  const [urgent, setUrgent] = useState(false)
  const [scheduledTime, setScheduledTime] = useState(
    language === "hi"
      ? "तुरंत रवानगी"
      : language === "mr"
        ? "ताबडतोब"
        : "Immediate dispatch",
  )
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [detectedSuggestion, setDetectedSuggestion] =
    useState<DetectedServiceResult | null>(null)
  const [problemPhoto, setProblemPhoto] = useState<string | null>(null)
  const [photoUploading, setPhotoUploading] = useState(false)
  const photoInputRef = useRef<HTMLInputElement>(null)

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoUploading(true)
    try {
      const compressed = await compressImage(file)
      setProblemPhoto(compressed)
    } catch (err) {
      console.error("Photo upload failed:", err)
    } finally {
      setPhotoUploading(false)
      e.target.value = ""
    }
  }

  const [overlayConfig, setOverlayConfig] = useState<{
    open: boolean
    steps: string[]
    dotCount: number
  }>({
    open: false,
    steps: [
      "Locating your area",
      "Scanning verified technicians within 3 km",
      "Collecting quotes",
    ],
    dotCount: 3,
  })

  const hasAutoSpokenRef = useRef(false)

  const selectedCategory: ServiceCategory =
    services.find((s) => s.code === selectedServiceCode) || services[0]

  // Localized service name & description
  const serviceKey = selectedCategory.code as keyof typeof t.services
  const localizedServiceName =
    t.services[serviceKey]?.name || selectedCategory.name
  const localizedServiceDesc =
    t.services[serviceKey]?.desc || selectedCategory.desc

  // Auto-speak prompt once if Voice Help is active
  useEffect(() => {
    if (voiceHelp && !hasAutoSpokenRef.current) {
      hasAutoSpokenRef.current = true
      const promptText =
        language === "hi"
          ? `${localizedServiceName} सेवा। अपनी समस्या बोलकर या लिखकर बताएं।`
          : language === "mr"
            ? `${localizedServiceName} सेवा. तुमची समस्या बोलून किंवा लिहून सांगा.`
            : `Request ${localizedServiceName} service. Tell verified technicians what needs attention.`
      speak(promptText)
    }
  }, [voiceHelp, language, localizedServiceName, speak])

  // Handle Voice Input Transcript
  const handleVoiceTranscript = (spokenText: string) => {
    if (!spokenText.trim()) return
    setDescription(spokenText)

    // Detect service keyword from spoken text
    const detected = detectService(spokenText)
    if (detected && detected.code !== selectedServiceCode) {
      setDetectedSuggestion(detected)
      // Auto pre-select detected service category
      setSelectedServiceCode(detected.code)
    }
  }

  const handleConfirmDetectedService = () => {
    setDetectedSuggestion(null)
  }

  const handleChangeDetectedService = () => {
    setDetectedSuggestion(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!description.trim()) {
      setError(
        language === "hi"
          ? "कृपया समस्या का विवरण दें या माइक दबाकर बोलें।"
          : language === "mr"
            ? "कृपया समस्येचे वर्णन द्या किंवा माईक दाबून बोला."
            : "Please provide a description of the problem.",
      )
      return
    }
    if (!address.trim()) {
      setError(
        language === "hi"
          ? "कृपया सेवा का पता दर्ज करें।"
          : language === "mr"
            ? "कृपया सेवेचा पत्ता टाका."
            : "Please enter a valid service address.",
      )
      return
    }

    setError(null)
    setIsSubmitting(true)

    const newReq = createServiceRequest({
      serviceCode: selectedCategory.code,
      serviceName: localizedServiceName,
      description: description.trim(),
      address: address.trim(),
      priority: urgent ? "urgent" : "standard",
      scheduledTime,
      citizenName: "Rahul Sharma",
      citizenPhone: "+91 98201 55432",
      bookingSource: "citizen_web",
      agreedPrice: selectedCategory.startingPrice,
      ...(problemPhoto
        ? {
            beforePhotoUrl: problemPhoto,
            beforePhotoName: "citizen_issue.jpg",
          }
        : {}),
    })

    const offerCount = dataStore.getOffers(newReq.id).length
    const baseSteps =
      language === "hi"
        ? [
            "आपका क्षेत्र खोज रहे हैं",
            "3 किमी के भीतर सत्यापित कारीगर स्कैन कर रहे हैं",
            "रेट इकट्ठा कर रहे हैं",
          ]
        : language === "mr"
          ? [
              "तुमचा परिसर शोधत आहे",
              "३ किमी मधील पडताळणी केलेले कारागीर तपासत आहे",
              "दर गोळा करत आहे",
            ]
          : [
              "Locating your area",
              "Scanning verified technicians within 3 km",
              "Collecting quotes",
            ]

    const steps =
      offerCount === 0
        ? [
            ...baseSteps,
            language === "hi"
              ? "कारीगरों की तलाश जारी है..."
              : "Scanning nearby specialists...",
          ]
        : baseSteps

    setOverlayConfig({
      open: true,
      steps,
      dotCount: Math.min(offerCount, 5),
    })
  }

  const handleOverlayDone = () => {
    setOverlayConfig((prev) => ({ ...prev, open: false }))
    setIsSubmitting(false)
    go("offers")
  }

  return (
    <div className="page narrow-page">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <button
          className="back"
          onClick={() => go("overview")}
          style={{ margin: 0 }}
        >
          ← {t.common.back}
        </button>
        <button
          className="text-link"
          onClick={() => openCallToBook(selectedCategory)}
        >
          <Icon name="phone" size={14} /> {t.common.callToBook}
        </button>
      </div>

      <div className="request-layout">
        <section>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "12px",
            }}
          >
            <div>
              <p className="eyebrow blue">
                {localizedServiceName.toUpperCase()} · {selectedCategory.code}
              </p>
              <h1>
                {t.citizen.requestTitle}: {localizedServiceName}
              </h1>
              <p className="subhead">{t.citizen.requestSub}</p>
            </div>
            <SpeakButton
              text={`${t.citizen.requestTitle}: ${localizedServiceName}. ${t.citizen.requestSub}`}
              lang={language}
              label={
                language === "hi" ? "सुनें" : language === "mr" ? "ऐका" : "Listen"
              }
            />
          </div>

          {/* Service Category selector tabs */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              overflowX: "auto",
              padding: "10px 0",
              marginTop: "14px",
            }}
          >
            {services.map((s) => {
              const sKey = s.code as keyof typeof t.services
              const name = t.services[sKey]?.name || s.name
              return (
                <button
                  key={s.code}
                  type="button"
                  className={
                    selectedServiceCode === s.code
                      ? "button primary"
                      : "button secondary"
                  }
                  style={{
                    height: "36px",
                    padding: "0 14px",
                    fontSize: "12px",
                    borderRadius: "99px",
                    whiteSpace: "nowrap",
                  }}
                  onClick={() => {
                    setSelectedServiceCode(s.code)
                    setDetectedSuggestion(null)
                  }}
                >
                  {name}
                </button>
              )
            })}
          </div>

          {/* Service Detection Confirmation Banner */}
          {detectedSuggestion && (
            <div
              className="voice-feedback-card"
              style={{
                margin: "14px 0",
                background: "#f0fdf4",
                borderColor: "#86efac",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "var(--green)",
                    color: "#fff",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <Icon name="check" size={18} />
                </div>
                <div>
                  <strong
                    style={{
                      fontSize: "13px",
                      color: "#166534",
                      display: "block",
                    }}
                  >
                    {t.citizen.voiceDetectTitle}: {localizedServiceName}
                  </strong>
                  <span style={{ fontSize: "11px", color: "#15803d" }}>
                    {t.common.correctConfirm}
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  className="button primary"
                  style={{
                    height: "30px",
                    padding: "0 12px",
                    fontSize: "11px",
                    background: "var(--green)",
                  }}
                  onClick={handleConfirmDetectedService}
                >
                  {t.common.yes}
                </button>
                <button
                  type="button"
                  className="button secondary"
                  style={{
                    height: "30px",
                    padding: "0 10px",
                    fontSize: "11px",
                  }}
                  onClick={handleChangeDetectedService}
                >
                  {t.common.change}
                </button>
              </div>
            </div>
          )}

          <form
            className="form-card"
            onSubmit={handleSubmit}
            style={{ marginTop: "14px" }}
          >
            {error && (
              <div
                style={{
                  padding: "10px 14px",
                  background: "#ffe1e1",
                  color: "var(--red)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Icon name="alert" size={16} />
                {error}
              </div>
            )}

            {/* Problem Description with Mic Button for voice input */}
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <label style={{ margin: 0, fontWeight: 600, fontSize: "13px" }}>
                  {t.citizen.describeProblem}
                </label>
                <span style={{ fontSize: "11px", color: "var(--muted)" }}>
                  {language === "hi"
                    ? "बोलें या लिखें"
                    : language === "mr"
                      ? "बोला किंवा लिहा"
                      : "Speak or type"}
                </span>
              </div>

              {/* Dedicated Spoken Voice Input Area */}
              <div
                style={{
                  background: "#f8f9fc",
                  border: "1.5px dashed #c8d0f0",
                  borderRadius: "14px",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  marginBottom: "14px",
                }}
              >
                <MicButton
                  lang={language}
                  onTranscript={handleVoiceTranscript}
                  label={t.common.tapToSpeak}
                  showPrivacyTip={true}
                />
              </div>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t.citizen.describePlaceholder}
                rows={3}
                required
                style={{ width: "100%", borderRadius: "10px", padding: "12px" }}
              />

              {/* Problem Photo Upload */}
              <div style={{ marginTop: "12px", marginBottom: "8px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "6px",
                  }}
                >
                  <label
                    style={{ margin: 0, fontWeight: 600, fontSize: "13px" }}
                  >
                    {language === "hi"
                      ? "समस्या का फोटो (वैकल्पिक)"
                      : language === "mr"
                        ? "समस्येचा फोटो (ऐच्छिक)"
                        : "Photo of issue (optional)"}
                  </label>
                  <span style={{ fontSize: "11px", color: "var(--muted)" }}>
                    {language === "hi"
                      ? "सटीक उपकरण लाने में मदद"
                      : language === "mr"
                        ? "योग्य साधने आणण्यास मदत"
                        : "Helps tech bring right tools"}
                  </span>
                </div>
                <input
                  type="file"
                  ref={photoInputRef}
                  onChange={handlePhotoChange}
                  accept="image/*"
                  style={{ display: "none" }}
                />
                {problemPhoto ? (
                  <div
                    style={{
                      position: "relative",
                      display: "inline-block",
                      borderRadius: "10px",
                      overflow: "hidden",
                      border: "1px solid var(--line)",
                    }}
                  >
                    <img
                      src={problemPhoto}
                      alt="Problem preview"
                      style={{
                        width: "130px",
                        height: "95px",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setProblemPhoto(null)}
                      style={{
                        position: "absolute",
                        top: "4px",
                        right: "4px",
                        background: "rgba(0,0,0,0.75)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "50%",
                        width: "22px",
                        height: "22px",
                        display: "grid",
                        placeItems: "center",
                        cursor: "pointer",
                      }}
                      title="Remove photo"
                    >
                      <Icon name="close" size={10} />
                    </button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    kind="secondary"
                    icon="camera"
                    onClick={() => photoInputRef.current?.click()}
                    disabled={photoUploading}
                    style={{ minHeight: "40px", fontSize: "12px" }}
                  >
                    {photoUploading
                      ? "Processing photo..."
                      : language === "hi"
                        ? "कैमरा / गैलरी से फोटो जोड़ें"
                        : "Add photo of issue"}
                  </Button>
                )}
              </div>
            </div>

            <label>
              {t.citizen.serviceAddress}
              <div className="input-with-icon">
                <Icon name="pin" />
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={t.citizen.addressPlaceholder}
                  required
                />
              </div>
            </label>

            <label>
              {language === "hi"
                ? "पसंदीदा समय"
                : language === "mr"
                  ? "हवे असलेले वेळ"
                  : "Preferred schedule"}
              <div className="input-with-icon">
                <Icon name="clock" />
                <input
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  placeholder="Immediate dispatch"
                />
              </div>
            </label>

            <div>
              <label className="field-label">
                {language === "hi"
                  ? "रवानगी प्राथमिकता"
                  : language === "mr"
                    ? "प्राधान्य"
                    : "Dispatch priority"}
              </label>
              <div className="choice-row">
                <button
                  type="button"
                  className={!urgent ? "choice selected" : "choice"}
                  onClick={() => setUrgent(false)}
                >
                  <Icon name="clock" />
                  <span>
                    <b>
                      {language === "hi"
                        ? "सामान्य सेवा"
                        : language === "mr"
                          ? "नेहमीची सेवा"
                          : "Standard dispatch"}
                    </b>
                    <small>
                      {language === "hi"
                        ? "15–25 मिनट में आगमन"
                        : language === "mr"
                          ? "15–25 मिनिटांत आगमन"
                          : "Typical arrival in 15–25 min"}
                    </small>
                  </span>
                </button>
                <button
                  type="button"
                  className={
                    urgent
                      ? "choice danger-choice selected"
                      : "choice danger-choice"
                  }
                  onClick={() => setUrgent(true)}
                >
                  <Icon name="alert" />
                  <span>
                    <b>
                      {language === "hi"
                        ? "आपातकालीन SOS"
                        : language === "mr"
                          ? "तातडीची मदत SOS"
                          : "High priority SOS"}
                    </b>
                    <small>
                      {language === "hi"
                        ? "तुरंत रवानगी"
                        : language === "mr"
                          ? "तातडीने पाठवणे"
                          : "For urgent safety risks only"}
                    </small>
                  </span>
                </button>
              </div>
            </div>

            <Button type="submit" icon="arrow" disabled={isSubmitting}>
              {isSubmitting
                ? language === "hi"
                  ? "कारीगरों को भेज रहे हैं..."
                  : language === "mr"
                    ? "कारागिरांना पाठवत आहे..."
                    : "Broadcasting..."
                : `${t.citizen.findQuotes} (${formatCurrency(selectedCategory.startingPrice)}+)`}
            </Button>
          </form>
        </section>

        <aside className="assurance">
          <Icon name="shield" size={28} />
          <h3>
            {language === "hi"
              ? "पूरी तरह सुरक्षित व जाँचा हुआ"
              : language === "mr"
                ? "सुरक्षित आणि खात्रीशीर"
                : "Protected from request to repair"}
          </h3>
          <p>
            {language === "hi"
              ? "आपका पता केवल उसी कारीगर को दिखेगा जिसे आप चुनेंगे।"
              : language === "mr"
                ? "तुमचा पत्ता फक्त तुम्ही निवडलेल्या कारागिरालाच दिसेल."
                : "Your address is only shared with the technician you select."}
          </p>
          {[
            language === "hi"
              ? "सत्यापित कुशल कारीगर नेटवर्क"
              : language === "mr"
                ? "पडताळणी केलेले कारागीर"
                : "Verified professional network",
            language === "hi"
              ? "रवानगी से पहले तय रेट"
              : language === "mr"
                ? "कामाआधी ठरलेला दर"
                : "Price agreed before dispatch",
            language === "hi"
              ? "एस्क्रो सुरक्षित पेमेंट"
              : language === "mr"
                ? "सुरक्षित एस्क्रो पेमेंट"
                : "Escrow-backed payment",
            language === "hi"
              ? "काम के फोटो सबूत"
              : language === "mr"
                ? "कामाचा फोटो पुरावा"
                : "Photographic repair evidence",
          ].map((x) => (
            <div className="assurance-row" key={x}>
              <Icon name="check" size={15} />
              {x}
            </div>
          ))}
        </aside>
      </div>

      <ProcessingOverlay
        open={overlayConfig.open}
        title={t.citizen.findQuotes}
        steps={overlayConfig.steps}
        durationMs={ms(2400)}
        variant="radar"
        dotCount={overlayConfig.dotCount}
        onDone={handleOverlayDone}
      />
    </div>
  )
}
