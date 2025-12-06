/**
 * Supported Languages for L1 Bridge Support
 * Common first languages of ESL students in Alberta
 */

export interface LanguageConfig {
  code: string
  name: string
  nativeName: string
  direction: "ltr" | "rtl"
  commonInAlberta: boolean
  translationSupported: boolean
  audioSupported: boolean
}

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  {
    code: "mandarin",
    name: "Mandarin Chinese",
    nativeName: "普通话",
    direction: "ltr",
    commonInAlberta: true,
    translationSupported: true,
    audioSupported: true,
  },
  {
    code: "cantonese",
    name: "Cantonese",
    nativeName: "廣東話",
    direction: "ltr",
    commonInAlberta: true,
    translationSupported: true,
    audioSupported: true,
  },
  {
    code: "punjabi",
    name: "Punjabi",
    nativeName: "ਪੰਜਾਬੀ",
    direction: "ltr",
    commonInAlberta: true,
    translationSupported: true,
    audioSupported: true,
  },
  {
    code: "arabic",
    name: "Arabic",
    nativeName: "العربية",
    direction: "rtl",
    commonInAlberta: true,
    translationSupported: true,
    audioSupported: true,
  },
  {
    code: "spanish",
    name: "Spanish",
    nativeName: "Español",
    direction: "ltr",
    commonInAlberta: true,
    translationSupported: true,
    audioSupported: true,
  },
  {
    code: "tagalog",
    name: "Tagalog",
    nativeName: "Tagalog",
    direction: "ltr",
    commonInAlberta: true,
    translationSupported: true,
    audioSupported: true,
  },
  {
    code: "ukrainian",
    name: "Ukrainian",
    nativeName: "Українська",
    direction: "ltr",
    commonInAlberta: true,
    translationSupported: true,
    audioSupported: true,
  },
  {
    code: "vietnamese",
    name: "Vietnamese",
    nativeName: "Tiếng Việt",
    direction: "ltr",
    commonInAlberta: true,
    translationSupported: true,
    audioSupported: true,
  },
  {
    code: "korean",
    name: "Korean",
    nativeName: "한국어",
    direction: "ltr",
    commonInAlberta: true,
    translationSupported: true,
    audioSupported: true,
  },
  {
    code: "farsi",
    name: "Farsi (Persian)",
    nativeName: "فارسی",
    direction: "rtl",
    commonInAlberta: true,
    translationSupported: true,
    audioSupported: true,
  },
  {
    code: "hindi",
    name: "Hindi",
    nativeName: "हिन्दी",
    direction: "ltr",
    commonInAlberta: true,
    translationSupported: true,
    audioSupported: true,
  },
  {
    code: "urdu",
    name: "Urdu",
    nativeName: "اردو",
    direction: "rtl",
    commonInAlberta: true,
    translationSupported: true,
    audioSupported: true,
  },
  {
    code: "french",
    name: "French",
    nativeName: "Français",
    direction: "ltr",
    commonInAlberta: true,
    translationSupported: true,
    audioSupported: true,
  },
  {
    code: "somali",
    name: "Somali",
    nativeName: "Soomaali",
    direction: "ltr",
    commonInAlberta: true,
    translationSupported: true,
    audioSupported: false,
  },
]

export const getLanguageByCode = (code: string): LanguageConfig | undefined => {
  return SUPPORTED_LANGUAGES.find((lang) => lang.code === code)
}

export const getCommonAlbertaLanguages = (): LanguageConfig[] => {
  return SUPPORTED_LANGUAGES.filter((lang) => lang.commonInAlberta)
}

export const getRTLLanguages = (): LanguageConfig[] => {
  return SUPPORTED_LANGUAGES.filter((lang) => lang.direction === "rtl")
}
