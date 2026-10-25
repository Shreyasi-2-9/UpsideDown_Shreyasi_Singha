import { useState, useRef } from "react"
import { useApp } from "../../context/AppContext"
import { Icon } from "../../components/common/Icon"
import { Button } from "../../components/common/Button"
import { Badge } from "../../components/common/Badge"
import { compressImage } from "../../services/imageUtils"
import type { CitizenView } from "../../types"

export function CitizenProfile({ go }: { go: (v: CitizenView) => void }) {
  const {
    activeJob,
    submitReview,
    seniorMode,
    setSeniorMode,
    openCallToBook,
    requests,
  } = useApp()

  const [rating, setRating] = useState(5)
  const [reviewText, setReviewText] = useState("")
  const [isPublic, setIsPublic] = useState(true)
  const [reviewDone, setReviewDone] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)
  const [reviewPhoto, setReviewPhoto] = useState<string | null>(null)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Profile editable fields
  const [name, setName] = useState("Rahul Sharma")
  const [phone, setPhone] = useState("+91 98201 55432")
  const [address, setAddress] = useState(
    "Flat 302, Silver Oak Residency, Andheri West, Mumbai",
  )
  const [emergencyPhone, setEmergencyPhone] = useState("+91 98209 99887")

  const targetJob = activeJob || requests[0]
  const techName = targetJob?.assignedTechName || "Ravi Verma"
  const jobId = targetJob?.id || "HC-301"

  const handlePhotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploadingPhoto(true)
    try {
      const compressed = await compressImage(file)
      setReviewPhoto(compressed)
    } catch (err) {
      console.error("Failed to compress review photo:", err)
    } finally {
      setIsUploadingPhoto(false)
      e.target.value = ""
    }
  }

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault()
    submitReview(
      jobId,
      rating,
      reviewText.trim() || "Work completed professionally and verified.",
      reviewPhoto || undefined,
    )
    setReviewDone(true)
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 2500)
  }

  return (
    <div className="page narrow-page">
      <div className="split-heading">
        <div>
          <p className="eyebrow blue">CITIZEN ACCOUNT & SERVICE RATINGS</p>
          <h1>Profile & Reviews</h1>
          <p className="subhead">
            Manage your registered details, emergency contacts, and technician
            reviews.
          </p>
        </div>
        <Button kind="secondary" icon="phone" onClick={() => openCallToBook()}>
          Call to Book
        </Button>
      </div>

      {/* Review Submission Card */}
      <section className="form-card" style={{ marginBottom: "28px" }}>
        {reviewDone ? (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <div className="success-seal" style={{ margin: "0 auto 12px" }}>
              <Icon name="check" size={28} />
            </div>
            <h2>Thank you, {name}!</h2>
            <p className="subhead">
              Your {rating}-star review helps neighbours choose with confidence.
            </p>
            {reviewPhoto && (
              <div
                style={{
                  margin: "14px auto",
                  maxWidth: "200px",
                  borderRadius: "12px",
                  overflow: "hidden",
                  border: "1px solid var(--line)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
              >
                <img
                  src={reviewPhoto}
                  alt="Review proof"
                  style={{ width: "100%", height: "130px", objectFit: "cover", display: "block" }}
                />
              </div>
            )}
            <div style={{ marginTop: "16px", display: "flex", gap: "10px", justifyContent: "center" }}>
              <Button kind="secondary" onClick={() => setReviewDone(false)}>
                Update review
              </Button>
              <Button icon="arrow" onClick={() => go("overview")}>
                Return to home
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <p className="eyebrow blue">RATE RECENT JOB · {jobId}</p>
                <h2 style={{ margin: "4px 0 8px" }}>
                  How was your experience?
                </h2>
              </div>
              <Badge tone="green">VERIFIED SERVICE</Badge>
            </div>

            <div className="review-person">
              <div className="profile-avatar small-profile">
                {targetJob?.assignedTechInitials || "RV"}
                <span>
                  <Icon name="check" size={13} />
                </span>
              </div>
              <div>
                <b>{techName}</b>
                <span>Plumbing & Mechanical · Verified technician</span>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                margin: "14px 0",
              }}
            >
              <div className="stars">
                {[1, 2, 3, 4, 5].map((x) => (
                  <button
                    key={x}
                    type="button"
                    className={x <= rating ? "filled" : ""}
                    onClick={() => setRating(x)}
                    aria-label={`Rate ${x} stars`}
                  >
                    <Icon name="star" size={26} />
                  </button>
                ))}
              </div>
              <b className="rating-number">{rating} / 5 Stars</b>
            </div>

            <form onSubmit={handleSubmitReview} className="review-form">
              <label>
                Tell us about the service
                <textarea
                  placeholder="Ravi arrived on time and explained the repair clearly..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={3}
                />
              </label>

              {/* Photo Upload for Review */}
              <div style={{ marginTop: "10px", marginBottom: "12px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: 600,
                    fontSize: "13px",
                  }}
                >
                  Attach photo of completed work (optional)
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoFileChange}
                  accept="image/*"
                  style={{ display: "none" }}
                />
                {reviewPhoto ? (
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
                      src={reviewPhoto}
                      alt="Review preview"
                      style={{
                        width: "140px",
                        height: "100px",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setReviewPhoto(null)}
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
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                    style={{ minHeight: "40px", fontSize: "12px" }}
                  >
                    {isUploadingPhoto ? "Processing photo..." : "Upload repair photo"}
                  </Button>
                )}
              </div>

              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                />
                Share as a public verified review for Silver Oak society
              </label>

              <Button
                type="submit"
                style={{ width: "100%", minHeight: "46px", marginTop: "10px" }}
              >
                Submit review & rating
              </Button>
            </form>
          </div>
        )}
      </section>

      {/* Citizen Personal Profile & Senior Mode Settings */}
      <section className="form-card">
        <div className="section-title" style={{ margin: "0 0 18px" }}>
          <div>
            <p className="eyebrow">SAVED PARTICULARS</p>
            <h2>Citizen Details & Safety Preferences</h2>
          </div>
          <Badge tone={seniorMode ? "blue" : "neutral"}>
            {seniorMode ? "SENIOR MODE: ON" : "STANDARD MODE"}
          </Badge>
        </div>

        {profileSaved && (
          <div
            style={{
              padding: "10px 14px",
              background: "#e1f6e9",
              color: "var(--green)",
              borderRadius: "8px",
              fontSize: "11px",
              fontWeight: 600,
              display: "flex",
              gap: "8px",
              alignItems: "center",
            }}
          >
            <Icon name="check" size={16} /> Profile changes saved successfully
            to persistent memory.
          </div>
        )}

        <form
          onSubmit={handleSaveProfile}
          style={{ display: "grid", gap: "18px" }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "14px",
            }}
          >
            <label>
              Full Name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </label>
            <label>
              Primary Phone
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </label>
          </div>

          <label>
            Registered Address
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </label>

          <label>
            Emergency Contact (Next of Kin / Relative)
            <input
              value={emergencyPhone}
              onChange={(e) => setEmergencyPhone(e.target.value)}
              placeholder="e.g. Rohan Sharma (Son) +91 98209 99887"
            />
          </label>

          {/* Senior Assistance Mode Toggle */}
          <div
            style={{
              padding: "16px",
              background: "#f5f5f2",
              borderRadius: "12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <b style={{ fontSize: "13px" }}>
                Senior Citizen High-Accessibility Mode
              </b>
              <span
                style={{
                  display: "block",
                  fontSize: "11px",
                  color: "var(--muted)",
                  marginTop: "2px",
                }}
              >
                Enables larger buttons, high contrast badges, and 1-click Call
                to Book options.
              </span>
            </div>
            <button
              type="button"
              className={seniorMode ? "button primary" : "button secondary"}
              style={{ height: "34px", fontSize: "11px" }}
              onClick={() => setSeniorMode(!seniorMode)}
            >
              {seniorMode ? "Enabled" : "Enable Senior Mode"}
            </button>
          </div>

          <div
            style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}
          >
            <Button kind="secondary" onClick={() => go("overview")}>
              Return to overview
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </section>
    </div>
  )
}
