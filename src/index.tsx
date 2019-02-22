import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from "react-redux";
import './index.css';
import App from './App';
import { STORE } from './datastore/store';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(
  <Provider store={STORE}>
    <App />
  </Provider>,
  document.getElementById('root'));

serviceWorker.register();
