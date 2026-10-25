import { useEffect, useRef } from "react"
import { Icon } from "../common/Icon"
import { useSpeak } from "../../hooks/useSpeak"
import { useApp } from "../../context/AppContext"
import type { SupportedLanguage } from "../../i18n/types"

const playedAutoKeys = new Set<string>()

export interface SpeakButtonProps {
  text: string
  lang?: SupportedLanguage
  label?: string
  iconOnly?: boolean
  className?: string
  size?: number
  autoPlayKey?: string
}

export function SpeakButton({
  text,
  lang,
  label,
  iconOnly = false,
  className = "",
  size = 14,
  autoPlayKey,
}: SpeakButtonProps) {
  const { language: appLang, voiceHelp } = useApp()
  const effectiveLang = lang || appLang || "en"
  const { speak, stop, speaking, supported } = useSpeak(effectiveLang)
  const hasAutoPlayedRef = useRef(false)

  useEffect(() => {
    if (
      autoPlayKey &&
      voiceHelp &&
      !hasAutoPlayedRef.current &&
      !playedAutoKeys.has(autoPlayKey) &&
      text
    ) {
      hasAutoPlayedRef.current = true
      playedAutoKeys.add(autoPlayKey)
      const timer = setTimeout(() => {
        speak(text, effectiveLang)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [autoPlayKey, voiceHelp, text, effectiveLang, speak])

  if (!supported) return null

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (speaking) {
      stop()
    } else {
      speak(text, effectiveLang)
    }
  }

  const defaultLabel = speaking ? "Stop audio" : "Listen"

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`speak-btn ${speaking ? "active" : ""} ${
        iconOnly ? "icon-only" : ""
      } ${className}`}
      title={label || defaultLabel}
      aria-label={label || defaultLabel}
    >
      <Icon name="speaker" size={size} />
      {!iconOnly && <span>{label || defaultLabel}</span>}
    </button>
  )
}
