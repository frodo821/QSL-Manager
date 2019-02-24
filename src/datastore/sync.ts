import firebase, { initializeApp } from "firebase/app";
import 'firebase/firestore';
import config from './.firebase-config'

initializeApp(config);
firebase.firestore();
