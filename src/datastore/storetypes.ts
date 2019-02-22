import { QSLMy, QSL, Band, Presets } from "./types";

export type Action
  = "AddQSL"
  | "RemoveQSL"
  | "EditQSL"
  | "EditQSLMy"
  | "UpdateQSLs"

export type Message = {
  type: Action
  qsl?: QSL,
  index?: number,
  edited_my?: QSLMy,
  qsls?: Array<QSL>,
  force?: boolean
}

export type State = {
  myqsl: QSLMy,
  qsls: Array<QSL>
  band_presets: Presets
}

export interface ActionDispatcher {
  addQSL(qsl: QSL): Message
  removeQSL(index: number): Message
  editQSL(index: number, qsl: QSL): Message
  editQSLmy(edited_my: QSLMy): Message
}
