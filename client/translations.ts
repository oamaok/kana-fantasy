import en_GB from './translations/en_GB.json'
import fi_FI from './translations/fi_FI.json'

export const translations = { en_GB, fi_FI } as const

export type Translations = typeof translations
export type Languages = keyof Translations
