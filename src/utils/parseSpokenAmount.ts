/**
 * Parses spoken currency amounts from voice transcripts in English, Hindi, and Marathi.
 * Handles digits, Devanagari numerals, English words, and Hindi/Marathi spoken numerals.
 */

const DEVANAGARI_DIGITS: Record<string, string> = {
  "०": "0",
  "१": "1",
  "२": "2",
  "३": "3",
  "४": "4",
  "५": "5",
  "६": "6",
  "७": "7",
  "८": "8",
  "९": "9",
}

// Special fractional hundred terms in Hindi & Marathi
const SPECIAL_COMBINATIONS: Record<string, number> = {
  "dedh sau": 150,
  dedhsau: 150,
  दीडशे: 150,
  "डेढ़ सौ": 150,
  "डेढ सौ": 150,

  "dhai sau": 250,
  dhaisau: 250,
  अडीचशे: 250,
  "ढाई सौ": 250,

  "sawa do sau": 225,
  सव्वादोनशे: 225,
  "सवा दो सौ": 225,

  "paune teen sau": 275,
  पावणेतीनशे: 275,
  "पौने तीन सौ": 275,

  "sawa teen sau": 325,
  सव्वातीनशे: 325,
  "सवा तीन सौ": 325,

  "saadhe teen sau": 350,
  "sadhe teen sau": 350,
  साडेतीनशे: 350,
  "साढ़े तीन सौ": 350,

  "paune char sau": 375,
  पावणेचारशे: 375,
  "पौने चार सौ": 375,

  "sawa char sau": 425,
  सव्वाचारशे: 425,
  "सवा चार सौ": 425,

  "saadhe char sau": 450,
  "sadhe char sau": 450,
  साडेचारशे: 450,
  "साढ़े चार सौ": 450,

  "saadhe paanch sau": 550,
  साडेपाचशे: 550,
  "साढ़े पाँच सौ": 550,

  "saadhe chhe sau": 650,
  साडेसहाशे: 650,
  "साढ़े छह सौ": 650,

  "saadhe saat sau": 750,
  साडेसातशे: 750,
  "साढ़े सात सौ": 750,

  "saadhe aath sau": 850,
  साडेआठशे: 850,
  "साढ़े आठ सौ": 850,

  "saadhe nau sau": 950,
  साडेनऊशे: 950,
  "साढ़े नौ सौ": 950,

  shambhar: 100,
  शंभर: 100,
  "ek sau": 100,
  "एक सौ": 100,
  "one hundred": 100,

  "don she": 200,
  donshe: 200,
  दोनशे: 200,
  "do sau": 200,
  "दो सौ": 200,
  "two hundred": 200,

  "teen she": 300,
  teenshe: 300,
  तीनशे: 300,
  "teen sau": 300,
  "तीन सौ": 300,
  "three hundred": 300,

  "char she": 400,
  charshe: 400,
  चारशे: 400,
  "char sau": 400,
  "चार सौ": 400,
  "four hundred": 400,

  "paach she": 500,
  "paanch she": 500,
  पाचशे: 500,
  "paanch sau": 500,
  "पाँच सौ": 500,
  "पांच सौ": 500,
  "five hundred": 500,

  "saha she": 600,
  सहाशे: 600,
  "chhe sau": 600,
  "छह सौ": 600,
  "six hundred": 600,

  "saat she": 700,
  सातशे: 700,
  "saat sau": 700,
  "सात सौ": 700,
  "seven hundred": 700,

  "aath she": 800,
  आठशे: 800,
  "aath sau": 800,
  "आठ सौ": 800,
  "eight hundred": 800,

  "nau she": 900,
  "nav she": 900,
  नऊशे: 900,
  "nau sau": 900,
  "नौ सौ": 900,
  "nine hundred": 900,

  "ek hazaar": 1000,
  "ek hazar": 1000,
  "एक हजार": 1000,
  "एक हज़ार": 1000,
  "one thousand": 1000,
}

