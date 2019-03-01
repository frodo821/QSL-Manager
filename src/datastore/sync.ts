import firebase, { initializeApp } from "firebase/app";
import 'firebase/firestore';
import config from './.firebase-config'
import { Message } from "./storetypes";
import { App } from "../App";
import { QSL } from "./types";
import manager from '../parameter';
import { tl } from "../multilingual";

const APP_NAME = "online-qsl-manager-web-client";

const TYPE_DICT = {
  added: "AddQSL",
  modified: "EditQSL",
  removed: "RemoveQSL"
}

let initializing = false;

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
  if(initializing) throw "already initializing.";
  initializing = true;

  let app: firebase.app.App | undefined;
  let database;
  if(!(app = firebase.apps.find(it=>it.name===APP_NAME))) {
    app = initializeApp(config, APP_NAME);
    database = firebase.firestore(app);
    database.enablePersistence();
  } else {
    database = firebase.firestore(app);
  }

  let col: firebase.firestore.DocumentReference;
  if(roomId) {
    col = database.collection('syncRooms').doc(roomId);
    let doc = await col.get();
    if(!doc.exists) {
      let content = tl("Could not sync via cloud: unknown sync room ID {}", [roomId]);
      appl.setState({
        input_msg: {
          content,
          type: "error"
        }
      });
      initializing = false;
      throw content;
    }
  } else {
    col = await database.collection('syncRooms').add({});
  }

  let room = col.collection('qsls');

  FS = {
    database,
    application: appl,
    room,
    connected: true
  };

  room.onSnapshot({
    next: snapshot => {
      snapshot.docChanges().map(it=>{
        let qsl = Object.assign(it.doc.data(), {id: it.doc.id});
        let index = findQSL(qsl.my);
        try{
          appl.props.dispatchMessage({
            type: TYPE_DICT[it.type],
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

  manager.sync = getSyncId();
  await uploadAll();
}

function findQSL(my: string) {
  let i = FS.application.props.qsls.findIndex(qsl=>qsl.my === my);
  return i!==-1?i:undefined;
}

async function updatable(qsl: QSL, doc: firebase.firestore.DocumentReference) {
  let date = (await doc.get()).get('date') as number | null;
  return !(date && new Date(date) < qsl.date);
}

export async function uploadAll() {
  let batcher = FS.room.firestore.batch();
  for(let qsl = 0; qsl < FS.application.props.qsls.length; qsl++) {
    let tqsl = FS.application.props.qsls[qsl];
    let {id, ...other} = tqsl;
    (other as any).date = other.date.valueOf();
    let md;
    if(id) {
      md = FS.room.doc(id);
      if(await updatable(tqsl, md))
        await batcher.set(md, other);
    } else {
      let id = (await FS.room.add(other)).id;
      FS.application.props.editQSL(qsl, Object.assign({id}, other), "ONLINE_SYNC_EVENT");
    }
  }
  await batcher.commit();
}

export async function syncRemoteData() {
  let it = await fetchRemoteData();
  FS.application.props.syncQSLs(it);
}

export async function fetchRemoteData() {
  let snapshot = await FS.room.get();
  return snapshot
    .docs
    .map(it=>Object.assign(it.data(), {id: it.id}))
    .map(it=>Object.assign(it, {date: new Date(it.date)}) as QSL)
    .sort((a,b)=>a.date.valueOf() - b.date.valueOf());
}

export async function uploadLocalData(msg: Message) {
  switch (msg.type) {
    case "EditQSL":
      msg.force = true;
    case "AddQSL":
      if(msg.qsl) {
        let {id, ...other} = msg.qsl;
        (other as any).date = other.date.valueOf();
        if(id){
          let md = FS.room.doc(id);
          if(msg.force || await updatable(msg.qsl, md)) {
            await md.set(other);
          }
        } else {
          await FS.room.add(other);
        }
      }
      break;
    case "RemoveQSL":
      if(msg.index !== undefined) {
        let {id} = FS.application.props.qsls[msg.index];
        await FS.room.doc(id).delete();
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
