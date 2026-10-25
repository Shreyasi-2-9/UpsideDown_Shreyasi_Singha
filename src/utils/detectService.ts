export interface DetectedServiceResult {
  code: string
  confidence: number
  matchedKeyword?: string
}

interface ServicePattern {
  code: string
  keywords: string[]
}

const SERVICE_PATTERNS: ServicePattern[] = [
  {
    code: "SRV-01", // Plumbing
    keywords: [
      "pipe",
      "leak",
      "leaking",
      "leakage",
      "tap",
      "water",
      "drain",
      "sink",
      "tank",
      "flush",
      "plumber",
      "overflow",
      "नल",
      "पाणी",
      "पानी",
      "पाईप",
      "पाइप",
      "गळती",
      "लीक",
      "लीकेज",
      "प्लंबर",
      "टोंटी",
      "नाली",
      "टांकी",
      "nal",
      "paani",
      "pani",
      "gaalti",
      "tooti",
      "nali",
      "tanki",
    ],
  },
  {
    code: "SRV-02", // Electrical
    keywords: [
      "electric",
      "electricity",
      "light",
      "fan",
      "switch",
      "socket",
      "wiring",
      "wire",
      "mcb",
      "fuse",
      "spark",
      "short circuit",
      "current",
      "bulb",
      "बिजली",
      "लाईट",
      "लाइट",
      "पंखा",
      "वीज",
      "करंट",
      "वायर",
      "स्विच",
      "सॉकेट",
      "शॉर्ट",
      "फ्यूज",
      "इलेक्ट्रिशियन",
      "bijli",
      "pankha",
      "veej",
      "viju",
      "chalu",
      "short",
    ],
  },
  {
    code: "SRV-03", // Cleaning
    keywords: [
      "clean",
      "cleaning",
      "wash",
      "sweeping",
      "mopping",
      "bathroom",
      "kitchen",
      "sofa",
      "deep clean",
      "dust",
      "broom",
      "सफाई",
      "साफ",
      "झाडू",
      "पोछा",
      "धुलाई",
      "स्वच्छता",
      "धुणे",
      "किचन सफाई",
      "बाथरूम",
      "safai",
      "jhadu",
      "pocha",
      "jhadhoo",
      "dhulai",
      "swachhta",
    ],
  },
  {
    code: "SRV-04", // Painting
    keywords: [
      "paint",
      "painting",
      "painter",
      "wall",
      "colour",
      "color",
      "whitewash",
      "waterproof",
      "touchup",
      "रंग",
      "रंगाई",
      "रंगकाम",
      "पुताई",
      "भिंत",
      "दीवार",
      "पेंट",
      "पेंटिंग",
      "rang",
      "putai",
      "deewar",
      "bheent",
      "safedi",
    ],
  },
  {
    code: "SRV-05", // Carpentry
    keywords: [
      "carpenter",
      "carpentry",
      "wood",
      "door",
      "lock",
      "furniture",
      "cabinet",
      "hinge",
      "table",
      "chair",
      "cupboard",
      "बढ़ई",
      "सुतार",
      "लकड़ी",
      "दरवाजा",
      "ताला",
      "फर्निचर",
      "कपाट",
      "कुलूप",
      "कब्जा",
      "badhai",
      "sutar",
      "lakdi",
      "darwaza",
      "tala",
      "kulup",
      "lakud",
    ],
  },
  {
    code: "SRV-06", // AC Repair
    keywords: [
      "ac",
      "air conditioner",
      "cooling",
      "cold",
      "gas",
      "compressor",
      "split ac",
      "filter",
      "servicing",
      "एसी",
      "कूलिंग",
      "ठंडा",
      "गॅस",
      "गैस",
      "गारवा",
      "कंप्रेसर",
      "thanda",
      "garwa",
      "cool",
    ],
  },
  {
    code: "SRV-07", // Pest Control
    keywords: [
      "pest",
      "cockroach",
      "termite",
      "bedbug",
      "ant",
      "mosquito",
      "insect",
      "bugs",
      "कीड़े",
      "दीमक",
      "खटमल",
      "कॉकरोच",
      "चींटी",
      "कीटक",
      "वाळवी",
      "झुरळ",
      "ढेकूण",
      "मुंग्या",
      "deemak",
      "khatmal",
      "valvi",
      "zhural",
      "jhurad",
      "keede",
    ],
  },
  {
    code: "SRV-08", // Appliance Repair
    keywords: [
      "appliance",
      "fridge",
      "refrigerator",
      "washing machine",
      "microwave",
      "oven",
      "geyser",
      "purifier",
      "ro purifier",
      "फ्रिज",
      "वाशिंग मशीन",
      "मायक्रोवेव्ह",
      "गीझर",
      "प्यूरीफायर",
      "वॉटर फिल्टर",
      "उपकरण",
      "geyser",
      "gizur",
    ],
  },
]

export function detectService(text: string): DetectedServiceResult | null {
  if (!text || !text.trim()) return null

  const normalized = text.toLowerCase()

  let bestMatch: DetectedServiceResult | null = null
  let maxScore = 0

  for (const pattern of SERVICE_PATTERNS) {
    let score = 0
    let matchedKeyword: string | undefined

    for (const kw of pattern.keywords) {
      const kwLower = kw.toLowerCase()
      // Full word boundary match or inclusion
      const regex = new RegExp(`(^|[\\s,.])${kwLower}([\\s,.]|$)`, "i")
      if (regex.test(normalized)) {
        score += 3
        if (!matchedKeyword) matchedKeyword = kw
      } else if (normalized.includes(kwLower) && kwLower.length >= 3) {
        score += 1
        if (!matchedKeyword) matchedKeyword = kw
      }
    }

    if (score > maxScore) {
      maxScore = score
      bestMatch = {
        code: pattern.code,
        confidence: score,
        matchedKeyword,
      }
    }
  }

  return maxScore > 0 ? bestMatch : null
}
