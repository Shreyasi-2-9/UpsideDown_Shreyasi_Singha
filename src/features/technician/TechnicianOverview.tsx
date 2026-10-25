import { useState, useEffect } from "react"
import { useApp, useT } from "../../context/AppContext"
import { Icon } from "../../components/common/Icon"
import { Button } from "../../components/common/Button"
import { Badge } from "../../components/common/Badge"
import { StatCard } from "../../components/common/StatCard"
import { SpeakButton } from "../../components/voice/SpeakButton"
import { dataStore } from "../../services/dataStore"
import type { IconName } from "../../types"

export function TechnicianOverview({
  setView,
}: {
  setView: (v: string) => void
}) {
  const { requests, setActiveRequestId, technicians, refreshAllState } =
    useApp()
  const { t, language, formatDate } = useT()

  const tech01 = technicians?.find((t) => t.id === "TECH-01")
  const [online, setOnline] = useState(() => {
    const t = dataStore.getTechnicians().find((x) => x.id === "TECH-01")
    return t ? t.status === "online" : true
  })

  useEffect(() => {
    if (tech01) {
      setOnline(tech01.status === "online")
    }
  }, [tech01?.status])

  const handleToggleStatus = () => {
    const nextStatus = online ? "offline" : "online"
    setOnline(!online)
    dataStore.setTechnicianStatus("TECH-01", nextStatus)
    refreshAllState()
  }

  const pendingRequests = requests.filter(
    (r) => r.status === "pending" || r.status === "quoted",
  )

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

  const todayDate = formatDate(new Date(), language, {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).toUpperCase()

  const activeJobsCount = requests.filter(
    (r) => r.status === "in_progress" || r.status === "on_the_way",
  ).length

  return (
    <div className="page" style={{ fontSize: "15px" }}>
      <div className="split-heading" style={{ flexWrap: "wrap", gap: "14px" }}>
        <div>
          <p className="eyebrow">{todayDate}</p>
          <h1>{t.technician.greeting}, Ravi.</h1>
          <p className="subhead">
            {language === "hi"
              ? `आज आपके पास ${activeJobsCount} चालू काम हैं।`
              : language === "mr"
                ? `आज तुमच्याकडे ${activeJobsCount} चालू कामे आहेत.`
                : `You have ${activeJobsCount} ${t.technician.activeJobsSub}`}
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            className="button secondary"
            style={{ fontSize: "13px", minHeight: "44px", padding: "0 14px" }}
            onClick={handleToggleStatus}
          >
            {online ? t.common.online : t.common.offline}
          </button>
          <Badge tone={online ? "green" : "neutral"}>
            <span className="pulse" /> {online ? "ONLINE" : "OFFLINE"}
          </Badge>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          label={t.technician.todayEarnings}
          value="₹4,250"
          note="+18% vs last week"
          icon="wallet"
        />
        <StatCard
          label={t.technician.activeJobs}
          value={requests
            .filter((r) => r.status !== "completed" && r.status !== "cancelled")
            .length.toString()}
          note="1 en route"
          icon="briefcase"
        />
        <StatCard
          label={t.technician.completedJobs}
          value="247"
          note="98% completion rate"
          icon="check"
        />
        <StatCard
          label={t.technician.trustScore}
          value="99 / 100"
          note="Top 2% in Mumbai"
          icon="shield"
        />
      </div>

      <div className="section-title">
        <div>
          <p className="eyebrow">NEARBY SPECIALIST RADAR</p>
          <h2>
            {t.technician.incomingRequests} ({pendingRequests.length})
          </h2>
        </div>
        <span className="muted" style={{ fontSize: "12px" }}>
          Real-time municipal dispatch stream
        </span>
      </div>

      <div className="request-cards">
        {pendingRequests.length === 0 ? (
          <div
            style={{
              gridColumn: "1 / -1",
              background: "#fff",
              border: "1px solid var(--line)",
              borderRadius: "15px",
              padding: "30px",
              textAlign: "center",
              color: "var(--muted)",
            }}
          >
            {language === "hi"
              ? "इस समय कोई नया काम नहीं है। आप पूरी तरह तैयार हैं!"
              : language === "mr"
                ? "या वेळी नवीन कामे उपलब्ध नाहीत. तुमचे सर्व काम झाले आहे!"
                : "No new incoming requests at this moment. You are caught up!"}
          </div>
        ) : (
          pendingRequests.map((r, i) => {
            const tradeIcon = getTradeIcon(r.serviceCode || r.serviceName)
            const area = r.address.split(",")[1]?.trim() || r.address
            const cardSpeech =
              language === "hi"
                ? `नया काम: ${r.serviceName}। ${r.description}। ग्राहक ${r.citizenName}, दूरी 2.4 किमी।`
                : language === "mr"
                  ? `नवीन काम: ${r.serviceName}. ${r.description}. ग्राहक ${r.citizenName}, अंतर 2.4 किमी.`
                  : `New job request: ${r.serviceName}. ${r.description}. Customer ${r.citizenName}, 2.4 km away in ${area}.`

            return (
              <article
                className={i === 0 ? "incoming featured" : "incoming"}
                key={r.id}
                style={{ borderRadius: "16px", padding: "22px" }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "10px",
                        background: "#eef2fe",
                        color: "var(--blue)",
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      <Icon name={tradeIcon} size={20} />
                    </div>
                    <Badge tone={r.priority === "urgent" ? "red" : "blue"}>
                      {r.serviceName.toUpperCase()}
                    </Badge>
                    {r.bookingSource === "senior_call_to_book" ? (
                      <span
                        className="new-tag"
                        style={{ color: "var(--blue)" }}
                      >
                        SENIOR ASSISTED
                      </span>
                    ) : (
                      <span className="new-tag">NEW REQUEST</span>
                    )}
                  </div>

                  <SpeakButton
                    text={cardSpeech}
                    lang={language}
                    iconOnly={true}
                  />
                </div>

                <h2 style={{ fontSize: "18px", marginTop: "12px" }}>
                  {r.description.slice(0, 48)}
                </h2>
                <p style={{ fontSize: "13px" }}>
                  {r.citizenName} · {r.address}
                </p>

                <div
                  className="incoming-facts"
                  style={{ fontSize: "13px", margin: "14px 0 16px" }}
                >
                  <span>
                    <Icon name="pin" size={16} /> 2.4 km
                  </span>
                  <span>
                    <Icon name="clock" size={16} /> {r.scheduledTime}
                  </span>
                  <span>
                    <Icon name="rupee" size={16} /> ₹{r.agreedPrice - 50}–₹
                    {r.agreedPrice + 150}
                  </span>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <Button
                    kind="secondary"
                    style={{ minHeight: "44px", fontSize: "13px" }}
                    onClick={() => {
                      setActiveRequestId(r.id)
                      setView("request")
                    }}
                  >
                    {t.technician.inspectDetails}
                  </Button>
                  <Button
                    icon="check"
                    style={{ minHeight: "44px", fontSize: "13px" }}
                    onClick={() => {
                      setActiveRequestId(r.id)
                      setView("request")
                    }}
                  >
                    {t.technician.submitQuote}
                  </Button>
                </div>
              </article>
            )
          })
        )}
      </div>
    </div>
  )
}
