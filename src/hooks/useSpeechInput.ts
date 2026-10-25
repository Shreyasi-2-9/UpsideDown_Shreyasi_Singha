import { useState, useEffect, useRef, useCallback } from "react"
import type { SupportedLanguage } from "../i18n/types"
import { localeMap } from "../i18n"

export interface UseSpeechInputReturn {
  supported: boolean
  listening: boolean
  transcript: string
  interimTranscript: string
  error: "mic_denied" | "no_speech" | "network_error" | "other" | null
  start: () => void
  stop: () => void
  reset: () => void
}

export function useSpeechInput(
  lang: SupportedLanguage = "en",
): UseSpeechInputReturn {
  const [supported, setSupported] = useState(false)
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [interimTranscript, setInterimTranscript] = useState("")
  const [error, setError] =
    useState<"mic_denied" | "no_speech" | "network_error" | "other" | null>(
      null,
    )

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const silenceTimerRef = useRef<number | null>(null)

  // Check browser support
  useEffect(() => {
    const SpeechRecognitionCtor =
      window.SpeechRecognition || window.webkitSpeechRecognition
    setSupported(Boolean(SpeechRecognitionCtor))
  }, [])

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      window.clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = null
    }
  }, [])

  const stop = useCallback(() => {
    clearSilenceTimer()
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch {
        // ignore already stopped
      }
    }
    setListening(false)
  }, [clearSilenceTimer])

  const reset = useCallback(() => {
    stop()
    setTranscript("")
    setInterimTranscript("")
    setError(null)
  }, [stop])

  const start = useCallback(() => {
    setError(null)
    setInterimTranscript("")

    const SpeechRecognitionCtor =
      window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognitionCtor) {
      setSupported(false)
      setError("other")
      return
    }

    // Stop existing instance if any
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort()
      } catch {
        // ignore
      }
    }

    try {
      const recognition = new SpeechRecognitionCtor()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = localeMap[lang] || "en-IN"
      recognition.maxAlternatives = 1

      recognition.onstart = () => {
        setListening(true)
        setError(null)
        // Reset silence timeout on start (stops after 8 seconds of silence)
        clearSilenceTimer()
        silenceTimerRef.current = window.setTimeout(() => {
          stop()
        }, 8000)
      }

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        clearSilenceTimer()
        // Reset 5s silence timeout on voice activity
        silenceTimerRef.current = window.setTimeout(() => {
          stop()
        }, 5000)

        let finalPart = ""
        let interimPart = ""

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          if (result.isFinal) {
            finalPart += result[0].transcript
          } else {
            interimPart += result[0].transcript
          }
        }

        if (finalPart) {
          setTranscript((prev) =>
            prev ? `${prev} ${finalPart.trim()}` : finalPart.trim(),
          )
        }
        setInterimTranscript(interimPart)
      }

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        clearSilenceTimer()
        setListening(false)

        if (
          event.error === "not-allowed" ||
          event.error === "service-not-allowed"
        ) {
          setError("mic_denied")
        } else if (event.error === "no-speech") {
          setError("no_speech")
        } else if (event.error === "network") {
          setError("network_error")
        } else if (event.error !== "aborted") {
          setError("other")
        }
      }

      recognition.onend = () => {
        clearSilenceTimer()
        setListening(false)
      }

      recognitionRef.current = recognition
      recognition.start()
    } catch {
      setListening(false)
      setError("other")
    }
  }, [lang, clearSilenceTimer, stop])

  // Cleanup on unmount or language change
  useEffect(() => {
    return () => {
      clearSilenceTimer()
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch {
          // ignore
        }
      }
    }
  }, [clearSilenceTimer, lang])

  return {
    supported,
    listening,
    transcript,
    interimTranscript,
    error,
    start,
    stop,
    reset,
  }
}
