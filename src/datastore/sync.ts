import { initializeApp, firestore } from "firebase";
import { QSL } from "./types";

const config = {
  apiKey: "AIzaSyD0Y032yeslMqGNQKBZOg2H55X3dhY3UyQ",
  authDomain: "qsl-manager.firebaseapp.com",
  databaseURL: "https://qsl-manager.firebaseio.com",
  projectId: "qsl-manager",
  storageBucket: "qsl-manager.appspot.com",
  messagingSenderId: "478319236626"
};

const app = initializeApp(config);

const db = app.firestore();

export type Observer = {
  next?: ((snapshot: firestore.QuerySnapshot) => void),
  error?: ((error: Error) => void),
  complete?: (() => void)
}

export class SyncQSLData {
  ready: boolean = false;
  room!: firestore.CollectionReference;
  syncId!: string;
  constructor(syncId?: string, onready?: (target: SyncQSLData) => void, observer?: Observer) {
    if (!syncId)
      db.collection('qsllogs').add({}).then(ref => {
        this.room = ref.collection('qsls');
        this.room.onSnapshot(observer||{});
        this.ready = true;
        this.syncId = ref.id;
        (onready || (_ => {}))(this);
      });
    else {
      this.room = db.collection('qsllogs').doc(syncId).collection('qsls');
      this.room.onSnapshot(observer||{});
      this.ready = true;
      this.syncId = syncId;
      (onready || (_ => {}))(this);
    }
  }

  async createQSL(data: QSL): Promise<void> {
    if(!this.ready) throw "initialization not completed.";
    let {my, ...others} = data;
    return this.room.doc(my).set(others);
  }

  async updateQSL(data: QSL) {
    if(!this.ready) throw "initialization not completed.";
    let {my, ...others} = data;
    return this.room.doc(my).update(others);
  }

  async deleteQSL(data: QSL) {
    if(!this.ready) throw "initialization not completed.";
    let {my} = data;
    return this.room.doc(my).delete();
  }
}
