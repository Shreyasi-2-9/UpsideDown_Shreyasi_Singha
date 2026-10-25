import { useState, useEffect, useCallback, useRef } from "react"
import type { SupportedLanguage } from "../i18n/types"
import { localeMap } from "../i18n"

export interface UseSpeakReturn {
  speak: (text: string, overrideLang?: SupportedLanguage) => void
  stop: () => void
  speaking: boolean
  supported: boolean
}

export function useSpeak(lang: SupportedLanguage = "en"): UseSpeakReturn {
  const [supported, setSupported] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const voicesRef = useRef<SpeechSynthesisVoice[]>([])

  const updateVoices = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      voicesRef.current = window.speechSynthesis.getVoices()
    }
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setSupported(true)
      updateVoices()
      window.speechSynthesis.onvoiceschanged = updateVoices
    }
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [updateVoices])

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
    }
  }, [])

  const findBestVoice = useCallback(
    (targetLang: SupportedLanguage): SpeechSynthesisVoice | null => {
      const voices = voicesRef.current
      if (!voices || voices.length === 0) return null

      // Target locale hierarchy: e.g. for mr -> mr-IN -> hi-IN -> en-IN
      const preferredLocales: string[] = []
      if (targetLang === "mr") {
        preferredLocales.push(
          "mr-IN",
          "mr_IN",
          "mr",
          "hi-IN",
          "hi_IN",
          "hi",
          "en-IN",
          "en",
        )
      } else if (targetLang === "hi") {
        preferredLocales.push("hi-IN", "hi_IN", "hi", "en-IN", "en")
      } else {
        preferredLocales.push("en-IN", "en_IN", "en-GB", "en-US", "en")
      }

      for (const loc of preferredLocales) {
        const match = voices.find((v) =>
          v.lang
            .toLowerCase()
            .replace("_", "-")
            .startsWith(loc.toLowerCase().replace("_", "-")),
        )
        if (match) return match
      }

      return voices[0] || null
    },
    [],
  )

  const speak = useCallback(
    (text: string, overrideLang?: SupportedLanguage) => {
      if (
        !text ||
        typeof window === "undefined" ||
        !("speechSynthesis" in window)
      )
        return

      const activeLanguage = overrideLang || lang

      try {
        // Cancel any currently playing speech
        window.speechSynthesis.cancel()

        const utterance = new SpeechSynthesisUtterance(text)
        const targetLocale = localeMap[activeLanguage] || "en-IN"
        utterance.lang = targetLocale

        const voice = findBestVoice(activeLanguage)
        if (voice) {
          utterance.voice = voice
        }

        utterance.rate = 0.95 // slightly slower for better clarity for seniors and low-literacy users
        utterance.pitch = 1.0

        utterance.onstart = () => setSpeaking(true)
        utterance.onend = () => setSpeaking(false)
        utterance.onerror = () => setSpeaking(false)

        window.speechSynthesis.speak(utterance)
      } catch {
        setSpeaking(false)
      }
    },
    [lang, findBestVoice],
  )

  return {
    speak,
    stop,
    speaking,
    supported,
  }
}
