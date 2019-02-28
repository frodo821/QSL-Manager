import { Translation } from '../types';
import * as multilingual from '../index';

const ja_JP = {
  trans: {},
  language: "日本語",
  country: "日本"
} as Translation

multilingual.addLanguage(ja_JP, 'ja_JP');
