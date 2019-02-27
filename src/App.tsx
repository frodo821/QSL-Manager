import React, { Component } from 'react';
import QSLRow from './components/QSLRow';
import { ActionDispatcher, State } from "./datastore/storetypes";
import './styles/app.scss';
import { connectWith } from './datastore/store';
import { QSL } from './datastore/types';
import { initialize, getSyncId, isConnected, syncRemoteData } from './datastore/sync';
import { downloadLogs } from './logging';

type IntrinsicState = {
  contextMenuOpened?: boolean;
  input_msg?: {
    content: string,
    type: "error" | "info" | "warn"
  };
  t_freq?: string;
  forms_hidden?: boolean;
  sync_state?: "REQUESTED" | "SYNCHRONIZING";
  settings?: boolean;
  attrs: {[key: string]: string};
}

type Props = State & ActionDispatcher;

export class App extends Component<Props, IntrinsicState> {
  my: React.RefObject<HTMLInputElement>;
  my_qth: React.RefObject<HTMLInputElement>;
  my_op: React.RefObject<HTMLInputElement>;
  frequency: React.RefObject<HTMLInputElement>;
  freq_range: React.RefObject<HTMLSelectElement>;
  rad_mode: React.RefObject<HTMLSelectElement>;
  remarks: React.RefObject<HTMLInputElement>;
  my_no: React.RefObject<HTMLInputElement>;
  msg_timeout?: any;

  constructor(props: Props) {
    super(props);
    this.my = React.createRef();
    this.my_qth = React.createRef();
    this.my_op = React.createRef();
    this.frequency = React.createRef();
    this.freq_range = React.createRef();
    this.rad_mode = React.createRef();
    this.remarks = React.createRef();
    this.my_no = React.createRef();
    if(location.hash) {
      let attrs = Object.assign({}, ...(
        location.hash
                .slice(1)
                .split('&')
                .map(i=>i.split('='))
                .map(i=>({[i[0]]: i[1]}))
        )) as {[key: string]: string};
      this.state = {attrs}
    } else {
      this.state = {attrs: {}};
    }
    (window as any).root = this;
  }

  componentDidMount() {
    let id = this.getSyncId();
    if(id) {
      initialize(this, id).then(_=>this.setState({sync_state: "SYNCHRONIZING"}));
    } else {
      this.props.qsls.forEach((it, idx)=>{
        if(it.id){
          let {id, ...others} = it;
          this.props.editQSL(idx, others);
        }
      })
    }
  }

  getSyncId() : string | null {
    if(!this.state.attrs.hasOwnProperty('sync'))
      return null;
    return this.state.attrs.sync;
  }

