# HomeCare 360

HomeCare 360 is a municipal-grade, three-persona civic home service platform (Citizen, Technician, Admin) built with React 19, Vite 8, Tailwind CSS v4, and TypeScript. It features escrow-backed job protection, cryptographic digital skill passports, real-time negotiation, and assistive UX tailored for seniors and low-literacy trade workers.

---

## Multilingual & Accessibility (i18n)

HomeCare 360 includes a zero-dependency, type-safe internationalization system supporting **English (`en`)**, **Hindi (`hi`)**, and **Marathi (`mr`)**.

### Supported Languages
- **English (`en`)**: Default international fallback (`en-IN` voice locale).
- **Hindi (`hi`)**: Natural spoken everyday terminology (`hi-IN` voice locale).
- **Marathi (`mr`)**: Natural spoken everyday regional terminology (`mr-IN` voice locale).

### How to Add a New Language
1. **Extend Language Types**:
   Open `src/i18n/types.ts` and add your language code to the union type:
   ```ts
   export type SupportedLanguage = 'en' | 'hi' | 'mr' | 'gu' // e.g. Gujarati
   ```
2. **Create the Dictionary File**:
   Create `src/i18n/<lang_code>.ts` (e.g. `src/i18n/gu.ts`). Implement the strictly-typed `TranslationSchema`:
   ```ts
   import type { TranslationSchema } from './types'

   export const gu: TranslationSchema = {
     brand: { ... },
     roles: { ... },
     nav: { ... },
     common: { ... },
     services: { ... },
     citizen: { ... },
     senior: { ... },
     technician: { ... },
   }
   ```
   *Note: TypeScript will enforce that all keys are present at build time.*
3. **Register in `src/i18n/index.ts`**:
   Import your file, add it to `translations` dictionary, update `localeMap` (e.g. `gu: 'gu-IN'`), and register its label in the language switcher in `src/components/layout/Topbar.tsx`.

---

## Voice Input (Speech-to-Text)

Voice input allows low-literacy technicians and citizens to speak their request or quote amounts without typing.

### `useSpeechInput` Hook (`src/hooks/useSpeechInput.ts`)
- **Native Browser Engine**: Built directly on `window.SpeechRecognition` / `window.webkitSpeechRecognition`. Zero paid external APIs.
- **Locale Mapping**: Automatically configures the recognition engine based on the active language (`en` -> `en-IN`, `hi` -> `hi-IN`, `mr` -> `mr-IN`).
- **State Management**:
  ```ts
  const { supported, listening, transcript, interimTranscript, error, start, stop, reset } = useSpeechInput({
    language: 'hi',
    onResult: (text) => console.log('Transcribed:', text),
  })
  ```
- **Safety & Privacy**: Voice audio is streamed directly to the browser's native speech service. No audio is recorded or stored on any server.
- **Microphone Component**: `src/components/voice/MicButton.tsx` renders a 58px+ circular button with pulsing ring animation (respects `prefers-reduced-motion`) and clear listening feedback.

### Voice Keyword Service Detection (`src/utils/detectService.ts`)
- Scans spoken phrases in English, Hindi, and Marathi (both Devanagari and Romanized phonetic words) to pre-select appropriate services (e.g., "nal se paani leak" -> Plumbing; "bijli fuse" -> Electrical; "safai jhadu" -> Deep Cleaning).
- Always displays an explicit confirmation banner: *"We understood: Plumbing. Is that right?"* with `[Yes]` and `[Change]` actions.

### Voice Rate Parser (`src/utils/parseSpokenAmount.ts`)
- Understands spoken numerals, English words ("three hundred"), and Hindi/Marathi currency phrases ("teen sau", "saadhe char sau", "dhai sau", "दीडशे", "पाचशे", etc.).
- **Strict Confirmation Safety**: Spoken prices are **never** auto-submitted. The app displays an explicit confirmation dialog: *"₹300, correct?"* requiring technician tap confirmation before setting the quote.

---

## Voice Output (Read-Aloud / Text-to-Speech)

Voice output ensures seniors and low-literacy trade workers can listen to job details, alerts, and instructions.

### `useSpeak` Hook (`src/hooks/useSpeak.ts`)
- Built on `window.speechSynthesis`.
- **Locale Voice Discovery & Fallback**: Searches for local or network voices matching `mr-IN`, `hi-IN`, or `en-IN`. If Marathi voice is not installed on the user's OS, it automatically falls back to Hindi, then English, ensuring the app never crashes.
- **Global Voice Help Toggle**: An audio toggle in `Topbar.tsx` enables or disables automatic spoken prompts on screen entry (enabled by default for Senior and Technician modes).
- **Reusable Component**: `src/components/voice/SpeakButton.tsx` provides single-tap playback with visual animated playing indicators.

---

## Browser Support & Graceful Degradation

| Browser / OS | Speech Recognition (Mic) | Speech Synthesis (Speaker) | Fallback Experience |
|:---|:---:|:---:|:---|
| **Android Chrome** (Primary target) | ✅ Full Support (`en-IN`, `hi-IN`, `mr-IN`) | ✅ Full Support | Native speech dialog & Google TTS voices |
| **Desktop Chrome / Edge** | ✅ Full Support | ✅ Full Support | Full voice input and voice output |
| **Mobile Safari (iOS)** | ⚠️ WebKit SpeechRecognition requires iOS 14.5+ | ✅ Full Support (Siri voices) | If denied/unsupported, Mic button hides gracefully; standard typing remains available |
| **Desktop Firefox** | ❌ SpeechRecognition disabled by default | ✅ Full Support | Typing input active; spoken read-aloud works |

*If microphone permission is denied or unsupported, a helpful banner appears directing the user to type manually without breaking any application features.*

---

## How to Test on an Android Phone

1. **Deploy or Preview**:
   - Access the Netlify deployment URL or local Wi-Fi preview (`http://<YOUR_LOCAL_IP>:8443`).
2. **Switch Language**:
   - Tap **"हिं"** or **"मरा"** in the top navigation bar. Observe the interface updating smoothly into Hindi or Marathi.
3. **Test Voice Request (Citizen)**:
   - Go to **Request Service**.
   - Tap the large orange microphone button.
   - Say: *"Nal se paani tapak raha hai"* (or in Marathi: *"Nalala paani galat ahe"*).
   - Observe the text appearing in the problem description, and the blue badge confirming: *"We understood: Plumbing. Is that right?"*.
4. **Test Technician Spoken Rate Setting**:
   - Switch role to **Technician (Ravi Verma)** via the top role switcher.
   - View an incoming request in **New Requests**.
   - Tap the microphone button next to the bid amount.
   - Say: *"Teen sau rupaye"* or *"350"*.
   - Confirm the parsed modal: *"₹300, correct?"* -> Tap **Confirm Rate**.
5. **Test Voice Read-Aloud**:
   - Tap the speaker icon next to any incoming job, offer, or invoice to hear the prompt read aloud in the selected language.
