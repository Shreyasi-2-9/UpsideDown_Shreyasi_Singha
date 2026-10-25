import { useState, useEffect, useRef } from "react"
import { useApp, useT } from "../../context/AppContext"
import { Icon } from "../../components/common/Icon"
import { Button } from "../../components/common/Button"
import { Badge } from "../../components/common/Badge"
import { dataStore } from "../../services/dataStore"
import { MicButton } from "../../components/voice/MicButton"
import { SpeakButton } from "../../components/voice/SpeakButton"
import { useSpeak } from "../../hooks/useSpeak"
import { parseSpokenAmount } from "../../utils/parseSpokenAmount"
import type { Offer, IconName } from "../../types"

export function TechnicianRequests({
  setView,
}: {
  setView: (v: string) => void
}) {
  const { requests, activeJob, setActiveRequestId, acceptOffer, voiceHelp } =
    useApp()
  const { t, language, formatCurrency } = useT()
  const { speak } = useSpeak(language)

  const currentReq = activeJob || requests[0]
  const [quotePrice, setQuotePrice] = useState<string>(
    currentReq?.agreedPrice ? currentReq.agreedPrice.toString() : "650",
  )
  const [quoted, setQuoted] = useState(false)
  const [rejected, setRejected] = useState(false)
  const [showWaiting, setShowWaiting] = useState(false)

  // Voice Rate Setting confirmation state
  const [voiceParsedAmount, setVoiceParsedAmount] = useState<number | null>(
    null,
  )
  const [voiceConfirmOpen, setVoiceConfirmOpen] = useState(false)

  const hasAutoSpokenRef = useRef(false)

  const tech =
    dataStore.getTechnicians().find((t) => t.id === "TECH-01") ||
    dataStore.getTechnicians()[0]
  const req = dataStore.getRequest(currentReq?.id) || currentReq
  const isLockedForTech =
    req?.status === "price_locked" && req?.assignedTechId === "TECH-01"

  const status = req?.status || currentReq?.status || "pending"
  const isMasked = status === "pending" || status === "quoted"
  const addressParts = (currentReq?.address || "").split(",")
  const area = addressParts[1]?.trim() || currentReq?.address || ""
  const displayAddress = isMasked ? area : currentReq?.address
  const displayPhone = isMasked ? "+91 XXXXX XXXXX" : currentReq?.citizenPhone

  // Determine low-literacy trade icon
  const getTradeIcon = (codeOrName?: string): IconName => {
    const s = (codeOrName || "").toLowerCase()
    if (s.includes("plumb") || s.includes("srv-01") || s.includes("नल"))
      return "wrench"
    if (
      s.includes("elect") ||
      s.includes("srv-02") ||
      s.includes("बिजली") ||
      s.includes("वीज")
    )
      return "bulb"
    if (s.includes("clean") || s.includes("srv-03") || s.includes("सफाई"))
      return "broom"
    if (
      s.includes("carp") ||
      s.includes("srv-05") ||
      s.includes("बढ़ई") ||
      s.includes("सुतार")
    )
      return "tools"
    return "wrench"
  }

  const tradeIcon = getTradeIcon(
    currentReq?.serviceCode || currentReq?.serviceName,
  )

  // Formatted read-aloud prompt for the technician
  const readAloudText =
    language === "hi"
      ? `ग्राहक ${currentReq?.citizenName || "ग्राहक"} 2.4 किलोमीटर दूर ${area} में हैं। समस्या: ${currentReq?.description || "मरम्मत"}। बेस रेट ₹${currentReq?.agreedPrice || 500}।`
      : language === "mr"
        ? `ग्राहक ${currentReq?.citizenName || "ग्राहक"} 2.4 किलोमीटर अंतरावर ${area} येथे आहेत. अडचण: ${currentReq?.description || "दुरुस्ती"}. मूळ दर ₹${currentReq?.agreedPrice || 500}.`
        : `Customer ${currentReq?.citizenName || "Citizen"} is 2.4 kilometers away in ${area}. Problem: ${currentReq?.description}. Base price offer: ${formatCurrency(currentReq?.agreedPrice || 500)}.`

  // Auto-read on entry if voiceHelp is enabled
  useEffect(() => {
    if (voiceHelp && !hasAutoSpokenRef.current && currentReq) {
      hasAutoSpokenRef.current = true
      speak(readAloudText)
    }
  }, [voiceHelp, currentReq?.id, readAloudText, speak])

  // Handle Spoken Rate input
  const handleSpokenRateTranscript = (transcript: string) => {
    const parsed = parseSpokenAmount(transcript)
    if (parsed) {
      setVoiceParsedAmount(parsed)
      setVoiceConfirmOpen(true)
    }
  }

  const handleConfirmVoiceRate = () => {
    if (voiceParsedAmount) {
      setQuotePrice(voiceParsedAmount.toString())
    }
    setVoiceConfirmOpen(false)
  }

  const handleSendQuote = () => {
    if (currentReq && tech) {
      const parsedPrice =
        parseInt(quotePrice, 10) || currentReq.agreedPrice || 500
      const band = dataStore.getPriceBand(
        currentReq.serviceCode || currentReq.serviceName,
      )
      const verdict = dataStore.getPriceVerdict(parsedPrice, band)
      const offer: Offer = {
        id: `OFFER-${currentReq.id}-${tech.id}`,
        requestId: currentReq.id,
        name: tech.name,
        initials: tech.initials,
        rating: String(tech.rating),
        jobs: tech.jobsCompleted,
        distance: "2.4 km",
        eta: "8 min",
        price: parsedPrice,
        deal: verdict.label,
        pct: verdict.pct,
        tone: verdict.tone,
        phone: tech.phone,
      }
      dataStore.saveTechnicianOffer(offer)
      setQuoted(true)
    }
  }

  const handleClaimJob = () => {
    if (isLockedForTech) {
      setView("job")
    } else {
      setShowWaiting(true)
    }
  }

  const handleInstantAccept = () => {
    if (currentReq && tech) {
      const budget = currentReq.agreedPrice || 500
      const band = dataStore.getPriceBand(
        currentReq.serviceCode || currentReq.serviceName,
      )
      const verdict = dataStore.getPriceVerdict(budget, band)
      acceptOffer(currentReq.id, {
        id: `OFFER-${currentReq.id}-${tech.id}`,
        requestId: currentReq.id,
        name: tech.name,
        initials: tech.initials,
        rating: String(tech.rating),
        jobs: tech.jobsCompleted,
        distance: "2.4 km",
        eta: "8 min",
        price: budget,
        deal: verdict.label,
        pct: verdict.pct,
        tone: verdict.tone,
        phone: tech.phone,
      })
      setView("job")
    }
  }

  return (
    <div className="page narrow-page" style={{ fontSize: "15px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "18px",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <button
          className="back"
          onClick={() => setView("overview")}
          style={{ margin: 0 }}
        >
          ← {t.common.back}
        </button>

        {requests.length > 1 && (
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <span
              style={{
                fontSize: "11px",
                color: "var(--muted)",
                fontWeight: 700,
              }}
            >
              SELECT:
            </span>
            {requests.slice(0, 4).map((r) => (
              <button
                key={r.id}
                className={
                  r.id === currentReq?.id
                    ? "button primary"
                    : "button secondary"
                }
                style={{ height: "32px", padding: "0 10px", fontSize: "11px" }}
                onClick={() => {
                  setActiveRequestId(r.id)
                  setQuoted(false)
                  setRejected(false)
                  setQuotePrice(r.agreedPrice.toString())
                  hasAutoSpokenRef.current = false
                }}
              >
                {r.id}
              </button>
            ))}
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "8px",
        }}
      >
        <p className="eyebrow blue" style={{ margin: 0 }}>
          {t.technician.incomingRequests.toUpperCase()} ·{" "}
          {currentReq?.id || "HC-301"}
        </p>
        <SpeakButton text={readAloudText} lang={language} />
      </div>

      <div
        className="split-heading"
        style={{ alignItems: "center", marginBottom: "20px" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          {/* Large Trade Icon for Low-Literacy recognition */}
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: "#eef2fe",
              color: "var(--blue)",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            <Icon name={tradeIcon} size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: "26px" }}>
              {currentReq?.description || "Home service repair"}
            </h1>
            <p className="subhead" style={{ fontSize: "14px" }}>
              {currentReq?.citizenName || "Rahul Sharma"} ·{" "}
              {currentReq?.createdAt || "just now"}
            </p>
          </div>
        </div>
        <Badge tone={currentReq?.priority === "urgent" ? "red" : "green"}>
          {currentReq?.priority === "urgent"
            ? "HIGH PRIORITY SOS"
            : "OPEN FOR QUOTES"}
        </Badge>
      </div>

      {rejected ? (
        <div
          style={{
            background: "#fff",
            border: "1px solid var(--line)",
            borderRadius: "16px",
            padding: "36px",
            textAlign: "center",
          }}
        >
          <div
            className="modal-icon"
            style={{
              background: "#ffe1e1",
              color: "var(--red)",
              margin: "0 auto 12px",
            }}
          >
            <Icon name="cross" size={24} />
          </div>
          <h2>
            {language === "hi"
              ? "मांग अस्वीकार की गई"
              : language === "mr"
                ? "मागणी नाकारली"
                : "Request Declined"}
          </h2>
          <p
            style={{
              color: "var(--muted)",
              fontSize: "13px",
              marginBottom: "18px",
            }}
          >
            {language === "hi"
              ? `आपने काम ${currentReq?.id} को मना कर दिया है।`
              : language === "mr"
                ? `तुम्ही काम ${currentReq?.id} नाकारले आहे.`
                : `You have declined request ${currentReq?.id}.`}
          </p>
          <Button
            onClick={() => setView("overview")}
            style={{ minHeight: "48px" }}
          >
            {t.common.back}
          </Button>
        </div>
      ) : (
        <div className="details-grid">
          <section className="detail-card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              <h3 style={{ fontSize: "16px" }}>{t.citizen.describeProblem}</h3>
              <SpeakButton
                text={currentReq?.description || ""}
                lang={language}
                iconOnly={true}
              />
            </div>
            <p
              className="quote-text"
              style={{ fontSize: "15px", lineHeight: 1.5 }}
            >
              “{currentReq?.description}”
            </p>

            {currentReq?.beforePhotoUrl && (
              <div
                style={{
                  marginTop: "12px",
                  borderRadius: "12px",
                  overflow: "hidden",
                  border: "1px solid var(--line)",
                }}
              >
                <div
                  style={{
                    padding: "6px 12px",
                    background: "#f8fafc",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "var(--muted)",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Icon name="camera" size={14} /> PHOTO OF ISSUE (ATTACHED BY CITIZEN)
                </div>
                <img
                  src={currentReq.beforePhotoUrl}
                  alt="Issue attached by citizen"
                  style={{
                    width: "100%",
                    maxHeight: "220px",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </div>
            )}

            <div className="request-detail-list" style={{ marginTop: "16px" }}>
              <div>
                <Icon name="user" size={20} />
                <span>
                  {language === "hi"
                    ? "ग्राहक"
                    : language === "mr"
                      ? "ग्राहक"
                      : "Customer"}
                  <b>{currentReq?.citizenName}</b>
                </span>
              </div>
              <div>
                <Icon name="pin" size={20} />
                <span>
                  {language === "hi"
                    ? "दूरी व क्षेत्र"
                    : language === "mr"
                      ? "अंतर व परिसर"
                      : "Distance & Area"}
                  <b>
                    {isMasked
                      ? area
                      : currentReq?.address
                        ? `${currentReq.address.slice(0, 24)}...`
                        : ""}
                  </b>
                </span>
              </div>
              <div>
                <Icon name="clock" size={20} />
                <span>
                  {language === "hi"
                    ? "पहुँचने का समय"
                    : language === "mr"
                      ? "वेळ"
                      : "Target arrival"}
                  <b>{currentReq?.scheduledTime}</b>
                </span>
              </div>
              <div>
                <Icon name="rupee" size={20} />
                <span>
                  {language === "hi"
                    ? "अनुमानित रेट"
                    : language === "mr"
                      ? "अंदाजे दर"
                      : "Base price range"}
                  <b>
                    ₹{currentReq?.agreedPrice - 50}–₹
                    {currentReq?.agreedPrice + 150}
                  </b>
                </span>
              </div>
            </div>

            <div
              style={{
                marginTop: "20px",
                borderTop: "1px solid var(--line)",
                paddingTop: "16px",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  color: "var(--muted)",
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                CITIZEN CONTACT & ADDRESS
              </span>
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "var(--ink)",
                  margin: 0,
                }}
              >
                {displayAddress}
              </p>
              <p
                style={{
                  fontSize: "12px",
                  color: "var(--muted)",
                  marginTop: "4px",
                }}
              >
                Phone: {displayPhone}
                {isMasked ? " (Encrypted until accepted)" : ""}
              </p>
            </div>
          </section>

          <aside className="quote-card">
            <p className="eyebrow">{t.technician.feeLabel}</p>

            {/* Voice Input Rate Area */}
            <div
              style={{
                background: "#f8f9fc",
                border: "1.5px dashed #c8d0f0",
                borderRadius: "12px",
                padding: "12px",
                marginBottom: "16px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <MicButton
                lang={language}
                onTranscript={handleSpokenRateTranscript}
                label={t.technician.speakRate}
                showPrivacyTip={true}
              />
            </div>

            {/* Confirmation Banner for Spoken Amount */}
            {voiceConfirmOpen && voiceParsedAmount !== null && (
              <div
                style={{
                  background: "#f0fdf4",
                  border: "2px solid #86efac",
                  borderRadius: "12px",
                  padding: "14px",
                  marginBottom: "16px",
                  textAlign: "center",
                }}
              >
                <span
                  style={{
                    fontSize: "12px",
                    color: "#166534",
                    fontWeight: 600,
                    display: "block",
                  }}
                >
                  {t.technician.confirmSpokenRate}:
                </span>
                <strong
                  style={{
                    fontSize: "28px",
                    color: "#15803d",
                    display: "block",
                    margin: "4px 0 10px",
                  }}
                >
                  ₹{voiceParsedAmount}
                </strong>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#166534",
                    margin: "0 0 12px",
                  }}
                >
                  {t.common.correctConfirm}
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    justifyContent: "center",
                  }}
                >
                  <button
                    type="button"
                    className="button primary"
                    style={{
                      minHeight: "44px",
                      padding: "0 16px",
                      background: "var(--green)",
                      fontSize: "13px",
                    }}
                    onClick={handleConfirmVoiceRate}
                  >
                    <Icon name="check" size={16} />{" "}
                    {t.technician.confirmRateBtn} (₹{voiceParsedAmount})
                  </button>
                  <button
                    type="button"
                    className="button secondary"
                    style={{
                      minHeight: "44px",
                      padding: "0 12px",
                      fontSize: "12px",
                    }}
                    onClick={() => setVoiceConfirmOpen(false)}
                  >
                    <Icon name="cross" size={14} /> {t.technician.retypeBtn}
                  </button>
                </div>
              </div>
            )}

            <label>
              {t.technician.feeLabel}
              <div
                className="price-input"
                style={{ height: "52px", fontSize: "20px" }}
              >
                <span style={{ fontSize: "20px" }}>₹</span>
                <input
                  type="number"
                  value={quotePrice}
                  onChange={(e) => setQuotePrice(e.target.value)}
                  placeholder="650"
                  style={{ fontSize: "20px", fontWeight: 700 }}
                />
              </div>
            </label>

            <small
              style={{
                fontSize: "11px",
                color: "var(--muted)",
                margin: "8px 0 16px",
                display: "block",
              }}
            >
              {language === "hi"
                ? "सामान की रसीद बाद में ग्राहक की मंजूरी से जोड़ी जा सकती है।"
                : language === "mr"
                  ? "सुट्या भागांचे पैसे नंतर ग्राहकाच्या संमतीने जोडता येतील."
                  : "Parts can be documented and added with citizen approval."}
            </small>

            {quoted ? (
              <div style={{ display: "grid", gap: "10px" }}>
                <Badge tone="green">{t.technician.quoteSentSuccess}</Badge>
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--muted)",
                    lineHeight: "1.4",
                  }}
                >
                  {t.technician.waitingCustomer}
                </p>
                <Button
                  onClick={handleClaimJob}
                  icon="check"
                  style={{ minHeight: "48px", fontSize: "14px" }}
                >
                  {t.technician.acceptClaimJob}
                </Button>
                <Button
                  kind="secondary"
                  onClick={() => setView("job")}
                  style={{ minHeight: "48px" }}
                >
                  {t.nav.activeJob}
                </Button>
              </div>
            ) : (
              <div style={{ display: "grid", gap: "10px" }}>
                <Button
                  onClick={handleSendQuote}
                  icon="check"
                  style={{ minHeight: "52px", fontSize: "15px" }}
                >
                  {t.technician.submitQuote} (₹{quotePrice})
                </Button>
                <Button
                  kind="secondary"
                  icon="rupee"
                  onClick={handleInstantAccept}
                  style={{ minHeight: "48px", fontSize: "13px" }}
                >
                  {t.technician.instantAccept}: ₹
                  {currentReq?.agreedPrice || 500}
                </Button>
                <Button
                  kind="ghost"
                  icon="cross"
                  onClick={() => setRejected(true)}
                  style={{ minHeight: "44px", color: "var(--red)" }}
                >
                  {t.technician.decline}
                </Button>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  )
}