  componentDidUpdate(_: Props, prev: IntrinsicState) {
    if(this.state.input_msg && prev.input_msg != this.state.input_msg) {
      if(this.msg_timeout !== undefined) clearTimeout(this.msg_timeout);

      this.msg_timeout = setTimeout(()=>{
          this.setState({input_msg: undefined});
        }, 2500);
    }
  }

// #region Update His data (I sent)
  changeMyCS = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.props.editQSLmy(Object.assign(this.props.myqsl, {his: event.target.value.toUpperCase()}));
    this.forceUpdate();
  }

  changeMyQTH = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.props.editQSLmy(Object.assign(this.props.myqsl, {his_qth: event.target.value}));
    this.forceUpdate();
  }

  changeMyOP = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.props.editQSLmy(Object.assign(this.props.myqsl, {his_op: event.target.value}));
    this.forceUpdate();
  }

  changeMyCnum = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.props.editQSLmy(Object.assign(this.props.myqsl, {his_no: event.target.value.toUpperCase()}));
    this.forceUpdate();
  }

  changeMode = (event: React.ChangeEvent<HTMLSelectElement>) => {
    this.props.editQSLmy(Object.assign(this.props.myqsl, {mode: event.target.value}));
    this.forceUpdate();
  }

  changeBandFreq = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({t_freq: event.target.value});
  }

  updateBandFreq = (event: React.FocusEvent<HTMLInputElement>) => {
    this.setState({t_freq: undefined});
    let val = parseFloat(event.target.value);
    if(val !== val) {
      return;
    }
    this.props.editQSLmy(Object.assign(
      this.props.myqsl,
      {
        band: {
          frequency: val,
          range: this.props.myqsl.band.range
        }
      }));
    this.forceUpdate();
  }

  changeBandRange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    this.props.editQSLmy(Object.assign(
      this.props.myqsl,
      {
        band: {
          frequency: this.props.myqsl.band.frequency,
          range: event.target.value
        }
      }));
    this.forceUpdate();
  }

  dispatchKeydown = (event: React.KeyboardEvent<HTMLElement>) => {
    if(event.key != "Enter") return;
    event.stopPropagation();
    event.preventDefault();
    if(event.ctrlKey)
      return this.onSubmitForm();
    let index = parseInt(event.currentTarget.getAttribute('tabindex') || '');
    if(event.currentTarget === this.my.current) {
      if(this.checkExists(event.currentTarget as HTMLInputElement))
        return;
    }
    if(index !== index) return;
    if(index < 8) {
      let next = document.querySelector(`input[tabindex="${index+1}"]`) as HTMLElement | null;
      if(next)
        next.focus();
      return;
    }
    let next = document.querySelector('input[tabindex="4"]') as HTMLElement | null;
    let form = document.getElementById('qsl-form') as HTMLFormElement | null;
    if(!form || form.checkValidity()) {
      this.onSubmitForm();
    } else {
      this.setState({
        input_msg: {
          content: "Please enter informations collectly.",
          type: "error"
        }
      });
    }
    if(next)
      next.focus();
  }

  onSubmitForm = (event?: React.FormEvent<HTMLFormElement>) => {
    if(event) {
      event.preventDefault();
      event.stopPropagation();
      if(!event.currentTarget.checkValidity()) {
        this.setState({
          input_msg: {
            content: "Please enter informations collectly.",
            type: "error"
          }
        });
        return;
      }
    }
    let nqsl: QSL = Object.assign({
      my: (this.my.current || {value: ''}).value.toUpperCase(),
      my_qth: (this.my_qth.current || {value: ''}).value,
      my_op: (this.my_op.current || {value: ''}).value,
      my_no: (this.my_no.current || {value: ''}).value.toUpperCase(),
      remarks: (this.remarks.current || {value: ''}).value,
      date: new Date()
    }, this.props.myqsl);
    try{
      let tmp: QSL | undefined;
      if((tmp = this.props.qsls.find(it => it.my.split('/', 1)[0] === nqsl.my.split('/', 1)[0])))
        throw `${nqsl.my} is alredy exists at ${tmp.date.toLocaleString()}`;
      this.props.addQSL(nqsl);
      this.setState({input_msg: {content: "QSL log successfully registered.", type: "info"}});
    }catch(e) {
      this.setState({input_msg: {content: e.toString(), type: "error"}});
      return;
    }
    (this.my.current || {value: ''}).value = '';
    (this.my_qth.current || {value: ''}).value = '';
    (this.my_op.current || {value: ''}).value = '';
    (this.my_no.current || {value: ''}).value = '';
    (this.remarks.current || {value: ''}).value = '';
    this.forceUpdate();
  }

  syncRequested = (_: React.MouseEvent<HTMLElement>) => {
    if(this.state.sync_state === "REQUESTED")
      return;
    this.setState({sync_state: "REQUESTED"});
  }

  startSync = () => {
    let syncId = ((document.getElementById("sync-room-id") as HTMLInputElement | null) || {value: ''}).value;
    initialize(this, syncId).then(_=>this.setState({sync_state: "SYNCHRONIZING"}));
  }

  copyURL = (_: React.MouseEvent) => {
    let input = document.createElement('input');
    document.body.appendChild(input);
    input.value = `https://pages.tech-frodo.xyz/#sync=${getSyncId()}`;
    input.select();
    document.execCommand('copy');
    this.setState({input_msg: {content: "Sync URL Copied!", type: "info"}});
    document.body.removeChild(input);
    console.log(`copied: ${input.value}`);
  }

  onCheckExists = (e: React.ChangeEvent<HTMLInputElement>) => this.checkExists(e.target, false)

  checkExists = (e: HTMLInputElement, focus: boolean = true) => {
    let val = e.value.toUpperCase();
    let tmp: QSL | undefined;
    if((tmp = this.props.qsls.find(it => it.my.split('/', 1)[0] === val.split('/', 1)[0]))) {
      this.setState({input_msg: {content: `${val} is alredy exists at ${tmp.date.toString()}`, type: "error"}});
      if(focus) e.focus();
      return true;
    }
    return false;
  }
  // #endregion

