import { useState, useEffect, useRef } from "react"
import { useApp, useT } from "../../context/AppContext"
import { Icon } from "../../components/common/Icon"
import { Button } from "../../components/common/Button"
import { Badge } from "../../components/common/Badge"
import { MicButton } from "../../components/voice/MicButton"
import { SpeakButton } from "../../components/voice/SpeakButton"
import { useSpeak } from "../../hooks/useSpeak"
import { detectService } from "../../utils/detectService"

export function SeniorCallToBookModal() {
  const {
    isCallToBookOpen,
    closeCallToBook,
    callToBookCategory,
    services,
    createServiceRequest,
    setView,
    setActiveRequestId,
    voiceHelp,
  } = useApp()
  const { t, language, formatCurrency } = useT()
  const { speak } = useSpeak(language)

  const [selectedServiceCode, setSelectedServiceCode] =
    useState<string>("SRV-01")
  const [phone, setPhone] = useState<string>("+91 98201 55432")
  const [address, setAddress] = useState<string>(
    "Flat 302, Silver Oak Residency, Andheri West, Mumbai",
  )
  const [description, setDescription] = useState<string>(
    "Requested voice-assisted booking for home service.",
  )
  const [urgency, setUrgency] = useState<"standard" | "urgent">("standard")
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(
    null,
  )
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const hasAutoSpokenRef = useRef(false)

  useEffect(() => {
    if (callToBookCategory) {
      setSelectedServiceCode(callToBookCategory.code)
      setDescription(`Assisted booking request for ${callToBookCategory.name}.`)
    } else {
      setSelectedServiceCode("SRV-01")
      setDescription("Urgent leak and tap repair assistance.")
    }
    setConfirmedBookingId(null)
    setError(null)
    hasAutoSpokenRef.current = false
  }, [callToBookCategory, isCallToBookOpen])

  // Read aloud prompt when modal opens if voiceHelp is on
  useEffect(() => {
    if (
      isCallToBookOpen &&
      voiceHelp &&
      !hasAutoSpokenRef.current &&
      !confirmedBookingId
    ) {
      hasAutoSpokenRef.current = true
      const promptText =
        language === "hi"
          ? "बुजुर्ग सहायता। फोन से बुक करें। माइक दबाकर अपनी समस्या बोलें या नीचे पुष्टि करें।"
          : language === "mr"
            ? "ज्येष्ठ नागरिक मदत. फोनवरून बुक करा. माईक दाबून बोला किंवा खाली खात्री करा."
            : "Senior Citizen Assisted Booking. Speak your problem or confirm below for immediate coordinator support."
      speak(promptText)
    }
  }, [isCallToBookOpen, voiceHelp, confirmedBookingId, language, speak])

  if (!isCallToBookOpen) return null

  const currentCategory =
    services.find((s) => s.code === selectedServiceCode) || services[0]
  const serviceKey = currentCategory.code as keyof typeof t.services
  const localizedServiceName =
    t.services[serviceKey]?.name || currentCategory.name

  // Handle voice speech input from senior
  const handleVoiceTranscript = (transcript: string) => {
    if (!transcript.trim()) return
    setDescription(transcript)

    const detected = detectService(transcript)
    if (detected) {
      setSelectedServiceCode(detected.code)
    }
  }

  const handleConfirm = () => {
    if (!phone.trim()) {
      setError(
        language === "hi"
          ? "कृपया अपना संपर्क फोन नंबर दें ताकि सहायक फोन कर सके।"
          : language === "mr"
            ? "कृपया फोन नंबर द्या जेणेकरून सहाय्यक फोन करू शकतील."
            : "Please provide a valid contact phone number so our operator can call you.",
      )
      return
    }
    if (!address.trim()) {
      setError(
        language === "hi"
          ? "कृपया सेवा का पता दर्ज करें।"
          : language === "mr"
            ? "कृपया सेवेचा पत्ता टाका."
            : "Please provide the service address.",
      )
      return
    }

    setError(null)
    setIsSubmitting(true)

    setTimeout(() => {
      const newReq = createServiceRequest({
        serviceCode: currentCategory.code,
        serviceName: localizedServiceName,
        description:
          description || `Voice telephone booking for ${localizedServiceName}`,
        address,
        citizenName: "Rahul Sharma",
        citizenPhone: phone,
        priority: urgency,
        bookingSource: "senior_call_to_book",
        scheduledTime:
          urgency === "urgent" ? "Immediate priority" : "Within 30 minutes",
        agreedPrice: currentCategory.startingPrice,
      })

      setIsSubmitting(false)
      setConfirmedBookingId(newReq.id)

      if (voiceHelp) {
        const confirmSpeech =
          language === "hi"
            ? `बुकिंग दर्ज हो गई है। रेफरेंस आईडी ${newReq.id}। सहायक आपके घर कारीगर भेज रहे हैं।`
            : language === "mr"
              ? `बुकिंग नोंदवले गेले. संदर्भ क्रमांक ${newReq.id}. सहाय्यक कारागीर पाठवत आहेत.`
              : `Booking request placed. Reference ID ${newReq.id}. Specialist being dispatched.`
        speak(confirmSpeech)
      }
    }, 450)
  }

  const handleFinishAndTrack = () => {
    if (confirmedBookingId) {
      setActiveRequestId(confirmedBookingId)
      closeCallToBook()
      setView("job")
    }
  }

  return (
    <div
      className="modal-backdrop"
      onClick={closeCallToBook}
      role="dialog"
      aria-modal="true"
      aria-labelledby="call-to-book-title"
    >
      <div
        className="modal"
        style={{ maxWidth: "580px", padding: "30px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="modal-close"
          onClick={closeCallToBook}
          aria-label={t.common.close}
        >
          <Icon name="close" size={20} />
        </button>

        {confirmedBookingId ? (
          /* Confirmation Success Panel */
          <div style={{ textAlign: "center" }}>
            <div
              className="success-seal"
              style={{ width: "68px", height: "68px", margin: "0 auto 16px" }}
            >
              <Icon name="check" size={36} />
            </div>
            <Badge tone="green">{t.senior.operatorAssigned}</Badge>
            <h2
              id="call-to-book-title"
              style={{ fontSize: "26px", margin: "12px 0 6px" }}
            >
              {t.senior.confirmedTitle}
            </h2>
            <p
              style={{
                color: "var(--muted)",
                fontSize: "13px",
                lineHeight: "1.5",
                marginBottom: "22px",
              }}
            >
              {language === "hi"
                ? "रेफरेंस आईडी"
                : language === "mr"
                  ? "संदर्भ आयडी"
                  : "Reference ID"}
              :{" "}
              <strong style={{ color: "var(--ink)" }}>
                {confirmedBookingId}
              </strong>
              . {t.senior.operatorAssigned}
            </p>

            <div
              style={{
                background: "#f8f9fc",
                border: "1px solid var(--line)",
                borderRadius: "14px",
                padding: "18px",
                textAlign: "left",
                display: "grid",
                gap: "10px",
                marginBottom: "22px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "var(--muted)",
                    letterSpacing: ".08em",
                  }}
                >
                  SERVICE
                </span>
                <b style={{ fontSize: "14px" }}>{localizedServiceName}</b>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "var(--muted)",
                    letterSpacing: ".08em",
                  }}
                >
                  CALL-BACK PHONE
                </span>
                <b style={{ fontSize: "13px" }}>{phone}</b>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "var(--muted)",
                    letterSpacing: ".08em",
                  }}
                >
                  ADDRESS
                </span>
                <span
                  style={{
                    fontSize: "12px",
                    textAlign: "right",
                    maxWidth: "65%",
                  }}
                >
                  {address}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "var(--muted)",
                    letterSpacing: ".08em",
                  }}
                >
                  ESTIMATED PRICING
                </span>
                <Badge tone="dark">
                  ESCROW PROTECTED ·{" "}
                  {formatCurrency(currentCategory.startingPrice)}
                </Badge>
              </div>
            </div>

            <div
              style={{ display: "flex", gap: "10px", justifyContent: "center" }}
            >
              <Button
                kind="secondary"
                onClick={closeCallToBook}
                style={{ minHeight: "48px" }}
              >
                {t.common.dismiss}
              </Button>
              <Button
                icon="arrow"
                onClick={handleFinishAndTrack}
                style={{ minHeight: "48px" }}
              >
                {t.nav.activeJob}
              </Button>
            </div>
          </div>
        ) : (
          /* Booking Confirmation & Edit Details Form */
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "14px",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "14px",
                    background: "var(--blue)",
                    color: "#fff",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <Icon name="phone" size={24} />
                </div>
                <div>
                  <p className="eyebrow blue" style={{ margin: 0 }}>
                    {t.senior.modeBadge}
                  </p>
                  <h2
                    id="call-to-book-title"
                    style={{ fontSize: "24px", margin: 0 }}
                  >
                    {t.senior.headerTitle}
                  </h2>
                </div>
              </div>
              <SpeakButton
                text={`${t.senior.headerTitle}. ${t.senior.headerDesc}`}
                lang={language}
              />
            </div>

            <p
              style={{
                color: "var(--muted)",
                fontSize: "13px",
                lineHeight: "1.5",
                marginBottom: "18px",
              }}
            >
              {t.senior.headerDesc}
            </p>

            <div
              style={{
                background: "#f2f4fc",
                border: "1px solid #c8d0f0",
                borderRadius: "12px",
                padding: "12px 14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "18px",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Icon name="shield" size={16} />
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "var(--blue)",
                  }}
                >
                  {t.senior.phoneHotline}
                </span>
              </div>
              <Badge tone="blue">HELPLINE</Badge>
            </div>

            {/* Voice Input Prompt Section for Seniors */}
            <div
              style={{
                background: "#f8f9fc",
                border: "1.5px dashed #c8d0f0",
                borderRadius: "12px",
                padding: "14px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "6px",
                marginBottom: "16px",
              }}
            >
              <MicButton
                lang={language}
                onTranscript={handleVoiceTranscript}
                label={
                  language === "hi"
                    ? "समस्या बोलें (जैसे: नल खराब है)"
                    : language === "mr"
                      ? "समस्या बोला (उदा. नळ गळत आहे)"
                      : "Speak your request"
                }
                showPrivacyTip={true}
              />
            </div>

            {error && (
              <div
                style={{
                  padding: "10px 14px",
                  background: "#ffe1e1",
                  color: "var(--red)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: 600,
                  marginBottom: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Icon name="alert" size={16} />
                {error}
              </div>
            )}

            <div style={{ display: "grid", gap: "16px" }}>
              {/* Select or Confirm Service */}
              <div>
                <label className="field-label" htmlFor="service-select">
                  {t.senior.serviceSelect}
                </label>
                <select
                  id="service-select"
                  value={selectedServiceCode}
                  onChange={(e) => setSelectedServiceCode(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #d3d2ce",
                    background: "#fff",
                    fontWeight: 600,
                    fontSize: "13px",
                    outline: "none",
                  }}
                >
                  {services.map((s) => {
                    const sKey = s.code as keyof typeof t.services
                    const sName = t.services[sKey]?.name || s.name
                    return (
                      <option key={s.code} value={s.code}>
                        {sName} ({s.code}) — {formatCurrency(s.startingPrice)}
                      </option>
                    )
                  })}
                </select>
              </div>

              {/* Contact Phone */}
              <div>
                <label className="field-label" htmlFor="senior-phone">
                  {t.senior.phoneLabel}
                </label>
                <div className="input-with-icon">
                  <Icon name="phone" />
                  <input
                    id="senior-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              {/* Service Address */}
              <div>
                <label className="field-label" htmlFor="senior-address">
                  {t.senior.addressLabel}
                </label>
                <div className="input-with-icon">
                  <Icon name="pin" />
                  <input
                    id="senior-address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter full home address"
                  />
                </div>
              </div>

              {/* Priority Choice */}
              <div>
                <label className="field-label">{t.senior.urgencyLabel}</label>
                <div className="choice-row">
                  <button
                    type="button"
                    className={
                      urgency === "standard" ? "choice selected" : "choice"
                    }
                    onClick={() => setUrgency("standard")}
                  >
                    <Icon name="clock" />
                    <span>
                      <b>{t.senior.standardBooking}</b>
                      <small>{t.senior.standardDesc}</small>
                    </span>
                  </button>
                  <button
                    type="button"
                    className={
                      urgency === "urgent"
                        ? "choice danger-choice selected"
                        : "choice danger-choice"
                    }
                    onClick={() => setUrgency("urgent")}
                  >
                    <Icon name="alert" />
                    <span>
                      <b>{t.senior.urgentEmergency}</b>
                      <small>{t.senior.urgentDesc}</small>
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
                marginTop: "24px",
                borderTop: "1px solid var(--line)",
                paddingTop: "18px",
              }}
            >
              <Button
                kind="secondary"
                onClick={closeCallToBook}
                disabled={isSubmitting}
                style={{ minHeight: "48px" }}
              >
                {t.common.cancel}
              </Button>
              <Button
                icon="phone"
                onClick={handleConfirm}
                disabled={isSubmitting}
                style={{ minHeight: "48px" }}
              >
                {isSubmitting ? "Confirming..." : t.senior.confirmBtn}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
