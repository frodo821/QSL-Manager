import firebase, { initializeApp } from "firebase/app";
import 'firebase/firestore';
import config from './.firebase-config'
import { Message } from "./storetypes";
import { App } from "../App";
import { QSL } from "./types";

const APP_NAME = "online-qsl-manager-web-client";

const TYPE_DICT = {
  added: "AddQSL",
  modified: "EditQSL",
  removed: "RemoveQSL"
}

let FS: {
  application: App;
  database: firebase.firestore.Firestore;
  room: firebase.firestore.CollectionReference;
  connected: boolean;
};

export function isConnected() {
  return !!(FS&&FS.connected);
}

export function getSyncId() {
  let p = FS.room.parent;
  return p?p.id:'';
}

export async function initialize(appl: App, roomId?: string) {
  let app: firebase.app.App | undefined;
  if(!(app = firebase.apps.find(it=>it.name===APP_NAME)))
    app = initializeApp(config, APP_NAME)

  let database = firebase.firestore(app);
  database.enablePersistence();

  let col: firebase.firestore.DocumentReference;
  if(roomId) {
    col = database.collection('syncRooms').doc(roomId);
    let doc = await col.get();
    if(!doc.exists) {
      appl.setState({
        input_msg: {
          content: `Could not sync via cloud: unknown sync room ID '${roomId}'`,
          type: "error"
        }
      });
      location.hash = "";
      location.reload();
      return;
    }
  } else {
    col = await database.collection('syncRooms').add({});
  }

  let room = col.collection('qsls');
  room.onSnapshot({
    next: snapshot => {
      snapshot.docChanges().map(it=>{
        let qsl = Object.assign(it.doc.data(), {my: it.doc.id.replace('.', '/')});
        let index = findQSL(it.doc.id.replace('.', '/'));
        try{
          appl.props.dispatchMessage({
            type: typeof index !== "undefined"&&it.type==="added"?"EditQSL":TYPE_DICT[it.type],
            index,
            qsl: Object.assign(qsl, {date: new Date(qsl.date)}),
            force: it.type==="modified",
            initiator: "ONLINE_SYNC_EVENT"
          } as Message);
        } catch(e) {}
      });
      appl.forceUpdate();
    },
    error: console.error
  });

  FS = {
    database,
    application: appl,
    room,
    connected: true
  };

  location.hash = `#sync=${getSyncId()}`;
  await uploadAll();
}

function findQSL(my: string) {
  let i = FS.application.props.qsls.findIndex(qsl=>qsl.my === my);
  return i!==-1?i:undefined;
}

async function updatable(qsl: QSL, doc: firebase.firestore.DocumentReference) {
  let date = (await doc.get()).get('date') as string | null;
  return !(date && new Date(date) < qsl.date);
}

export async function uploadAll() {
  let batcher = FS.room.firestore.batch();
  for(let qsl of FS.application.props.qsls) {
    let {my, ...other} = qsl;
    if(!my) continue;
    let md = FS.room.doc(my.replace('/', '.'));
    if(typeof other.date === "object" && 'toISOString' in other.date)
      (other as any).date = other.date.toISOString();
    if(await updatable(qsl, md))
      batcher.set(md, other);
  }
}

export async function syncRemoteData() {
  let it = await fetchRemoteData();
  FS.application.props.syncQSLs(it);
}

export async function fetchRemoteData() {
  let snapshot = await FS.room.get();
  return snapshot
    .docs
    .map(it=>Object.assign(it.data(), {my: it.id}))
    .map(it=>Object.assign(it, {date: new Date(it.date)}))
    .map(it=>Object.assign(it, {my: it.my.replace('.', '/')}) as QSL)
    .sort((a,b)=>a.date.valueOf() - b.date.valueOf());
}

export async function uploadLocalData(msg: Message) {
  switch (msg.type) {
    case "EditQSL":
      msg.force = true;
      if(msg.qsl && msg.index !== undefined){
        let oldmy = FS.application.props.qsls[msg.index].my;
        if(oldmy !== msg.qsl.my) {
          let {my} = FS.application.props.qsls[msg.index];
          await FS.room.doc(my.replace('/', '.')).delete();
        }
      }
    case "AddQSL":
      if(msg.qsl) {
        let {my, ...other} = msg.qsl;
        let md = FS.room.doc(my.replace('/', '.'));
        if(msg.force || await updatable(msg.qsl, md)) {
          (other as any).date = other.date.toISOString();
          await md.set(other);
        }
      }
      break;
    case "RemoveQSL":
      if(msg.index !== undefined) {
        let {my} = FS.application.props.qsls[msg.index];
        await FS.room.doc(my.replace('/', '.')).delete();
      }
      break;
    default:
      return;
  }
}

export default {
  isConnected,
  initialize,
  uploadAll,
  fetchRemoteData,
  uploadLocalData
}