// #region Create virtual-DOMs
  render() {
    return (
      <div className="App">
        <div className={"messages "+(this.state.input_msg?this.state.input_msg.type:'hidden')}>
          {this.state.input_msg?this.state.input_msg.content:null}
        </div>
        {this.createHeader()}
        <main>
          <div className="table-wrapper">
            <table className="qsl-table">
              <caption>QSL Logs</caption>
              <tbody>
                <QSLRow key={-1} num={-1} />
                {this.props.qsls.map((qsl, idx)=>(
                  <QSLRow
                    qsl={qsl}
                    key={idx}
                    num={idx}
                    editQSL={this.props.editQSL}
                    deleteQSL={num=>(this.forceUpdate(),this.props.removeQSL(num))}/>))}
              </tbody>
            </table>
          </div>
        </main>
        {this.state.sync_state==="REQUESTED"?!isConnected()?this.createSyncDialog():this.createUnsyncDialog():null}
        {this.state.settings?this.createSettings():null}
        {!this.state.forms_hidden?this.createForm():null}
      </div>
    );
  }

  createForm() {
    return (
      <form onSubmit={this.onSubmitForm} id="qsl-form">
        <div className="radio">
          <input
            required={true}
            type="text"
            className="uppercased"
            onChange={this.changeMyCS}
            onKeyDown={this.dispatchKeydown}
            value={this.props.myqsl.his}
            tabIndex={1}
            placeholder="His call sign (I sent)"
            pattern="([Jj][A-Sa-s]|[78][J-Nj-n])([0-9])([0-9A-Za-z]{2,3}(?:/[0-9])?)"/>
          <input
            type="text"
            onChange={this.changeMyQTH}
            onKeyDown={this.dispatchKeydown}
            tabIndex={1}
            value={this.props.myqsl.his_qth || ''}
            placeholder="His QTH (I sent)"/>
          <input
            type="text"
            onChange={this.changeMyOP}
            onKeyDown={this.dispatchKeydown}
            tabIndex={2}
            value={this.props.myqsl.his_op || ''}
            placeholder="His operator (I sent)"/>
          <input
            type="text"
            onChange={this.changeMyCnum}
            onKeyDown={this.dispatchKeydown}
            tabIndex={3}
            className="uppercased"
            value={this.props.myqsl.his_no || ''}
            placeholder="His contest number (I sent)"
            pattern="[1-5][1-9]{1,2}\d{2}[K-Nk-n]"/>
          <input
            required={true}
            type="text"
            ref={this.my}
            onKeyDown={this.dispatchKeydown}
            tabIndex={4}
            onBlur={this.onCheckExists}
            className="uppercased"
            placeholder="My call sign (he sent)"
            pattern="([Jj][A-Sa-s]|[78][J-Nj-n])([0-9])([0-9A-Za-z]{2,3}(?:/[0-9])?)"/>
          <input
            type="text"
            ref={this.my_qth}
            onKeyDown={this.dispatchKeydown}
            tabIndex={5}
            placeholder="My QTH (he sent)"/>
          <input
            type="text"
            ref={this.my_op}
            onKeyDown={this.dispatchKeydown}
            tabIndex={6}
            placeholder="My operator (he sent)"/>
          <input
            type="text"
            ref={this.my_no}
            onKeyDown={this.dispatchKeydown}
            tabIndex={7}
            className="uppercased"
            placeholder="My contest number (he sent)"
            pattern="[1-5][1-9]{1,2}\d{2}[K-Nk-n]"/>
        </div>
        <div className="rad-freq-mode">
          <input required={true}
            type="text"
            value={this.state.t_freq||this.props.myqsl.band.frequency}
            minLength={1}
            pattern="[0-9]*\.[0-9]+|[0-9]+(\.[0-9]*)?"
            onBlur={this.updateBandFreq}
            onChange={this.changeBandFreq}/>
          <select
            value={this.props.myqsl.band.range}
            onChange={this.changeBandRange}>
            <option>Hz</option>
            <option>kHz</option>
            <option>MHz</option>
            <option>GHz</option>
            <option>THz</option>
          </select>
          <select
            onChange={this.changeMode}
            value={this.props.myqsl.mode}>
            <optgroup label="voice">
              <option>AM</option>
              <option>FM</option>
              <option>SSB</option>
            </optgroup>
            <option>CW</option>
          </select>
        </div>
        <input
          type="text"
          placeholder="remarks"
          className="remarks"
          onKeyDown={this.dispatchKeydown}
          tabIndex={8}
          ref={this.remarks}/>
        <input type="submit" value="Register"/>
      </form>)
  }

  createHeader() {
    return (
      <header className="app-header">
        <div className="header-wrapper">
          <div className="logo">
            Online QSL Manager
          </div>
          <div id="forms-toggle" className="clickable">
            <input
              type="checkbox"
              id="forms-shown"
              checked={!!this.state.forms_hidden}
              onChange={e=>this.setState({forms_hidden: e.target.checked})}/>
            <label htmlFor="forms-shown">
              {this.state.forms_hidden?"Open form":"Close form"}
            </label>
          </div>
          <div
            className="material-wrapper clickable"
            onClick={_=>this.setState({settings: true})}>
            <i className="material-icons settings-opener">settings</i>
          </div>
        </div>
      </header>)
  }

  createSettings() {
    return(
      <div className="settings">
        <div className="settings-wrapper">
          <div
            className="material-wrapper"
            onClick={_=>this.setState({settings: false})}>
            <i className="material-icons close">close</i>
          </div>
          <h2>Settings</h2>
          <div className="settings-group">
            <div className={
            "sync-button material-wrapper clickable "+
            (this.state.sync_state?this.state.sync_state==="SYNCHRONIZING"?"synchronizing":"pending":"not-sync")}
            onClick={this.syncRequested}>
              Sync via cloud: <i className="material-icons"></i>
            </div>
            {this.state.sync_state==="SYNCHRONIZING"?<div onClick={this.copyURL}>Sync room ID (click here to copy): {getSyncId()}</div>:null}
          </div>
          <div className="log-download material-wrapper clickable" onClick={_=>downloadLogs(this.props.qsls)}>
            download log as textfile<i className="material-icons">cloud_download</i>
          </div>
          <a href="http://contest.jarl.org/summarymaker.htm">And then, you can create log sheet here.</a>
        </div>
      </div>
    );
  }

  createSyncDialog() {
    return (<div className="dialog sync">
      <div className="dialog-content">
        <h2>Enter sync room ID</h2>
        <p>When sync room ID is blank, it will create new one!</p>
        <label htmlFor="sync-room-id">Sync room ID:</label>
        <input type="text" placeholder="sync ID" id="sync-room-id"/>
        <button onClick={this.startSync}>Connect!</button>
        <button onClick={_=>this.setState({sync_state: undefined})}>Cancel</button>
      </div>
    </div>);
  }
  
  createUnsyncDialog() {
    return (<div className="dialog sync">
      <div className="dialog-content">
        <h2>Do you want to disconnect from sync room?</h2>
        <button onClick={_=>{location.hash="",location.reload()}}>Yes, now</button>
        <button onClick={_=>this.setState({sync_state: "SYNCHRONIZING"})}>No thanks</button>
      </div>
    </div>);
  }
// #endregion
}

export default connectWith(App);
