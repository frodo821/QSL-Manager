import { QSLMy, QSL, Band, Presets } from "./types";

export type Action
  = "AddQSL"
  | "RemoveQSL"
  | "EditQSL"
  | "EditQSLMy"
  | "UpdateQSLs"

export type Message = {
  type: Action;
  qsl?: QSL;
  index?: number;
  edited_my?: QSLMy;
  qsls?: Array<QSL>;
  force?: boolean;
  initiator?: string;
}

export type State = {
  myqsl: QSLMy;
  qsls: Array<QSL>;
  band_presets: Presets;
  syncId?: string;
}

export interface ActionDispatcher {
  addQSL(qsl: QSL, initiator?: string): Message
  removeQSL(index: number, initiator?: string): Message
  editQSL(index: number, qsl: QSL, initiator?: string): Message
  editQSLmy(edited_my: QSLMy, initiator?: string): Message
  syncQSLs(qsls: QSL[], initiator?: string): Message
  dispatchMessage(msg: Message): Message
}
