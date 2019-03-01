import '../string';
import { Translation } from "./types";

const languageTable: {[key: string]: Translation} = {
  en_US: {
    country: "United States",
    language: "English"
  } as Translation
}

var language = "en_US"

const DEBUG = true;

export async function initialize() {
  await import('./languages');
}

export function changeLanguage(lang: string) {
  if(!languageTable.hasOwnProperty(lang))
    language = "en_US";
  else
    language = lang;
}

export function tl(target: string, fmt?: string[] | {[key: string]: string}) {
  if(language === "en_US")
    return fmt?target.format(fmt):target;

  let ld = languageTable[language];

  if(!ld || !ld.trans.hasOwnProperty(target)) {
    DEBUG&&console.warn(`'${target}' is not translated in '${language}'`)
    return fmt?target.format(fmt):target;
  }
  return fmt?ld.trans[target].format(fmt):ld.trans[target];
}

export function getCountry() {
  return languageTable[language].country;
}

export function getLanguage() {
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
  return Object
    .keys(languageTable)
    .map(it=>({
      lang: `${languageTable[it].language} (${languageTable[it].country})`,
      value: it
    }));
}
