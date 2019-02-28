import { Translation } from "./types";

const languageTable: {[key: string]: Translation} = {
  en_US: {} as Translation
}

var language = "en_US"

const DEBUG = true;

export async function initialize() {
  await import('./languages');
}

export function changeLanguage(lang: string) {
  if(!languageTable.hasOwnProperty(lang))
    language = "en_US"
  else
    language = lang
}

export function tl(target: string) {
  if(language === "en_US")
    return target;

  let ld = languageTable[language];

  if(!ld || !ld.trans.hasOwnProperty(target)) {
    DEBUG&&console.warn(`'${target}' is not translated in '${language}'`)
    return target;
  }
  return ld.trans[target];
}

export function getCountry() {
  if(language === "en_US")
    return "United States"
  return languageTable[language].country;
}

export function getLanguage() {
  if(language === "en_US")
    return "English"
  return languageTable[language].language;
}

export function currentLang() {
  return language;
}

export function addLanguage(lang: Translation, key: string) {
  if(!languageTable.hasOwnProperty(key)) {
    languageTable[key] = lang;
  }
}

export function listupLanguageVariant() {
  return Object.keys(languageTable);
}
