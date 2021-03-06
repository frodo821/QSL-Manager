import { compose, createStore, Dispatch } from "redux";
import { connect } from "react-redux";
import persist from "redux-localstorage";
import { Message, State, ActionDispatcher } from './storetypes';
import { QSL, QSLMy, Presets } from "./types";
import { isConnected, uploadLocalData } from "./sync";

const DEFAULT_BAND_PLANS: Presets = {
  "135kHz Band (2220m)": {
    frequency: 135,
    range: "kHz",
    remarks: `Should not interfere with airplanes radio communications`
  },
  "475kHz Band (600m)": {
    frequency: 475,
    range: "kHz",
    remarks: `Should not interfere with airplanes radio communications`
  },
  "1.8MHz Band (160m)": {
    frequency: 1.8,
    range: "MHz"
  },
  "1.9MHz Band (160m)": {
    frequency: 1.9,
    range: "MHz"
  },
  "3.5MHz Band (80m)": {
    frequency: 3.5,
    range: "MHz"
  },
  "3.8MHz Band (75m)": {
    frequency: 3.8,
    range: "MHz",
    remarks: `Only use for SSB (with other country)`
  },
  "7MHz Band (40m)": {
    frequency: 7,
    range: "MHz"
  },
  "21MHz Band (15m)": {
    frequency: 21,
    range: "MHz"
  },
  "24MHz Band (12m)": {
    frequency: 24,
    range: "MHz"
  },
  "28MHz Band (10m)": {
    frequency: 28,
    range: "MHz"
  },
  "50MHz Band (6m)": {
    frequency: 50,
    range: "MHz"
  },
  "144MHz Band (2m)": {
    frequency: 144,
    range: "MHz"
  },
  "430MHz Band (70cm)": {
    frequency: 430,
    range: "MHz"
  },
  "1200MHz Band (23cm)": {
    frequency: 1200,
    range: "MHz"
  },
  "2400MHz Band (13cm)": {
    frequency: 2400,
    range: "MHz"
  },
  "5750MHz Band (5cm)": {
    frequency: 5750,
    range: "MHz"
  },
  "10.1GHz Band (3cm or shorter)": {
    frequency: 10.1,
    range: "GHz"
  }
}

const init: State = {
  myqsl: {
    his: "",
    mode: "SSB",
    band: DEFAULT_BAND_PLANS["7MHz Band (40m)"]
  },
  qsls: [],
  band_presets: DEFAULT_BAND_PLANS
}

let prevState: State;

function reducer(state:State | undefined, msg:Message): State {
  if(!state)
    state = init;

  if(isConnected()&&msg.initiator !== "ONLINE_SYNC_EVENT") {
    uploadLocalData(msg);
    return state;
  }

  switch (msg.type) {
    case "AddQSL":
      if(msg.qsl) {
        let qsl = msg.qsl;
        let tmp: Array<QSL>;
        if(!msg.force && (tmp = state.qsls.filter(it => it.my.split('/', 1)[0] === qsl.my.split('/', 1)[0])).length)
          throw `${qsl.my} is alredy exists at ${tmp[0].date.toLocaleString()}`;
        state.qsls.push(msg.qsl);
        state.qsls = state.qsls.sort((a,b)=>a.date.valueOf() - b.date.valueOf());
      }
      return state;

    case "RemoveQSL":
      if(typeof msg.index !== 'undefined') {
        state.qsls.splice(msg.index, 1);
      }
      return state;
    
    case "EditQSL":
      if(typeof msg.index !== 'undefined' && msg.qsl) {
        state.qsls[msg.index] = msg.qsl;
      }
      return state;

    case "EditQSLMy":
      if(msg.edited_my)
        state.myqsl = msg.edited_my;
      return state;

    case "UpdateQSLs":
      if(msg.qsls)
        state.qsls = msg.qsls;
      return state;

    default:
      return state;
  }
}

function mapDispatchToProps(dispatch: Dispatch<Message>): ActionDispatcher {
  return {
    addQSL: (qsl: QSL, initiator?: string) => dispatch({ type: "AddQSL", qsl, initiator}),
    editQSL: (index: number, qsl: QSL, initiator?: string) => dispatch({ type: "EditQSL", index, qsl, initiator}),
    removeQSL: (index: number, initiator?: string) => dispatch({ type: "RemoveQSL", index, initiator}),
    editQSLmy: (edited_my: QSLMy, initiator?: string) => dispatch({type: "EditQSLMy", edited_my, initiator}),
    syncQSLs: (qsls: QSL[], initiator?: string) => dispatch({type: "UpdateQSLs", qsls, initiator}),
    dispatchMessage: dispatch
  };
}

export const STORE = createStore(
  reducer,
  compose(
    persist<State>(
      "",
      {
        key: "qsl-manager"
    })
));

export const connectWith = connect(
  (state: State)=>state,
  mapDispatchToProps);
