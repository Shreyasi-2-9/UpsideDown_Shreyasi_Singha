import { useState, useEffect, useRef } from "react"
import { useApp, useT } from "../../context/AppContext"
import { Icon } from "../../components/common/Icon"
import { Button } from "../../components/common/Button"
import { Badge } from "../../components/common/Badge"
import { Rating } from "../../components/common/Rating"
import { Confetti } from "../../components/common/Confetti"
import { ProcessingOverlay } from "../../components/common/ProcessingOverlay"
import { ms } from "../../components/common/fxConfig"
import { SpeakButton } from "../../components/voice/SpeakButton"
import { useSpeak } from "../../hooks/useSpeak"
import type { CitizenView } from "../../types"

export function Locked({ go }: { go: (v: CitizenView) => void }) {
  const { activeJob, dispatchJob, voiceHelp } = useApp()
  const { t, language, formatCurrency } = useT()
  const { speak } = useSpeak(language)
  const [isDispatching, setIsDispatching] = useState(false)
  const hasAutoSpokenRef = useRef(false)

  const firstName = (activeJob?.assignedTechName || "Ravi").split(" ")[0]
  const agreedPrice = activeJob?.agreedPrice || 500
  const techName = activeJob?.assignedTechName || "Ravi Verma"

  const lockedSpeechText =
    language === "hi"
      ? `काम पक्का हो गया। ${techName} के साथ रेट ₹${agreedPrice} तय हुआ है। आपके पैसे सुरक्षित एस्क्रो में हैं।`
      : language === "mr"
        ? `काम पक्के झाले. ${techName} सोबत दर ₹${agreedPrice} निश्चित झाला आहे. तुमचे पैसे सुरक्षित आहेत.`
        : `Service confirmed. Price locked at ${formatCurrency(agreedPrice)} with ${techName}. Your payment is safely held in escrow.`

  useEffect(() => {
    if (voiceHelp && !hasAutoSpokenRef.current) {
      hasAutoSpokenRef.current = true
      speak(lockedSpeechText)
    }
  }, [voiceHelp, lockedSpeechText, speak])

  const handleDispatch = () => {
    setIsDispatching(true)
  }

  const handleDispatchDone = () => {
    if (activeJob) {
      dispatchJob(activeJob.id)
    }
    setIsDispatching(false)
    go("job")
  }

  return (
    <div className="page center-page">
      <Confetti />
      <div className="success-seal fx-pop">
        <Icon name="check" size={30} />
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          marginTop: "4px",
        }}
      >
        <Badge tone="green">{t.citizen.priceLockedBadge}</Badge>
        <SpeakButton text={lockedSpeechText} lang={language} iconOnly={true} />
      </div>

      <h1 style={{ marginTop: "12px" }}>{t.citizen.serviceConfirmed}</h1>
      <p className="subhead">
        {language === "hi"
          ? `${techName} आपकी ${activeJob?.serviceName || "सेवा"} के लिए आने को तैयार हैं।`
          : language === "mr"
            ? `${techName} तुमच्या ${activeJob?.serviceName || "सेवेसाठी"} येण्यास सज्ज आहेत.`
            : `${techName} is ready to be dispatched for your ${activeJob?.serviceName.toLowerCase() || "repair"}.`}
      </p>

      <div className="locked-card">
        <div className="receipt-head">
          <span>{t.brand}</span>
          <b>{activeJob?.id || "HC-301"}</b>
        </div>

        <div className="locked-service">
          <div className="service-icon">
            <Icon name="route" />
          </div>
          <div>
            <span>{(activeJob?.serviceName || "PLUMBING").toUpperCase()}</span>
            <b>{activeJob?.description || "Home service repair"}</b>
          </div>
          <strong>{formatCurrency(agreedPrice)}</strong>
        </div>

        <div className="locked-person">
          <div className="avatar">
            {activeJob?.assignedTechInitials || "RV"}
          </div>
          <div>
            <span>
              {language === "hi"
                ? "नियुक्त कारीगर"
                : language === "mr"
                  ? "नेमलेले कारागीर"
                  : "Assigned Technician"}
            </span>
            <b>
              {techName} ·{" "}
              <Rating value={activeJob?.assignedTechRating || "4.9"} />
            </b>
          </div>
        </div>

        <div className="escrow-banner">
          <Icon name="shield" size={20} />
          <div>
            <b>{t.citizen.escrowTitle}</b>
            <span>
              {language === "hi"
                ? `आपका ₹${agreedPrice} का भुगतान सुरक्षित एस्क्रो में रखा गया है। आपके काम जांचने के बाद ही पैसे जारी होंगे।`
                : language === "mr"
                  ? `तुमचे ₹${agreedPrice} सुरक्षित एस्क्रोमध्ये ठेवले आहेत. काम समाधानकारक झाल्यावरच पैसे मिळतील.`
                  : `Your payment of ${formatCurrency(agreedPrice)} is held safely in escrow until you verify the completed repair.`}
            </span>
          </div>
        </div>
      </div>

      <div className="center-actions">
        <Button
          kind="secondary"
          icon="users"
          onClick={() => go("group")}
          disabled={isDispatching}
          style={{ minHeight: "48px" }}
        >
          {t.citizen.inviteNeighbours}
        </Button>
        <Button
          icon="arrow"
          onClick={handleDispatch}
          disabled={isDispatching}
          style={{ minHeight: "48px" }}
        >
          {t.citizen.dispatchTech}
        </Button>
      </div>

      <p className="hint">
        {language === "hi"
          ? "पड़ोसियों को जोड़कर सामूहिक छूट पाएं।"
          : language === "mr"
            ? "शेजाऱ्यांना जोडून गट सवलत मिळवा."
            : "Invite neighbours first to unlock a lower pooled group price."}
      </p>

      <ProcessingOverlay
        open={isDispatching}
        title={t.citizen.dispatchTech}
        steps={[
          `Notifying ${firstName}`,
          "Sharing your live route",
          "Technician on the way",
        ]}
        durationMs={ms(1500)}
        variant="bar"
        onDone={handleDispatchDone}
      />
    </div>
  )
}
