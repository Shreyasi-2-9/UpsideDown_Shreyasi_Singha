import { useState, useEffect, useRef } from "react"
import { BrandLogo } from "../common/BrandLogo"
import { useApp } from "../../context/AppContext"

interface SplashScreenProps {
  onFinish: () => void
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const { language, setLanguage } = useApp()
  const [isFadingOut, setIsFadingOut] = useState(false)
  const finishedRef = useRef(false)

  const handleFinish = () => {
    if (finishedRef.current) return
    finishedRef.current = true
    setIsFadingOut(true)
    setTimeout(() => {
      onFinish()
    }, 280)
  }

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches

    if (prefersReducedMotion) {
      const timer = setTimeout(() => {
        handleFinish()
      }, 800)
      return () => clearTimeout(timer)
    }

    const timer = setTimeout(() => {
      handleFinish()
    }, 2700)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      onClick={handleFinish}
      role="button"
      tabIndex={0}
      aria-label="Skip splash screen"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleFinish()
        }
      }}
      className={`fixed inset-0 z-[9999] flex flex-col justify-between items-center select-none cursor-pointer overflow-hidden transition-opacity duration-300 ${
        isFadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{
        minHeight: "100dvh",
        height: "100dvh",
        background:
          "radial-gradient(ellipse 90% 65% at 50% 36%, #ffffff 0%, var(--bg, #f5f3ee) 65%, #ece8df 100%)",
        color: "var(--ink, #252429)",
        paddingTop: "max(28px, env(safe-area-inset-top, 28px))",
        paddingBottom: "max(28px, env(safe-area-inset-bottom, 28px))",
      }}
    >
      {/* Subtle brand warm ambient halo */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] rounded-full pointer-events-none blur-[90px] opacity-30"
        style={{
          background:
            "radial-gradient(circle, rgba(49, 92, 245, 0.25) 0%, rgba(220, 229, 255, 0.15) 60%, transparent 100%)",
        }}
      />

      {/* Top action row with Language Switcher and Skip */}
      <div className="w-full flex justify-between items-center px-6 relative z-20">
        <div
          className="lang-switch"
          onClick={(e) => e.stopPropagation()}
          role="group"
          aria-label="Language selection"
        >
          <button
            type="button"
            className={`lang-btn ${language === "en" ? "selected" : ""}`}
            onClick={() => setLanguage("en")}
          >
            EN
          </button>
          <button
            type="button"
            className={`lang-btn ${language === "hi" ? "selected" : ""}`}
            onClick={() => setLanguage("hi")}
          >
            हिं
          </button>
          <button
            type="button"
            className={`lang-btn ${language === "mr" ? "selected" : ""}`}
            onClick={() => setLanguage("mr")}
          >
            मरा
          </button>
        </div>

        <span
          style={{
            color: "var(--muted, #777a82)",
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {language === "hi"
            ? "छोड़ें"
            : language === "mr"
              ? "पुढे जा"
              : "Tap to skip"}
        </span>
      </div>

      {/* Central Brand Identity */}
      <div className="flex flex-col items-center text-center px-6 relative z-10">
        {/* Animated Logo Container */}
        <div className="relative mb-6 flex items-center justify-center">
          {/* Pulsing Aura Ring */}
          <div
            className="absolute inset-[-14px] rounded-[54px] pointer-events-none splash-animated"
            style={{
              border: "2px solid rgba(49, 92, 245, 0.22)",
              animation:
                "splash-pulse-ring 2.2s cubic-bezier(0.2, 0.8, 0.2, 1) 0.5s infinite",
            }}
          />

          {/* Logo with Soft Spring Scale & Fade */}
          <div
            className="splash-animated relative z-10"
            style={{
              animation:
                "splash-logo-enter 0.75s cubic-bezier(0.16, 1, 0.3, 1) forwards",
            }}
          >
            <BrandLogo size={100} variant="blue" />
          </div>
        </div>

        {/* App Title */}
        <div
          className="splash-animated"
          style={{
            animation:
              "splash-fade-up 0.65s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both",
          }}
        >
          <h1
            className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2 flex items-center justify-center gap-1.5"
            style={{
              fontFamily: "Manrope, sans-serif",
              letterSpacing: "-0.035em",
              color: "var(--ink, #252429)",
            }}
          >
            <span>HOMECARE</span>
            <span style={{ color: "var(--blue, #315cf5)" }}>360</span>
          </h1>
        </div>

        {/* Tagline */}
        <div
          className="splash-animated max-w-[280px] sm:max-w-sm"
          style={{
            animation:
              "splash-fade-up 0.65s cubic-bezier(0.16, 1, 0.3, 1) 0.65s both",
          }}
        >
          <p
            style={{
              color: "var(--muted, #777a82)",
              fontSize: "14px",
              fontWeight: 500,
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            Trusted help, right in your neighbourhood
          </p>
        </div>
      </div>

      {/* Bottom Loading Dots & Civic Badge */}
      <div className="flex flex-col items-center gap-3 relative z-10 pb-2">
        {/* Three Animated Bouncing Dots matching theme blue */}
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full splash-animated"
            style={{
              background: "var(--blue, #315cf5)",
              animation: "splash-dot-bounce 1.2s infinite ease-in-out",
            }}
          />
          <span
            className="w-2.5 h-2.5 rounded-full splash-animated"
            style={{
              background: "rgba(49, 92, 245, 0.6)",
              animation: "splash-dot-bounce 1.2s infinite ease-in-out 0.2s",
            }}
          />
          <span
            className="w-2.5 h-2.5 rounded-full splash-animated"
            style={{
              background: "rgba(49, 92, 245, 0.3)",
              animation: "splash-dot-bounce 1.2s infinite ease-in-out 0.4s",
            }}
          />
        </div>

        {/* Civic Trust Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--muted, #4b5262)",
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "var(--green, #32b768)",
            }}
          />
          <span>Municipal Verified Network</span>
        </div>
      </div>
    </div>
  )
}
