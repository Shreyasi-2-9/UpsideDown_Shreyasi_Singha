import { useState, useEffect } from "react"
import { useApp, useT } from "../../context/AppContext"
import { Icon } from "../../components/common/Icon"
import { Button } from "../../components/common/Button"
import { Badge } from "../../components/common/Badge"
import { Rating } from "../../components/common/Rating"
import { MiniMap } from "../../components/common/MiniMap"
import { ms } from "../../components/common/fxConfig"
import { ProcessingOverlay } from "../../components/common/ProcessingOverlay"
import { getPriceBand, getPriceVerdict } from "../../services/dataStore"
import { SpeakButton } from "../../components/voice/SpeakButton"
import type { CitizenView, Offer } from "../../types"

const seenRequestIds = new Set<string>()

export function OffersScreen({ go }: { go: (v: CitizenView) => void }) {
  const {
    offers,
    requests,
    activeRequestId,
    setActiveRequestId,
    acceptOffer,
    setNegotiatingOffer,
  } = useApp()
  const { t, language, formatCurrency } = useT()

  const currentRequest =
    requests.find((r) => r.id === activeRequestId) || requests[0]
  const reqId = currentRequest?.id || ""
  const currentOffers = offers.filter((o) => o.requestId === reqId)

  const [displayedCount, setDisplayedCount] = useState<number>(() => {
    return reqId && seenRequestIds.has(reqId) ? currentOffers.length : 0
  })
  const [isFinished, setIsFinished] = useState<boolean>(() => {
    return Boolean(reqId && seenRequestIds.has(reqId))
  })

  useEffect(() => {
    if (!reqId) return

    if (seenRequestIds.has(reqId)) {
      setDisplayedCount(currentOffers.length)
      setIsFinished(true)
      return
    }

    seenRequestIds.add(reqId)
    setDisplayedCount(0)
    setIsFinished(false)

    if (currentOffers.length === 0) {
      setIsFinished(true)
      return
    }

    let current = 0
    const interval = setInterval(() => {
      current += 1
      setDisplayedCount(current)
      if (current >= currentOffers.length) {
        clearInterval(interval)
        setIsFinished(true)
      }
    }, ms(600))

    return () => clearInterval(interval)
  }, [reqId, currentOffers.length])

  const displayOffers = isFinished
    ? currentOffers
    : currentOffers.slice(0, displayedCount)
  const band = getPriceBand(
    currentRequest?.serviceCode || currentRequest?.serviceName,
  )
  const [lockingOffer, setLockingOffer] = useState<Offer | null>(null)

  const handleAccept = (offer: Offer) => {
    setLockingOffer(offer)
  }

  const handleLockDone = () => {
    if (currentRequest && lockingOffer) {
      acceptOffer(currentRequest.id, lockingOffer)
      go("locked")
    }
    setLockingOffer(null)
  }

  return (
    <div className="page">
      {/* Multiple Requests Switcher if citizen has multiple */}
      {requests.length > 1 && (
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginBottom: "20px",
            alignItems: "center",
          }}
        >
          <span
            style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 600 }}
          >
            SWITCH REQUEST:
          </span>
          {requests.map((r) => (
            <button
              key={r.id}
              className={
                r.id === currentRequest?.id
                  ? "button primary"
                  : "button secondary"
              }
              style={{ height: "30px", padding: "0 10px", fontSize: "11px" }}
              onClick={() => setActiveRequestId(r.id)}
            >
              {r.id} ({r.serviceName})
            </button>
          ))}
        </div>
      )}

      <div className="offer-header">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <p className="live-label" style={{ margin: 0 }}>
              <span className="pulse" />{" "}
              {isFinished && currentOffers.length > 0
                ? `${currentOffers.length} ${
                    language === "hi"
                      ? "कारीगरों के रेट मिले"
                      : language === "mr"
                        ? "कारागिरांचे दर मिळाले"
                        : "TECHNICIANS RESPONDED"
                  }`
                : language === "hi"
                  ? "पास के कारीगर खोज रहे हैं..."
                  : "SEARCHING NEARBY TECHNICIANS"}
            </p>
            {displayOffers.length > 0 && (
              <SpeakButton
                text={`${displayOffers.length} offers found. Top offer is from ${displayOffers[0].name} for ₹${displayOffers[0].price}, arrival in ${displayOffers[0].eta}.`}
                lang={language}
              />
            )}
          </div>
          <h1>{t.citizen.offersFound}</h1>
          <p className="subhead">
            {displayOffers.length === 0
              ? language === "hi"
                ? "कारीगरों के जवाब का इंतज़ार है…"
                : "Waiting for technicians to respond…"
              : `${displayOffers.length} ${t.citizen.incomingOffers}`}
          </p>
        </div>
        <div className="request-chip">
          <Icon name="route" />
          <div>
            <b>
              {currentRequest?.description.slice(0, 32) || "Burst kitchen pipe"}
            </b>
            <small>
              {currentRequest?.address.split(",")[1]?.trim() || "Andheri West"}{" "}
              · Posted {currentRequest?.createdAt || "just now"}
            </small>
          </div>
        </div>
      </div>

      {displayOffers.length === 0 && (
        <div
          style={{
            height: "3px",
            width: "100%",
            background:
              "linear-gradient(90deg, #e4e7ec 0%, #315cf5 50%, #e4e7ec 100%)",
            borderRadius: "99px",
            margin: "10px 0 16px",
          }}
        />
      )}

      <div className="offers-layout">
        <MiniMap
          large
          techName={(displayOffers[0]?.name || currentOffers[0]?.name || "RAVI")
            .split(" ")[0]
            .toUpperCase()}
        />
        <div className="offer-list">
          {displayOffers.map((o, i) => {
            const verdict = getPriceVerdict(o.price, band)
            const offerSpeakText =
              language === "hi"
                ? `${o.name}, रेट ₹${o.price}, पहुँचने का समय ${o.eta}, दूरी ${o.distance}।`
                : language === "mr"
                  ? `${o.name}, दर ₹${o.price}, वेळ ${o.eta}, अंतर ${o.distance}.`
                  : `${o.name}, price ${formatCurrency(o.price)}, ETA ${o.eta}, ${o.distance} away.`

            return (
              <article
                className={`${
                  i === 0 ? "offer-card featured" : "offer-card"
                } fx-slide-in`}
                key={o.id || o.name}
              >
                <div className="offer-person">
                  <div className="avatar">{o.initials}</div>
                  <div>
                    <h3>
                      {o.name}{" "}
                      {i === 0 && (
                        <span className="verified-check">
                          <Icon name="check" size={11} />
                        </span>
                      )}
                    </h3>
                    <span>
                      <Rating value={o.rating} /> · {o.jobs}{" "}
                      {language === "hi"
                        ? "काम पूरे"
                        : language === "mr"
                          ? "कामे पूर्ण"
                          : "jobs completed"}
                    </span>
                  </div>
                  <Badge tone={verdict.tone}>{verdict.label}</Badge>
                </div>

                <div className="offer-facts">
                  <span>
                    <Icon name="pin" size={14} />
                    {o.distance}
                  </span>
                  <span>
                    <Icon name="clock" size={14} />
                    {o.eta}
                  </span>
                  <strong>{formatCurrency(o.price)}</strong>
                  <SpeakButton
                    text={offerSpeakText}
                    lang={language}
                    iconOnly={true}
                  />
                </div>

                <div className="price-scale">
                  <div className="scale-labels">
                    <span>₹{band.low}</span>
                    <span>{t.citizen.fairPrice}</span>
                    <span>₹{band.high}</span>
                  </div>
                  <div className="scale-track">
                    <span style={{ left: `${verdict.pct}%` }} />
                  </div>
                </div>

                <div
                  className="offer-actions"
                  style={{ gap: "8px", flexWrap: "wrap" }}
                >
                  <Button
                    kind="ghost"
                    disabled={Boolean(lockingOffer)}
                    onClick={() => {
                      setNegotiatingOffer(o)
                      go("technician")
                    }}
                  >
                    {t.citizen.viewDetails}
                  </Button>
                  <Button
                    kind="secondary"
                    disabled={Boolean(lockingOffer)}
                    onClick={() => {
                      setNegotiatingOffer(o)
                      go("negotiate")
                    }}
                  >
                    {t.citizen.negotiate}
                  </Button>
                  <Button
                    icon="check"
                    disabled={Boolean(lockingOffer)}
                    onClick={() => handleAccept(o)}
                  >
                    {t.common.accept} ({formatCurrency(o.price)})
                  </Button>
                </div>
              </article>
            )
          })}
        </div>
      </div>

      <ProcessingOverlay
        open={Boolean(lockingOffer)}
        title="Locking your price"
        steps={[
          "Confirming price with technician",
          `Holding ₹${lockingOffer?.price || 0} in escrow`,
          "Generating agreement",
        ]}
        durationMs={ms(1800)}
        variant="bar"
        onDone={handleLockDone}
      />
    </div>
  )
}
