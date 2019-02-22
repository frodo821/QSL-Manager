export type BandRange
  = "Hz"
  | "kHz"
  | "MHz"
  | "GHz"
  | "THz"

export type RadioMode
  = "FM"
  | "AM"
  | "SSB"
  | "CW"


export type BandPreset = Band & {remarks?: string}

export type Presets = {
  [key: string]: BandPreset
}

export type Band = {
  frequency: number,
  range: BandRange
}

export type QSLMy = {
  his: string,
  his_op?: string,
  his_qth?: string,
  his_no?: string
  mode: RadioMode,
  band: Band,
}

export type QSL = {
  my: string,
  date: Date,
  my_op?: string,
  my_qth?: string,
  my_no?: string,
  remarks?: string
} & QSLMy
