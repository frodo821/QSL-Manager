import { Translation } from "./types";
import './languages';

const languages = {} as {[key: string]: Translation}

var language = "en_US"

const DEBUG = true;

export function changeLanguage(lang: string) {
  if(!languages.hasOwnProperty(lang))
    language = "en_US"
  else
    language = lang
}

export function tl(target: string) {
  if(language === "en_US")
    return target;

  let ld = languages[language];

  if(!ld.trans.hasOwnProperty(target)) {
    DEBUG&&console.warn(`'${target}' is not translated in '${language}'`)
    return target;
  }
  return ld.trans[target];
}

export function getCountry() {
  if(language === "en_US")
    return "United States"
  return languages[language].country;
}

export function getLanguage() {
  if(language === "en_US")
    return "English"
  return languages[language].language;
}

export function currentLang() {
  return language;
}

export function addLanguage(lang: Translation, key: string) {
  if(!languages.hasOwnProperty(key)) {
    languages[key] = lang;
  }
}

export function listupLanguageVariant() {
  return ['en_US'].concat(Object.keys(languages));
}
