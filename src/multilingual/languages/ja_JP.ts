import { Translation } from '../types';
import * as multilingual from '../index';

const ja_JP = {
  trans: {
    "Close form": "入力欄を閉じる",
    "Open form": "入力欄を開く",
    "His call sign (I sent)": "自局のコールサイン",
    "His QTH (I sent)": "自局の運用場所",
    "His operator (I sent)": "自局の運用者の名前",
    "His Operator": "自局の運用者",
    "My QTH (he sent)": "相手局の運用場所",
    "My contest number (he sent)": "相手局のコンテストナンバー",
    "remarks": "備考",
    "Date": "日付",
    "My RST/Context Number": "相手局のRST/コンテストナンバー",
    "His Callsign": "自局のコールサイン",
    "Time": "時刻",
    "My call sign (he sent)": "相手局のコールサイン",
    "My Operator": "相手局の運用者",
    "Band": "周波数帯",
    "My operator (he sent)": "相手局の運用者",
    "My Callsign": "相手局のコールサイン",
    "My QTH": "相手局の運用場所",
    "His contest number (I sent)": "自局のコンテストナンバー",
    "His RST/Context Number": "自局のRST/コンテストナンバー",
    "Mode": "電波形式",
    "His QTH": "自局の運用場所",
    "Settings": "設定",
    "Sync via cloud": "クラウド同期",
    "Sync room ID (click here to copy)": "同期ID (クリックでコピー)",
    "download log as textfile": "テキストファイルとしてダウンロード",
    "And then, you can create log sheet here.": "ここから提出する形式のログシートが作成できます。",
    "Choose language": "言語を選択",
    "Version info": "バージョン情報",
    "{} is alredy exists at {}": "{}は{}に既に登録済みです!",
    "Could not sync via cloud: unknown sync room ID {}": "同期できませんでした。理由: 不明な同期ID {}",
    "Show remarks": "備考を表示",
    "Delete": "削除",
    "Edit": "編集",
    "No remarks are provided.": "備考はありません",
    "Register": "登録"
  },
  language: "日本語",
  country: "日本"
} as Translation

multilingual.addLanguage(ja_JP, 'ja_JP');
