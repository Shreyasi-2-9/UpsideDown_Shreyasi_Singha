import { useState } from "react"
import { useApp } from "../../context/AppContext"
import { Icon } from "../common/Icon"
import { NotificationDropdown } from "../common/NotificationDropdown"
import type { Role } from "../../types"

export function Topbar() {
  const {
    role,
    setRole,
    view,
    setView,
    notifications,
    setSearchModalOpen,
    seniorMode,
    setSeniorMode,
    openCallToBook,
    language,
    setLanguage,
    voiceHelp,
    setVoiceHelp,
    setCurrentScreen,
    t,
  } = useApp()

  const [notificationOpen, setNotificationOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const hasUnread = notifications.some((n) => !n.read)

  const roles: Role[] = ["citizen", "technician", "admin"]
  const userInitials =
    role === "technician" ? "RV" : role === "admin" ? "AM" : "RS"

  const userName =
    role === "technician"
      ? "Ravi Verma"
      : role === "admin"
        ? "Anjali Mehta"
        : "Rahul Sharma"

  const formatBreadcrumb = (v: string) => {
    return v.replace(/[-_]/g, " ").replace(/^\w/, (c) => c.toUpperCase())
  }

  const roleLabels: Record<Role, string> = {
    citizen: t.roles.citizen,
    technician: language === "en" ? "Tech" : t.roles.technician,
    admin: t.roles.admin,
  }

  const homeLabel =
    language === "hi" ? "होम" : language === "mr" ? "मुख्य" : "Home"

  const handleProfileClick = () => {
    if (role === "citizen") setView("review")
    else if (role === "technician") setView("profile")
    else setView("settings")
  }

  return (
    <>
      <header className="topbar">
        {/* Left side: Desktop Brand / Mobile Logo or Back */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Mobile Back button when navigated into subviews */}
          {view !== "overview" && (
            <button
              type="button"
              className="icon-button topbar-touch-target topbar-mobile-actions"
              onClick={() => setView("overview")}
              aria-label="Back to overview"
              title="Back"
            >
              <Icon
                name="arrow"
                size={18}
                style={{ transform: "rotate(180deg)" }}
              />
            </button>
          )}

          {/* Logo / Brand clickable to go home */}
          <button
            type="button"
            className="topbar-touch-target"
            onClick={() => setView("overview")}
            style={{
              border: 0,
              background: "transparent",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              padding: "0 4px",
            }}
            title="HomeCare 360"
            aria-label="HomeCare 360 Home"
          >
            <span className="brand-mark" style={{ width: "32px", height: "32px", borderRadius: "9px" }}>
              <Icon name="home" size={18} />
            </span>
            <span
              style={{
                fontFamily: "Manrope, sans-serif",
                fontWeight: 700,
                fontSize: "15px",
                letterSpacing: "-0.02em",
                color: "var(--ink)",
              }}
            >
              HC 360
            </span>
          </button>

          {/* Mobile Persona Switcher Badge Pill */}
          <button
            type="button"
            className="topbar-mobile-actions"
            onClick={() => setMobileMenuOpen(true)}
            style={{
              fontSize: "11px",
              fontWeight: 600,
              textTransform: "capitalize",
              padding: "4px 8px",
              borderRadius: "99px",
              background:
                role === "citizen"
                  ? "#eef2fe"
                  : role === "technician"
                    ? "#ecfdf5"
                    : "#fef3c7",
              color:
                role === "citizen"
                  ? "var(--blue)"
                  : role === "technician"
                    ? "var(--green)"
                    : "#b45309",
              border: "1px solid rgba(0,0,0,0.08)",
              cursor: "pointer",
              alignItems: "center",
              gap: "4px",
            }}
            title="Switch Persona / Open Menu"
            aria-label={`Current Role: ${roleLabels[role]}. Click to switch`}
          >
            <span>{roleLabels[role]}</span>
            <Icon name="chevron" size={10} style={{ transform: "rotate(90deg)" }} />
          </button>
        </div>

        {/* Sentence Case Breadcrumb: Home > Overview */}
        <div className="breadcrumb">
          <span>{homeLabel}</span>
          <Icon name="chevron" size={14} />
          <b>{formatBreadcrumb(view)}</b>
        </div>

        {/* Desktop Actions (Visible >= 640px) */}
        <div className="topbar-desktop-actions">
          {/* Language Switcher: EN | हिं | मरा */}
          <div
            className="lang-switch"
            role="group"
            aria-label="Select application language"
          >
            <button
              type="button"
              className={`lang-btn ${language === "en" ? "selected" : ""}`}
              onClick={() => setLanguage("en")}
              aria-pressed={language === "en"}
              title="English"
            >
              EN
            </button>
            <button
              type="button"
              className={`lang-btn ${language === "hi" ? "selected" : ""}`}
              onClick={() => setLanguage("hi")}
              aria-pressed={language === "hi"}
              title="हिंदी (Hindi)"
            >
              हिं
            </button>
            <button
              type="button"
              className={`lang-btn ${language === "mr" ? "selected" : ""}`}
              onClick={() => setLanguage("mr")}
              aria-pressed={language === "mr"}
              title="मराठी (Marathi)"
            >
              मरा
            </button>
          </div>

          {/* Global Voice Help Audio Toggle */}
          <button
            type="button"
            className="icon-button"
            style={{
              background: voiceHelp ? "#eef2fe" : "#ffffff",
              color: voiceHelp ? "var(--blue)" : "var(--muted)",
              borderColor: voiceHelp ? "var(--blue)" : "var(--line)",
              boxShadow: voiceHelp ? "0 0 0 2px rgba(49, 92, 245, 0.2)" : "none",
            }}
            onClick={() => setVoiceHelp(!voiceHelp)}
            title={voiceHelp ? t.common.voiceHelpActive : t.common.voiceHelp}
            aria-label={voiceHelp ? t.common.voiceHelpActive : t.common.voiceHelp}
            aria-pressed={voiceHelp}
          >
            <Icon name="speaker" size={16} />
          </button>

          {/* Senior Citizen Mode Quick Toggle for Citizen Workspace */}
          {role === "citizen" && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <button
                type="button"
                className="button ghost"
                style={{
                  fontSize: "12px",
                  height: "36px",
                  padding: "0 10px",
                  background: seniorMode ? "#eef1fd" : "transparent",
                  color: seniorMode ? "var(--blue)" : "var(--muted)",
                  border: seniorMode
                    ? "1px solid #c8d0f0"
                    : "1px solid transparent",
                }}
                onClick={() => {
                  const nextMode = !seniorMode
                  setSeniorMode(nextMode)
                  if (nextMode) setVoiceHelp(true)
                }}
                title={seniorMode ? t.common.seniorModeOn : t.common.seniorMode}
              >
                <Icon name="user" size={14} />
                <span>
                  {seniorMode ? t.common.seniorModeOn : t.common.seniorMode}
                </span>
              </button>

              <button
                type="button"
                className="button secondary"
                style={{
                  fontSize: "12px",
                  height: "36px",
                  padding: "0 10px",
                  color: "var(--blue)",
                  borderColor: "#c8d0f0",
                }}
                onClick={() => openCallToBook()}
                title={t.common.callToBook}
              >
                <Icon name="phone" size={14} />
                <span>{t.common.callToBook}</span>
              </button>
            </div>
          )}

          {/* Prototype Role Switcher */}
          <div className="role-switch">
            {roles.map((r) => (
              <button
                key={r}
                type="button"
                className={role === r ? "selected" : ""}
                onClick={() => setRole(r)}
                title={`Switch prototype view to ${roleLabels[r]}`}
              >
                {roleLabels[r]}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setCurrentScreen("role-select")}
              title="Change Role (Full Screen)"
              style={{
                opacity: 0.7,
                borderLeft: "1px solid rgba(0,0,0,0.12)",
                marginLeft: "2px",
                paddingLeft: "6px",
              }}
            >
              &#x2194;
            </button>
          </div>

          {/* Search button */}
          <button
            type="button"
            className="icon-button"
            onClick={() => setSearchModalOpen(true)}
            title={t.common.search}
            aria-label={t.common.search}
          >
            <Icon name="search" size={16} />
          </button>

          {/* Bell Notifications */}
          <button
            type="button"
            className={hasUnread ? "icon-button has-dot" : "icon-button"}
            onClick={() => setNotificationOpen(!notificationOpen)}
            title={t.common.notifications}
            aria-label={t.common.notifications}
          >
            <Icon name="bell" size={16} />
          </button>

          {/* Avatar */}
          <div
            className="avatar small"
            title={`Active user profile: ${userName}`}
            onClick={handleProfileClick}
            style={{ cursor: "pointer" }}
          >
            {userInitials}
          </div>
        </div>

        {/* Mobile Actions (Visible below 640px: Only Search, Bell, and Avatar) */}
        <div className="topbar-mobile-actions">
          {/* Search Button (48px tap target) */}
          <button
            type="button"
            className="icon-button topbar-touch-target"
            onClick={() => setSearchModalOpen(true)}
            title={t.common.search}
            aria-label={t.common.search}
          >
            <Icon name="search" size={18} />
          </button>

          {/* Bell Button (48px tap target) */}
          <button
            type="button"
            className={hasUnread ? "icon-button has-dot topbar-touch-target" : "icon-button topbar-touch-target"}
            onClick={() => setNotificationOpen(!notificationOpen)}
            title={t.common.notifications}
            aria-label={t.common.notifications}
          >
            <Icon name="bell" size={18} />
          </button>

          {/* Avatar Button (48px tap target) - Tapping opens the collapsed mobile menu */}
          <button
            type="button"
            className="avatar small topbar-touch-target"
            onClick={() => setMobileMenuOpen(true)}
            title="Open Controls & Profile Menu"
            aria-label="Open Controls & Profile Menu"
            aria-expanded={mobileMenuOpen}
            aria-haspopup="dialog"
            style={{
              cursor: "pointer",
              border: "2px solid var(--line)",
              position: "relative",
            }}
          >
            {userInitials}
          </button>
        </div>

        <NotificationDropdown
          isOpen={notificationOpen}
          onClose={() => setNotificationOpen(false)}
        />
      </header>

      {/* Mobile Collapsible Bottom Sheet Menu (Below 640px) */}
      {mobileMenuOpen && (
        <div
          className="mobile-sheet-backdrop"
          onClick={() => setMobileMenuOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-menu-title"
        >
          <div
            className="mobile-sheet"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mobile-sheet-handle" />

            {/* Profile Row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingBottom: "12px",
                borderBottom: "1px solid var(--line)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div className="avatar" style={{ width: "42px", height: "42px", fontSize: "14px" }}>
                  {userInitials}
                </div>
                <div>
                  <b style={{ fontSize: "15px", display: "block" }}>{userName}</b>
                  <span style={{ fontSize: "12px", color: "var(--muted)", textTransform: "capitalize" }}>
                    {roleLabels[role]}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="topbar-touch-target"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
                style={{
                  border: 0,
                  background: "#f0f0ed",
                  borderRadius: "50%",
                  color: "var(--ink)",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            {/* 1. Language Switcher (All targets >= 48px) */}
            <div>
              <p className="eyebrow" style={{ marginBottom: "8px" }}>
                Language / भाषा / भाषा
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "8px",
                }}
              >
                <button
                  type="button"
                  className={`touch-target-48 button ${language === "en" ? "primary" : "secondary"}`}
                  onClick={() => setLanguage("en")}
                  style={{ fontSize: "14px", fontWeight: 600 }}
                >
                  English (EN)
                </button>
                <button
                  type="button"
                  className={`touch-target-48 button ${language === "hi" ? "primary" : "secondary"}`}
                  onClick={() => setLanguage("hi")}
                  style={{ fontSize: "14px", fontWeight: 600 }}
                >
                  हिंदी (हिं)
                </button>
                <button
                  type="button"
                  className={`touch-target-48 button ${language === "mr" ? "primary" : "secondary"}`}
                  onClick={() => setLanguage("mr")}
                  style={{ fontSize: "14px", fontWeight: 600 }}
                >
                  मराठी (मरा)
                </button>
              </div>
            </div>

            {/* 2. Voice Help Audio Prompt Toggle (Target >= 48px) */}
            <div>
              <p className="eyebrow" style={{ marginBottom: "8px" }}>
                Voice & Audio Help
              </p>
              <button
                type="button"
                className="touch-target-48 button secondary"
                onClick={() => setVoiceHelp(!voiceHelp)}
                style={{
                  width: "100%",
                  justifyContent: "space-between",
                  background: voiceHelp ? "#eef2fe" : "#ffffff",
                  borderColor: voiceHelp ? "var(--blue)" : "var(--line)",
                  color: voiceHelp ? "var(--blue)" : "var(--ink)",
                  padding: "0 16px",
                  fontSize: "14px",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Icon name="speaker" size={18} />
                  <span>{voiceHelp ? t.common.voiceHelpActive : t.common.voiceHelp}</span>
                </span>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    padding: "3px 8px",
                    borderRadius: "6px",
                    background: voiceHelp ? "var(--blue)" : "#e2e8f0",
                    color: voiceHelp ? "#ffffff" : "var(--muted)",
                  }}
                >
                  {voiceHelp ? "ON" : "OFF"}
                </span>
              </button>
            </div>

            {/* 3. Role Switcher (All targets >= 48px) */}
            <div>
              <p className="eyebrow" style={{ marginBottom: "8px" }}>
                Switch Prototype Role
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "8px",
                  marginBottom: "8px",
                }}
              >
                {roles.map((r) => (
                  <button
                    key={r}
                    type="button"
                    className={`touch-target-48 button ${role === r ? "primary" : "secondary"}`}
                    onClick={() => {
                      setRole(r)
                      setMobileMenuOpen(false)
                    }}
                    style={{ fontSize: "13px", fontWeight: 600 }}
                  >
                    {roleLabels[r]}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="touch-target-48 button ghost"
                onClick={() => {
                  setMobileMenuOpen(false)
                  setCurrentScreen("role-select")
                }}
                style={{
                  width: "100%",
                  border: "1px dashed var(--line)",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--muted)",
                }}
              >
                Full Role Selector Screen &#x2194;
              </button>
            </div>

            {/* 4. Senior Citizen Assistance (Citizen only) */}
            {role === "citizen" && (
              <div>
                <p className="eyebrow" style={{ marginBottom: "8px" }}>
                  Senior Citizen Accessibility
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <button
                    type="button"
                    className={`touch-target-48 button ${seniorMode ? "primary" : "secondary"}`}
                    onClick={() => {
                      const next = !seniorMode
                      setSeniorMode(next)
                      if (next) setVoiceHelp(true)
                    }}
                    style={{ width: "100%", justifyContent: "center", fontSize: "14px" }}
                  >
                    <Icon name="user" size={16} />
                    <span>{seniorMode ? t.common.seniorModeOn : t.common.seniorMode}</span>
                  </button>

                  <button
                    type="button"
                    className="touch-target-48 button secondary"
                    onClick={() => {
                      setMobileMenuOpen(false)
                      openCallToBook()
                    }}
                    style={{
                      width: "100%",
                      justifyContent: "center",
                      borderColor: "var(--blue)",
                      color: "var(--blue)",
                      fontSize: "14px",
                    }}
                  >
                    <Icon name="phone" size={16} />
                    <span>{t.common.callToBook}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Profile Navigation Button */}
            <div style={{ paddingTop: "8px", borderTop: "1px solid var(--line)" }}>
              <button
                type="button"
                className="touch-target-48 button secondary"
                onClick={() => {
                  setMobileMenuOpen(false)
                  handleProfileClick()
                }}
                style={{ width: "100%", fontSize: "14px" }}
              >
                <span>View Profile & Settings</span>
                <Icon name="arrow" size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