const NUMBER_WORDS: Record<string, number> = {
  // English
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90,

  // Hindi & Marathi transliterated and Devanagari
  shunya: 0,
  शून्य: 0,
  ek: 1,
  एक: 1,
  do: 2,
  don: 2,
  दो: 2,
  दोन: 2,
  teen: 3,
  तीन: 3,
  char: 4,
  chaar: 4,
  चार: 4,
  paanch: 5,
  panch: 5,
  paach: 5,
  पाँच: 5,
  पांच: 5,
  पाच: 5,
  chhe: 6,
  saha: 6,
  छह: 6,
  सहा: 6,
  saat: 7,
  सात: 7,
  aath: 8,
  आठ: 8,
  nau: 9,
  nav: 9,
  नौ: 9,
  नऊ: 9,
  das: 10,
  daha: 10,
  दस: 10,
  दहा: 10,

  gyarah: 11,
  ikra: 11,
  ग्यारह: 11,
  अकरा: 11,
  barah: 12,
  bara: 12,
  बारह: 12,
  बारा: 12,
  terah: 13,
  tera: 13,
  तेरह: 13,
  तेरा: 13,
  chaudah: 14,
  chauda: 14,
  चौदह: 14,
  चौदा: 14,
  pandrah: 15,
  pandra: 15,
  पंद्रह: 15,
  पंधरा: 15,
  solah: 16,
  sola: 16,
  सोलह: 16,
  सोळा: 16,
  satrah: 17,
  satra: 17,
  सत्रह: 17,
  सतरा: 17,
  atharah: 18,
  athra: 18,
  अठारह: 18,
  अठरा: 18,
  unnees: 19,
  ekonis: 19,
  उन्नीस: 19,
  एकोणीस: 19,

  bees: 20,
  vees: 20,
  बीस: 20,
  वीस: 20,
  pachees: 25,
  pachvis: 25,
  पच्चीस: 25,
  पंचवीस: 25,
  tees: 30,
  तीस: 30,
  paintis: 35,
  pashtis: 35,
  पैंतीस: 35,
  पस्तीस: 35,
  chalees: 40,
  chalis: 40,
  चालीस: 40,
  चाळीस: 40,
  paintalees: 45,
  पंचेचाळीस: 45,
  पैंतालीस: 45,
  pachas: 50,
  pannas: 50,
  पचास: 50,
  पन्नास: 50,
  pachpan: 55,
  पंचावन्न: 55,
  पचपन: 55,
  saath: 60,
  साठ: 60,
  sattar: 70,
  सत्तर: 70,
  assi: 80,
  aishi: 80,
  अस्सी: 80,
  ऐंशी: 80,
  nabbe: 90,
  navvad: 90,
  नब्बे: 90,
  नव्वद: 90,
}

export function parseSpokenAmount(transcript: string): number | null {
  if (!transcript || !transcript.trim()) return null

  let text = transcript.trim().toLowerCase()

  // Replace Devanagari digits with Arabic digits
  for (const [dev, arab] of Object.entries(DEVANAGARI_DIGITS)) {
    text = text.replaceAll(dev, arab)
  }

  // 1. Direct regex match for numeric digits (e.g. "350", "₹ 400", "500 rs", "300rup")
  const digitMatch = text.match(
    /(?:₹|rs|rupees|rupaye|रुपये|रुपया)?\s*(\d{2,6})\s*(?:₹|rs|rupees|rupaye|रुपये|रुपया)?/i,
  )
  if (digitMatch && digitMatch[1]) {
    const num = parseInt(digitMatch[1], 10)
    if (!isNaN(num) && num > 0) return num
  }

  // 2. Check special phrases (e.g., "dhai sau", "saadhe teen sau", "दीडशे", "तीनशे")
  for (const [phrase, value] of Object.entries(SPECIAL_COMBINATIONS)) {
    if (text.includes(phrase.toLowerCase())) {
      // Check if there is an additional remainder (e.g., "तीनशे पन्नास" or "teen sau pachas")
      const remainder = text.replace(phrase.toLowerCase(), "").trim()
      let extra = 0
      for (const [word, val] of Object.entries(NUMBER_WORDS)) {
        if (remainder.includes(word.toLowerCase())) {
          extra = val
          break
        }
      }
      return value + extra
    }
  }

  // 3. Tokenize words and compute value
  const words = text
    .replace(/[₹,./!?]/g, " ")
    .split(/\s+/)
    .filter(Boolean)

  let total = 0
  let current = 0

  for (const w of words) {
    if (NUMBER_WORDS[w] !== undefined) {
      current += NUMBER_WORDS[w]
    } else if (
      w === "sau" ||
      w === "सौ" ||
      w === "hundred" ||
      w === "she" ||
      w === "शे"
    ) {
      current = current === 0 ? 100 : current * 100
      total += current
      current = 0
    } else if (
      w === "hazaar" ||
      w === "hazar" ||
      w === "हजार" ||
      w === "हज़ार" ||
      w === "thousand"
    ) {
      current = current === 0 ? 1000 : current * 1000
      total += current
      current = 0
    }
  }

  total += current

  return total > 0 ? total : null
}
