import { useApp, useT } from "../../context/AppContext"
import { Icon } from "../../components/common/Icon"
import { Button } from "../../components/common/Button"
import { Badge } from "../../components/common/Badge"
import { Rating } from "../../components/common/Rating"
import { SpeakButton } from "../../components/voice/SpeakButton"
import type { CitizenView, IconName, ServiceCategory } from "../../types"

export function CitizenDashboard({ go }: { go: (v: CitizenView) => void }) {
  const {
    services,
    requests,
    activeJob,
    setActiveRequestId,
    seniorMode,
    setSeniorMode,
    openCallToBook,
  } = useApp()
  const { t, language, formatDate } = useT()

  const liveJob = activeJob || requests[0]

  const handleServiceClick = (category: ServiceCategory) => {
    if (seniorMode) {
      openCallToBook(category)
    } else {
      go("request")
    }
  }

  const todayDateString = formatDate(new Date(), language, {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).toUpperCase()

  const welcomeGreeting = `${t.citizen.morningGreeting}, Rahul.`

  return (
    <div className={`page ${seniorMode ? "senior-mode-active" : ""}`}>
      {/* Three-Level Citizen Overview Header */}
      <section className="welcome-row">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <p className="eyebrow">{t.citizen.verifiedLocalServices}</p>
            <SpeakButton
              text={`${t.citizen.findServiceHeader}. ${t.citizen.greetingSub}`}
              lang={language}
              iconOnly={true}
            />
          </div>
          <h1>{t.citizen.findServiceHeader}</h1>
          <p className="subhead">{t.citizen.greetingSub}</p>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Button
            kind="secondary"
            icon="phone"
            onClick={() => openCallToBook()}
            title={t.common.callToBook}
            style={{ minHeight: "44px" }}
          >
            {t.common.callToBook}
          </Button>
          <Button
            icon="arrow"
            onClick={() => go("request")}
            style={{ minHeight: "44px" }}
          >
            {t.citizen.requestTitle}
          </Button>
        </div>
      </section>

      {/* Senior Citizen Dedicated Assistance Card when Senior Mode is active or prominent */}
      {seniorMode && (
        <section
          style={{
            background: "#ffffff",
            border: "2px solid #315cf5",
            borderRadius: "18px",
            padding: "24px 28px",
            marginBottom: "28px",
            boxShadow: "var(--shadow)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "5px",
              background: "var(--blue)",
            }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <div style={{ maxWidth: "680px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "8px",
                }}
              >
                <Badge tone="blue">SENIOR CITIZEN ASSISTANCE MODE</Badge>
                <span
                  style={{
                    fontSize: "11px",
                    color: "var(--muted)",
                    fontWeight: 600,
                  }}
                >
                  Free Telephone Booking Hotline
                </span>
              </div>
              <h2 style={{ fontSize: "24px", margin: "6px 0 8px" }}>
                Prefer speaking directly to an operator?
              </h2>
              <p
                style={{
                  color: "var(--muted)",
                  fontSize: "13px",
                  lineHeight: "1.6",
                  margin: 0,
                }}
              >
                Our municipal care coordinators are ready to book, schedule, and
                verify technicians for you without typing or complex forms.
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  marginTop: "14px",
                  fontSize: "12px",
                  color: "var(--ink)",
                }}
              >
                <span>
                  <Icon
                    name="phone"
                    size={15}
                    style={{
                      verticalAlign: "middle",
                      marginRight: "6px",
                      color: "var(--blue)",
                    }}
                  />
                  Toll-Free: <strong>1800-555-0199</strong>
                </span>
                <span>
                  <Icon
                    name="clock"
                    size={15}
                    style={{
                      verticalAlign: "middle",
                      marginRight: "6px",
                      color: "var(--muted)",
                    }}
                  />
                  Hours: <strong>8:00 AM – 8:00 PM IST</strong>
                </span>
              </div>
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <Button
                icon="phone"
                onClick={() => openCallToBook()}
                className="button primary"
                style={{ fontSize: "14px", height: "48px", padding: "0 24px" }}
              >
                Call to Book Service Now
              </Button>
              <button
                className="text-link"
                style={{ textAlign: "center", justifyContent: "center" }}
                onClick={() => setSeniorMode(false)}
              >
                Switch to Standard Citizen View
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Services Section Header */}
      <div className="section-title">
        <div>
          <p className="eyebrow">{t.citizen.verifiedLocalServices}</p>
          <h2>{t.citizen.findServiceHeader}</h2>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {!seniorMode && (
            <button className="text-link" onClick={() => setSeniorMode(true)}>
              <Icon name="user" size={14} /> {t.common.seniorMode}
            </button>
          )}
          <button className="text-link" onClick={() => go("request")}>
            {t.citizen.viewAllServices} <Icon name="arrow" size={15} />
          </button>
        </div>
      </div>

      {/* Service Cards Grid (All 8 Services Interactive!) */}
      <div className="service-grid">
        {services.map((s) => {
          const sKey = s.code as keyof typeof t.services
          const sName = t.services[sKey]?.name || s.name
          const sDesc = t.services[sKey]?.desc || s.desc
          return (
            <button
              className="service-card"
              key={s.code}
              onClick={() => handleServiceClick(s)}
              title={`Select ${sName} (${s.code})`}
            >
              <div
                className="service-icon"
                style={{ width: "48px", height: "48px", borderRadius: "14px" }}
              >
                <Icon name={s.icon as IconName} size={24} />
              </div>
              <span className="service-code">{s.code}</span>
              <h3>{sName}</h3>
              <p>{sDesc}</p>
              <span className="service-action">
                {t.citizen.requestTitle} <Icon name="arrow" size={14} />
              </span>
            </button>
          )
        })}
      </div>

      {/* Active Job Card */}
      {liveJob && (
        <section className="active-job-card">
          <div className="active-job-label">
            <span className="pulse" />
            <b>ACTIVE JOB</b>
            <span className="tabular-nums">{liveJob.id}</span>
            {liveJob.bookingSource === "senior_call_to_book" && (
              <Badge tone="blue" style={{ marginLeft: "10px" }}>
                CALL-TO-BOOK
              </Badge>
            )}
          </div>

          <div className="job-summary">
            <div style={{ minWidth: 0 }}>
              <p className="eyebrow" style={{ color: "#94a3b8" }}>
                {liveJob.serviceName.toUpperCase()} · {liveJob.serviceCode}
              </p>
              <h2
                style={{
                  fontSize: "var(--font-h2)",
                  fontWeight: 600,
                  lineHeight: 1.15,
                  letterSpacing: "-0.02em",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "100%",
                }}
                title={
                  liveJob.serviceName.toLowerCase().includes("repair")
                    ? liveJob.serviceName
                    : `${liveJob.serviceName} repair`
                }
              >
                {liveJob.serviceName.toLowerCase().includes("repair")
                  ? liveJob.serviceName
                  : `${liveJob.serviceName} repair`}
              </h2>
              <p
                style={{
                  fontSize: "12px",
                  color: "#cbd5e1",
                  lineHeight: 1.5,
                  marginTop: "6px",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                title={liveJob.description}
              >
                {liveJob.description}
              </p>
              <div className="technician-inline">
                <div className="avatar">
                  {liveJob.assignedTechInitials || "RV"}
                </div>
                <div>
                  <b>
                    {liveJob.assignedTechName || "Ravi Verma"}{" "}
                    <span className="verified-check">
                      <Icon name="check" size={11} />
                    </span>
                  </b>
                  <span>
                    Verified technician ·{" "}
                    <Rating value={liveJob.assignedTechRating || "4.9"} />
                  </span>
                </div>
              </div>
            </div>

            <div className="job-metric">
              <span className="metric-header-label">STATUS</span>
              <span className={`status-pill status-${liveJob.status}`}>
                <span className="status-dot" />
                <span>
                  {liveJob.status === "on_the_way"
                    ? "On the way"
                    : liveJob.status === "arrived"
                      ? "Arrived"
                      : liveJob.status === "in_progress"
                        ? "In progress"
                        : liveJob.status === "completed"
                          ? "Completed"
                          : liveJob.status.replace(/_/g, " ")}
                </span>
              </span>
            </div>

            <div className="job-metric">
              <span className="metric-header-label">ETA / TIME</span>
              <strong className="tabular-nums">
                {liveJob.timelineStep === 1
                  ? "08 "
                  : liveJob.timelineStep === 2
                    ? "00 "
                    : liveJob.timelineStep === 3
                      ? "NOW "
                      : "DONE "}
                <small>{liveJob.timelineStep === 1 ? "min" : ""}</small>
              </strong>
            </div>

            <div className="job-metric">
              <span className="metric-header-label">PRICE</span>
              <strong className="tabular-nums">₹{liveJob.agreedPrice}</strong>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: liveJob.escrowStatus === "released" ? "#4ade80" : "#93c5fd",
                  background:
                    liveJob.escrowStatus === "released"
                      ? "rgba(34, 197, 94, 0.16)"
                      : "rgba(59, 130, 246, 0.16)",
                  border: `1px solid ${
                    liveJob.escrowStatus === "released"
                      ? "rgba(34, 197, 94, 0.35)"
                      : "rgba(59, 130, 246, 0.35)"
                  }`,
                  padding: "3px 8px",
                  borderRadius: "6px",
                  width: "fit-content",
                  alignSelf: "flex-start",
                }}
              >
                <Icon
                  name="shield"
                  size={12}
                  style={{ flexShrink: 0, width: "12px", height: "12px" }}
                />
                <span>
                  {liveJob.escrowStatus === "released"
                    ? "PAID · ESCROW RELEASED"
                    : "ESCROW LOCKED"}
                </span>
              </div>
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px", alignSelf: "center" }}
            >
              <Button
                kind="secondary"
                icon="arrow"
                onClick={() => {
                  setActiveRequestId(liveJob.id)
                  go("job")
                }}
              >
                Track job
              </Button>
              {liveJob.escrowStatus === "released" ? (
                <Button
                  kind="primary"
                  icon="star"
                  onClick={() => {
                    setActiveRequestId(liveJob.id)
                    go("review")
                  }}
                >
                  Rate & Review
                </Button>
              ) : liveJob.status === "completed" &&
                liveJob.escrowStatus === "escrow_locked" ? (
                  <Button
                    kind="primary"
                    icon="shield"
                    onClick={() => {
                      setActiveRequestId(liveJob.id)
                      go("complete")
                    }}
                  >
                    Confirm repair
                  </Button>
                ) : null}
            </div>
          </div>
        </section>
      )}

      {/* Citizen's Requests List Strip */}
      <section style={{ marginTop: "36px" }}>
        <div className="section-title">
          <div>
            <p className="eyebrow">YOUR RECENT BOOKINGS</p>
            <h2>My service requests ({requests.length})</h2>
          </div>
          <button className="text-link" onClick={() => go("offers")}>
            View all requests <Icon name="arrow" size={15} />
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "14px",
          }}
        >
          {requests.slice(0, 3).map((r) => (
            <article
              key={r.id}
              style={{
                background: "#fff",
                border: "1px solid var(--line)",
                borderRadius: "14px",
                padding: "18px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <b style={{ fontSize: "13px" }}>{r.id}</b>
                  <Badge
                    tone={
                      r.status === "completed"
                        ? "green"
                        : r.status === "in_progress"
                          ? "blue"
                          : "amber"
                    }
                  >
                    {r.status.replace(/_/g, " ").toUpperCase()}
                  </Badge>
                </div>
                <h3 style={{ margin: "10px 0 4px", fontSize: "14px" }}>
                  {r.serviceName}
                </h3>
                <p
                  style={{ color: "var(--muted)", fontSize: "11px", margin: 0 }}
                >
                  {r.description}
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "16px",
                  borderTop: "1px solid var(--soft)",
                  paddingTop: "12px",
                }}
              >
                <b style={{ fontSize: "15px" }}>₹{r.agreedPrice}</b>
                <Button
                  kind="ghost"
                  onClick={() => {
                    setActiveRequestId(r.id)
                    if (r.status === "pending" || r.status === "quoted") {
                      go("offers")
                    } else if (r.status === "completed") {
                      go("receipt")
                    } else {
                      go("job")
                    }
                  }}
                >
                  Open Details →
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
