import { BrandLogo } from "../common/BrandLogo"
import { Icon } from "../common/Icon"
import { useApp } from "../../context/AppContext"
import type { Role } from "../../types"

interface RoleSelectScreenProps {
  onSelectRole: (role: Role) => void
}

export function RoleSelectScreen({ onSelectRole }: RoleSelectScreenProps) {
  const { language, setLanguage, voiceHelp, setVoiceHelp, t } = useApp()

  const roleOptions: {
    role: Role
    title: string
    subtitle: string
    desc: string
    icon: "home" | "wrench" | "shield"
    badge: string
    tone: string
    actionText: string
  }[] = [
    {
      role: "citizen",
      title: t.roles.citizen,
      subtitle:
        language === "hi"
          ? "नागरिक व वरिष्ठ नागरिक"
          : language === "mr"
            ? "नागरिक व ज्येष्ठ नागरिक"
            : "Resident & Senior Citizens",
      desc:
        language === "hi"
          ? "सत्यापित प्लंबर, इलेक्ट्रीशियन खोजें, लाइव ट्रैकिंग और सुरक्षित एस्क्रो पेमेंट।"
          : language === "mr"
            ? "खात्रीशीर प्लंबर, इलेक्ट्रिशियन मिळवा, थेट ट्रॅकिंग आणि सुरक्षित एस्क्रो पेमेंट."
            : "Book verified repairs, track technician ETA in real-time, and hold payment in municipal escrow.",
      icon: "home",
      badge:
        language === "hi"
          ? "नागरिक सेवा"
          : language === "mr"
            ? "नागरिक सेवा"
            : "Resident Portal",
      tone: "#244be8",
      actionText:
        language === "hi"
          ? "नागरिक के रूप में प्रवेश करें"
          : language === "mr"
            ? "नागरिक म्हणून प्रवेश करा"
            : "Continue as Citizen",
    },
    {
      role: "technician",
      title: t.roles.technician,
      subtitle:
        language === "hi"
          ? "प्रमाणित कारीगर (रवि वर्मा)"
          : language === "mr"
            ? "प्रमाणित कारागीर (रवी वर्मा)"
            : "Verified Tradesperson (Ravi Verma)",
      desc:
        language === "hi"
          ? "आस-पास के काम स्वीकारें, बोलकर अपनी दर तय करें, डिजिटल स्किल पासपोर्ट।"
          : language === "mr"
            ? "जवळचे काम स्वीकारा, आवाजाने दर ठरवा, डिजिटल कौशल्य पासपोर्ट."
            : "Claim nearby requests, set rates with voice input, display your municipal skill passport, and get paid instantly.",
      icon: "wrench",
      badge:
        language === "hi"
          ? "कारीगर पोर्टल"
          : language === "mr"
            ? "कारागीर पोर्टल"
            : "Technician Desk",
      tone: "#0f766e",
      actionText:
        language === "hi"
          ? "कारीगर के रूप में प्रवेश करें"
          : language === "mr"
            ? "कारागीर म्हणून प्रवेश करा"
            : "Continue as Technician",
    },
    {
      role: "admin",
      title: t.roles.admin,
      subtitle:
        language === "hi"
          ? "नगर निगम नियंत्रण कक्ष"
          : language === "mr"
            ? "महानगरपालिका नियंत्रण कक्ष"
            : "Civic Operations & SOS Desk",
      desc:
        language === "hi"
          ? "सभी चालू काम, कारीगर सत्यापन, आपातकालीन SOS अलर्ट और एस्क्रो ऑडिट की निगरानी।"
          : language === "mr"
            ? "सर्व चालू कामे, कारागीर पडताळणी, आपत्कालीन SOS अलर्ट आणि एस्क्रो ऑडिट नियंत्रण."
            : "Supervise citywide job dispatch, verify artisan credentials, inspect escrow settlements, and monitor SOS beacons.",
      icon: "shield",
      badge:
        language === "hi"
          ? "प्रशासन"
          : language === "mr"
            ? "प्रशासन"
            : "Operations Desk",
      tone: "#7c3aed",
      actionText:
        language === "hi"
          ? "प्रशासक के रूप में प्रवेश करें"
          : language === "mr"
            ? "प्रशासक म्हणून प्रवेश करा"
            : "Continue as Supervisor",
    },
  ]

  return (
    <div
      className="min-h-[100dvh] flex flex-col justify-between items-center px-4 py-6 select-none"
      style={{
        background:
          "radial-gradient(ellipse 90% 65% at 50% 15%, #ffffff 0%, var(--bg, #f5f3ee) 65%, #ece8df 100%)",
        color: "var(--ink, #252429)",
        paddingTop: "max(20px, env(safe-area-inset-top, 20px))",
        paddingBottom: "max(24px, env(safe-area-inset-bottom, 24px))",
      }}
    >
      {/* Top Bar with Brand & Language Switcher */}
      <div className="w-full max-w-md flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <BrandLogo size={28} />
          <span className="font-bold text-sm tracking-tight text-neutral-800">
            HOMECARE <span className="text-blue-600 font-extrabold">360</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <div
            className="lang-switch"
            role="group"
            aria-label="Select language"
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

          {/* Voice Help Audio Toggle */}
          <button
            type="button"
            className="icon-button"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "999px",
              background: voiceHelp ? "#eef2fe" : "#ffffff",
              color: voiceHelp ? "var(--blue)" : "var(--muted)",
              border: voiceHelp
                ? "1px solid var(--blue)"
                : "1px solid var(--line)",
            }}
            onClick={() => setVoiceHelp(!voiceHelp)}
            title={voiceHelp ? t.common.voiceHelpActive : t.common.voiceHelp}
            aria-label={
              voiceHelp ? t.common.voiceHelpActive : t.common.voiceHelp
            }
            aria-pressed={voiceHelp}
          >
            <Icon name="speaker" size={15} />
          </button>
        </div>
      </div>

      {/* Main Container */}
      <main className="w-full max-w-md flex flex-col flex-1 justify-center py-2">
        <div className="text-center mb-5">
          <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 mb-1">
            {language === "hi"
              ? "अपनी भूमिका चुनें"
              : language === "mr"
                ? "आपली भूमिका निवडा"
                : "Choose Your Role"}
          </h1>
          <p className="text-xs text-neutral-500 font-medium">
            {language === "hi"
              ? "एक टैप से शुरू करें — किसी पासवर्ड की आवश्यकता नहीं"
              : language === "mr"
                ? "एका टॅपने सुरू करा — पासवर्डची आवश्यकता नाही"
                : "One-tap direct entry · No password needed"}
          </p>
        </div>

        {/* 3 One-Tap Role Cards */}
        <div className="grid gap-3">
          {roleOptions.map((opt) => (
            <button
              key={opt.role}
              type="button"
              onClick={() => onSelectRole(opt.role)}
              className="w-full text-left bg-white rounded-2xl p-4 border border-neutral-200/80 shadow-sm hover:shadow-md hover:border-blue-400 active:scale-[0.985] transition-all duration-150 flex flex-col gap-2 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ minHeight: "92px" }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm transition-transform group-hover:scale-105"
                    style={{ backgroundColor: opt.tone }}
                  >
                    <Icon name={opt.icon} size={20} />
                  </div>
                  <div>
                    <h2 className="font-bold text-base text-neutral-900 leading-tight">
                      {opt.title}
                    </h2>
                    <span className="text-[11px] font-semibold text-neutral-500">
                      {opt.subtitle}
                    </span>
                  </div>
                </div>
                <span
                  className="text-[11px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${opt.tone}15`,
                    color: opt.tone,
                  }}
                >
                  {opt.badge}
                </span>
              </div>

              <p className="text-xs text-neutral-600 line-clamp-2 mt-1">
                {opt.desc}
              </p>

              <div className="flex items-center justify-between text-xs font-semibold pt-2 border-t border-neutral-100 text-neutral-700 group-hover:text-blue-600">
                <span>{opt.actionText}</span>
                <span className="text-lg leading-none transition-transform group-hover:translate-x-1">
                  &rarr;
                </span>
              </div>
            </button>
          ))}
        </div>
      </main>

      {/* Municipal Assurance Footer */}
      <footer className="w-full max-w-md text-center pt-3 text-[11px] text-neutral-400 flex items-center justify-center gap-1.5">
        <Icon name="shield" size={13} />
        <span>
          {language === "hi"
            ? "ग्रेटर मुंबई नगर निगम द्वारा प्रमाणित नागरिक मंच"
            : language === "mr"
              ? "बृहन्मुंबई महानगरपालिका प्रमाणित नागरिक सेवा"
              : "Greater Mumbai Civic Service Platform · Escrow Protected"}
        </span>
      </footer>
    </div>
  )
}
