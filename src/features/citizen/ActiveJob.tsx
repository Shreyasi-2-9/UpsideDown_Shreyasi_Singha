import { useState, useEffect, useRef } from "react"
import { useApp, useT } from "../../context/AppContext"
import { Icon } from "../../components/common/Icon"
import { Button } from "../../components/common/Button"
import { Badge } from "../../components/common/Badge"
import { Rating } from "../../components/common/Rating"
import { MiniMap } from "../../components/common/MiniMap"
import { ProcessingOverlay } from "../../components/common/ProcessingOverlay"
import { ms } from "../../components/common/fxConfig"
import { SpeakButton } from "../../components/voice/SpeakButton"
import { useSpeak } from "../../hooks/useSpeak"
import type { CitizenView } from "../../types"

function Timeline({ step = 1, t }: { step?: number; t: any }) {
  const items = [
    t.citizen.timelineDispatched,
    t.citizen.timelineArrived,
    t.citizen.timelineInProgress,
    t.citizen.timelineCompleted,
  ]
  return (
    <div className="timeline">
      {items.map((x, i) => {
        const itemStep = i + 1
        const isCurrent = itemStep === step
        const isDone = itemStep < step
        return (
          <div
            className={
              isCurrent
                ? "timeline-item current"
                : isDone
                  ? "timeline-item done"
                  : "timeline-item"
            }
            key={x}
          >
            <div className="timeline-number">
              {isDone ? <Icon name="check" size={14} /> : `0${itemStep}`}
            </div>
            <div>
              <span>{x}</span>
              {isCurrent && <small>Current status · updated just now</small>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function ActiveJob({ go }: { go: (v: CitizenView) => void }) {
  const {
    activeJob,
    triggerEmergencySOS,
    advanceJobStep,
    reassignJob,
    voiceHelp,
  } = useApp()
  const { t, language, formatCurrency } = useT()
  const { speak } = useSpeak(language)

  const [modal, setModal] = useState(false)
  const [reassignError, setReassignError] = useState("")
  const [phoneDialog, setPhoneDialog] = useState(false)
  const [sosSent, setSosSent] = useState(false)
  const [isReassigning, setIsReassigning] = useState(false)
  const [liveTelemetry, setLiveTelemetry] = useState<{
    distance: string
    eta: string
    progress: number
    statusText: string
    currentStreet: string
  }>({
    distance: "2.4 km",
    eta: "08:00",
    progress: 0,
    statusText: "On the way",
    currentStreet: "Service Dispatch Hub · Link Road",
  })

  const step = activeJob?.timelineStep || 1
  const techName = activeJob?.assignedTechName || "Ravi Verma"
  const techPhone = activeJob?.assignedTechPhone || "+91 98111 22334"
  const isArrived = liveTelemetry.progress >= 100 || step >= 2

  const prevStepRef = useRef(step)
  const prevArrivedRef = useRef(isArrived)

  // Announce job phase changes
  useEffect(() => {
    if (!voiceHelp) return

    if (!prevArrivedRef.current && isArrived) {
      speak(t.citizen.techArrivedPrompt)
    } else if (prevStepRef.current !== step) {
      if (step === 2) {
        speak(t.citizen.techArrivedPrompt)
      } else if (step === 3) {
        speak(
          language === "hi"
            ? "कारीगर ने काम शुरू कर दिया है।"
            : language === "mr"
              ? "कारागिराने काम सुरू केले आहे."
              : "Technician is now performing the repair.",
        )
      } else if (step === 4) {
        speak(
          language === "hi"
            ? "काम पूरा हो गया है। कृपया जांचें और पैसे जारी करें।"
            : language === "mr"
              ? "काम पूर्ण झाले आहे. कृपया तपासा आणि पैसे द्या."
              : "Repair completed and verified. Ready for payment release.",
        )
      }
    }

    prevStepRef.current = step
    prevArrivedRef.current = isArrived
  }, [step, isArrived, voiceHelp, language, t, speak])

  const handleSOS = () => {
    if (activeJob) {
      triggerEmergencySOS(activeJob.id, activeJob.address)
      setSosSent(true)
      // Voice confirmation of SOS alert
      speak(t.citizen.sosTriggered)

      setTimeout(() => {
        setModal(false)
        setSosSent(false)
      }, 1500)
    }
  }

  const handleReassign = () => {
    setIsReassigning(true)
  }

  const handleReassignDone = () => {
    setIsReassigning(false)
    const jobId = activeJob?.id || "HC-301"
    const updated = reassignJob(jobId)
    if (updated) {
      setReassignError("")
      setModal(false)
      setLiveTelemetry({
        distance: "2.4 km",
        eta: "08:00",
        progress: 0,
        statusText: "On the way",
        currentStreet: "Service Dispatch Hub · Link Road",
      })
    } else {
      setReassignError("No backup technician available")
    }
  }

  const headerSpeech = `${activeJob?.description || "Service job"}. ${
    isArrived
      ? t.citizen.timelineArrived
      : `${t.citizen.timelineDispatched}, ETA ${liveTelemetry.eta}`
  }. Technician: ${techName}. Price: ₹${activeJob?.agreedPrice || 500}.`

  return (
    <div className="page">
      <div className="case-header">
        <div>
          <div
            className="case-id"
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <span>{activeJob?.id || "HC-301"}</span>
            <Badge tone={step === 4 ? "green" : isArrived ? "green" : "amber"}>
              {isArrived
                ? language === "hi"
                  ? "कारीगर पहुँच चुके हैं"
                  : language === "mr"
                    ? "कारागीर पोहोचले आहेत"
                    : "ARRIVED"
                : language === "hi"
                  ? "रास्ते में हैं"
                  : language === "mr"
                    ? "मार्गावर आहेत"
                    : "ON THE WAY"}
            </Badge>
            <Badge tone="dark">
              {activeJob?.escrowStatus === "released"
                ? "ESCROW RELEASED"
                : "ESCROW LOCKED"}
            </Badge>
            <SpeakButton text={headerSpeech} lang={language} iconOnly={true} />
          </div>
          <h1>{activeJob?.description || "Kitchen Pipe Repair"}</h1>
          <p>
            {activeJob?.address ||
              "Silver Oak Residency · Andheri West, Mumbai"}
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <Button
            kind="ghost"
            onClick={() => {
              setReassignError("")
              setModal(true)
            }}
          >
            {language === "hi"
              ? "देरी की सूचना / SOS"
              : language === "mr"
                ? "उशीर तक्रार / SOS"
                : "Report delay / SOS"}
          </Button>
          <Button
            kind="secondary"
            icon="phone"
            onClick={() => setPhoneDialog(true)}
          >
            {language === "hi"
              ? `फोन करें (${techName.split(" ")[0]})`
              : language === "mr"
                ? `फोन करा (${techName.split(" ")[0]})`
                : `Call ${techName.split(" ")[0]}`}
          </Button>
        </div>
      </div>

      <div className="command-grid">
        <section className="map-panel">
          <div className="panel-label">
            <span>
              <i /> LIVE GPS
            </span>
            <b>
              {techName}{" "}
              {isArrived
                ? language === "hi"
                  ? "पहुँच चुके हैं"
                  : language === "mr"
                    ? "पोहोचले आहेत"
                    : "arrived at location"
                : `en route (${liveTelemetry.distance} · ETA ${liveTelemetry.eta})`}
            </b>
          </div>

          <MiniMap
            large
            techName={techName.split(" ")[0].toUpperCase()}
            status={activeJob?.status || "on_the_way"}
            isLiveTracking={step === 1}
            jobId={activeJob?.id || "HC-301"}
            onArrived={() => {
              if (activeJob && activeJob.timelineStep === 1) {
                advanceJobStep(activeJob.id, 2)
              }
            }}
            onProgressUpdate={(info) => setLiveTelemetry(info)}
          />

          <div className="map-footer">
            <span>
              <Icon name="shield" size={13} /> Location shared securely via
              municipal beacon
            </span>
            <span>Live telemetry synced</span>
          </div>
        </section>

        <aside className="command-side">
          <div className="tech-summary">
            <div className="avatar large-avatar">
              {activeJob?.assignedTechInitials || "RV"}
            </div>
            <div>
              <p>
                {language === "hi"
                  ? "आपके कारीगर"
                  : language === "mr"
                    ? "तुमचे कारागीर"
                    : "YOUR TECHNICIAN"}
              </p>
              <h2>
                {techName}{" "}
                <span className="verified-check">
                  <Icon name="check" size={11} />
                </span>
              </h2>
              <span>
                <Rating value={activeJob?.assignedTechRating || "4.9"} /> ·{" "}
                {activeJob?.assignedTechJobs || 247} jobs
              </span>
            </div>
            <div className="reliability">
              <span>RELIABILITY</span>
              <b>
                94<small>/100</small>
              </b>
            </div>
          </div>

          <Timeline step={isArrived ? Math.max(2, step) : step} t={t} />

          {/* Live Route Progress Card */}
          <div
            style={{
              background: "#f8fafc",
              border: "1px solid var(--line)",
              borderRadius: "12px",
              padding: "12px 14px",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "6px",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "var(--muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                JOURNEY PROGRESS
              </span>
              <b
                style={{
                  fontSize: "11px",
                  color: isArrived ? "var(--green)" : "var(--blue)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {liveTelemetry.progress}% completed
              </b>
            </div>

            <div
              style={{
                width: "100%",
                height: "6px",
                background: "#e2e8f0",
                borderRadius: "3px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${liveTelemetry.progress}%`,
                  height: "100%",
                  background: isArrived
                    ? "var(--green)"
                    : "linear-gradient(90deg, #315cf5, #60a5fa)",
                  transition: "width 0.2s linear",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "11px",
                color: "var(--muted)",
                marginTop: "6px",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              <span>
                <b>Sector:</b>{" "}
                {liveTelemetry.currentStreet.split("·")[0].trim()}
              </span>
              <span>
                <b>Remaining:</b>{" "}
                {isArrived ? "0.0 km" : liveTelemetry.distance}
              </span>
            </div>
          </div>

          <div className="next-step">
            <Icon name="camera" size={18} />
            <div>
              <b>
                {step >= 3
                  ? "Photographic proof captured"
                  : "Evidence required on arrival"}
              </b>
              <span>
                {step >= 4
                  ? "All repair photos verified and ready for review."
                  : step >= 2 || isArrived
                    ? "Technician has logged baseline proof in evidence vault."
                    : `${techName.split(" ")[0]} will upload a before-work photo.`}
              </span>
            </div>
            <Button kind="ghost" onClick={() => go("evidence")}>
              View
            </Button>
          </div>
        </aside>
      </div>

      <div
        className="control-strip"
        style={{ gridTemplateColumns: "repeat(5, 1fr) auto" }}
      >
        <div>
          <Icon name="clock" />
          <span>ESTIMATED ARRIVAL</span>
          <b>{isArrived ? "Arrived" : liveTelemetry.eta}</b>
        </div>
        <div>
          <Icon name="route" />
          <span>DISTANCE REMAINING</span>
          <b>{isArrived ? "0.0 km" : liveTelemetry.distance}</b>
        </div>
        <div>
          <Icon name="trend" />
          <span>ROUTE PROGRESS</span>
          <b>{liveTelemetry.progress}%</b>
        </div>
        <div>
          <Icon name="wallet" />
          <span>LOCKED PRICE</span>
          <b>{formatCurrency(activeJob?.agreedPrice || 500)}</b>
        </div>
        <div>
          <Icon name="shield" />
          <span>PAYMENT</span>
          <Badge tone="green">
            {activeJob?.escrowStatus === "released"
              ? "PAID"
              : "ESCROW PROTECTED"}
          </Badge>
        </div>
        {activeJob?.escrowStatus === "released" ? (
          <Button onClick={() => go("review")}>
            <Icon name="star" size={14} /> Rate & Review
          </Button>
        ) : step >= 4 ? (
          <Button onClick={() => go("complete")}>
            <Icon name="check" size={14} /> Review & Release
          </Button>
        ) : (
          <Button onClick={() => go("evidence")}>
            {language === "hi"
              ? "फोटो सबूत देखें"
              : language === "mr"
                ? "फोटो पुरावे पहा"
                : "Open evidence vault"}
          </Button>
        )}
      </div>

      {/* Delay & Emergency Modal */}
      {modal && (
        <div
          className="modal-backdrop"
          onClick={() => {
            setModal(false)
            setReassignError("")
          }}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => {
                setModal(false)
                setReassignError("")
              }}
            >
              <Icon name="close" />
            </button>

            <div className="modal-icon warning">
              <Icon name="clock" />
            </div>

            <h2>Worker delayed or issue on site?</h2>
            <p>
              {techName} is assigned to {activeJob?.id || "HC-301"}. Choose a
              resolution option below:
            </p>

            <div
              className="modal-action"
              onClick={() => setPhoneDialog(true)}
              style={{ cursor: "pointer" }}
            >
              <Icon name="phone" />
              <div>
                <b>Direct voice call to technician</b>
                <span>
                  Reach {techName} at {techPhone}
                </span>
              </div>
              <Button kind="secondary">Call</Button>
            </div>

            <div className="modal-action">
              <Icon name="users" />
              <div>
                <b>Request automatic backup reassign</b>
                <span>Dispatch the nearest standby certified specialist.</span>
                {reassignError && (
                  <span style={{ color: "var(--red)", fontWeight: 600 }}>
                    {reassignError}
                  </span>
                )}
              </div>
              <Button onClick={handleReassign} disabled={isReassigning}>
                Reassign
              </Button>
            </div>

            <div className="modal-action danger-action">
              <Icon name="alert" />
              <div>
                <b>Emergency SOS Alert</b>
                <span>
                  Alert municipal supervisor and send live coordinates
                  immediately.
                </span>
              </div>
              <Button kind="danger" onClick={handleSOS}>
                {sosSent ? "SOS Dispatched!" : "Activate SOS"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Direct Phone Helper Dialog */}
      {phoneDialog && (
        <div className="modal-backdrop" onClick={() => setPhoneDialog(false)}>
          <div
            className="modal"
            style={{ maxWidth: "440px", textAlign: "center" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setPhoneDialog(false)}
            >
              <Icon name="close" />
            </button>
            <div
              className="modal-icon"
              style={{
                background: "#eef1fd",
                color: "var(--blue)",
                margin: "0 auto 14px",
              }}
            >
              <Icon name="phone" size={24} />
            </div>
            <h2>Call {techName}</h2>
            <p style={{ color: "var(--muted)", fontSize: "12px" }}>
              Direct verified contact for active job {activeJob?.id || "HC-301"}
              .
            </p>
            <div
              style={{
                padding: "16px",
                background: "#f5f5f2",
                borderRadius: "12px",
                margin: "16px 0",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  color: "var(--muted)",
                  display: "block",
                }}
              >
                PHONE NUMBER
              </span>
              <strong style={{ fontSize: "20px", letterSpacing: ".05em" }}>
                {techPhone}
              </strong>
            </div>
            <div
              style={{ display: "flex", gap: "8px", justifyContent: "center" }}
            >
              <Button kind="secondary" onClick={() => setPhoneDialog(false)}>
                Dismiss
              </Button>
              <a
                href={`tel:${techPhone.replace(/\s+/g, "")}`}
                className="button primary"
                style={{ textDecoration: "none" }}
              >
                <Icon name="phone" size={15} style={{ marginRight: "6px" }} />
                Open Phone App
              </a>
            </div>
          </div>
        </div>
      )}

      <ProcessingOverlay
        open={isReassigning}
        title="Finding a backup technician"
        steps={[
          "Checking standby technicians",
          "Matching service and distance",
          "Backup assigned",
        ]}
        durationMs={ms(2000)}
        variant="radar"
        onDone={handleReassignDone}
      />
    </div>
  )
}
