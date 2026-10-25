import { useEffect } from "react"
import { Icon } from "../common/Icon"
import { useSpeechInput } from "../../hooks/useSpeechInput"
import type { SupportedLanguage } from "../../i18n/types"
import { getTranslations } from "../../i18n"

interface MicButtonProps {
  lang: SupportedLanguage
  onTranscript: (text: string) => void
  label?: string
  className?: string
  compact?: boolean
  showPrivacyTip?: boolean
}

export function MicButton({
  lang,
  onTranscript,
  label,
  className = "",
  compact = false,
  showPrivacyTip = false,
}: MicButtonProps) {
  const t = getTranslations(lang)
  const {
    supported,
    listening,
    transcript,
    interimTranscript,
    error,
    start,
    stop,
    reset,
  } = useSpeechInput(lang)

  // Deliver new transcript to parent callback whenever it updates
  useEffect(() => {
    if (transcript) {
      onTranscript(transcript)
    }
  }, [transcript, onTranscript])

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (listening) {
      stop()
    } else {
      reset()
      start()
    }
  }

  const defaultLabel = listening ? t.common.tapToStop : t.common.tapToSpeak

  if (!supported) {
    return (
      <div className={`mic-btn-container ${className}`}>
        <button
          type="button"
          disabled
          className={`mic-btn ${compact ? "compact" : ""}`}
          style={{
            opacity: 0.5,
            cursor: "not-allowed",
            background: "var(--muted)",
            borderColor: "var(--muted)",
          }}
          title={t.common.speechUnsupported}
          aria-label={t.common.speechUnsupported}
        >
          <Icon name="mic" size={compact ? 18 : 24} />
        </button>
        <span style={{ fontSize: "11px", color: "var(--muted)" }}>
          {t.common.speechUnsupported}
        </span>
      </div>
    )
  }

  return (
    <div className={`mic-btn-container ${className}`}>
      <div style={{ position: "relative", display: "inline-flex" }}>
        {listening && <div className="mic-pulsing-ring" aria-hidden="true" />}
        <button
          type="button"
          onClick={handleClick}
          className={`mic-btn ${listening ? "listening" : ""} ${
            compact ? "compact" : ""
          }`}
          aria-label={listening ? t.common.tapToStop : label || defaultLabel}
          aria-pressed={listening}
          title={listening ? t.common.tapToStop : label || defaultLabel}
        >
          <Icon name="mic" size={compact ? 18 : 24} />
        </button>
      </div>

      <span className="mic-label">
        {listening ? t.common.listening : label || defaultLabel}
      </span>

      {/* Interim live preview text */}
      {interimTranscript && (
        <span
          style={{
            fontSize: "11px",
            color: "var(--blue)",
            fontStyle: "italic",
            maxWidth: "240px",
            textAlign: "center",
          }}
        >
          "{interimTranscript}"
        </span>
      )}

      {/* Error messages if any */}
      {error && (
        <span
          style={{
            fontSize: "11px",
            color: "var(--red)",
            fontWeight: 600,
            maxWidth: "260px",
            textAlign: "center",
            marginTop: "2px",
          }}
        >
          {error === "mic_denied" && t.common.micDenied}
          {error === "no_speech" && t.common.noSpeech}
          {error === "network_error" && t.common.networkError}
          {error === "other" && t.common.speechUnsupported}
        </span>
      )}

      {/* Privacy note */}
      {showPrivacyTip && (
        <small
          style={{
            fontSize: "11px",
            color: "var(--muted)",
            maxWidth: "280px",
            textAlign: "center",
            marginTop: "2px",
          }}
        >
          {t.common.voicePrivacy}
        </small>
      )}
    </div>
  )
}
