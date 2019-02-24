import React, { Component } from 'react';
import QSLRow from './components/QSLRow';
import { ActionDispatcher, State } from "./datastore/storetypes";
import './styles/app.scss';
import { connectWith } from './datastore/store';
import { QSL } from './datastore/types';

type IntrinsicState = {
  contextMenuOpened?: boolean;
  input_msg?: {
    content: string,
    type: "error" | "info" | "warn"
  };
  t_freq?: string;
  forms_hidden?: boolean;
  sync_state?: "REQUESTED" | "SYNCHRONIZING"
  attrs: {[key: string]: string}
}

type Props = State & ActionDispatcher;

class App extends Component<Props, IntrinsicState> {
  my: React.RefObject<HTMLInputElement>;
  my_qth: React.RefObject<HTMLInputElement>;
  my_op: React.RefObject<HTMLInputElement>;
  frequency: React.RefObject<HTMLInputElement>;
  freq_range: React.RefObject<HTMLSelectElement>;
  rad_mode: React.RefObject<HTMLSelectElement>;
  remarks: React.RefObject<HTMLInputElement>;
  my_no: React.RefObject<HTMLInputElement>;

  constructor(props: Props) {
    super(props);
    (window as any).app_root = this;
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
  }

  componentDidMount() {
    let id = this.getSyncId();
    console.log(id);
    if(id) {
    }
  }

  getSyncId() : string | null {
    if(!this.state.attrs.hasOwnProperty('sync'))
      return null;
    return this.state.attrs.sync;
  }

  componentDidUpdate(_: Props, prev: IntrinsicState) {
    if(this.state.input_msg && prev.input_msg != this.state.input_msg) {
      setTimeout(()=>{
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
    this.props.editQSLmy(Object.assign(this.props.myqsl, {his_no: event.target.value}));
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
      this.setState({
        input_msg: {
          content: "QSL log successfully registered.",
          type: "info"
        }
      });
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
      my: (this.my.current || {value: ''}).value,
      my_qth: (this.my_qth.current || {value: ''}).value,
      my_op: (this.my_op.current || {value: ''}).value,
      my_no: (this.my_no.current || {value: ''}).value,
      remarks: (this.remarks.current || {value: ''}).value,
      date: new Date()
    }, this.props.myqsl);
    try{
      this.props.addQSL(nqsl);
      this.setState({input_msg: {content: "QSL log successfully registered.", type: "info"}});
    }catch(e) {
      this.setState({input_msg: {content: e, type: "error"}});
      return;
    }
    (this.my.current || {value: ''}).value = '';
    (this.my_qth.current || {value: ''}).value = '';
    (this.my_op.current || {value: ''}).value = '';
    (this.my_no.current || {value: ''}).value = '';
    (this.remarks.current || {value: ''}).value = '';
  }

  syncRequested = (_: React.MouseEvent<HTMLElement>) => {
    if(typeof this.state.sync_state !== "undefined")
      return;
    this.setState({sync_state: "REQUESTED"});
  }

  startSync = () => {
    let syncId = ((document.getElementById("sync-room-id") as HTMLInputElement | null) || {value: ''}).value
    this.setState({sync_state: "SYNCHRONIZING"});
  }
  // #endregion

// #region Create virtual-DOMs
  render() {
    return (
      <div className="App">
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
        {this.state.sync_state==="REQUESTED"?this.createSyncDialog():null}
        {!this.state.forms_hidden?this.createForm():null}
      </div>
    );
  }

  createForm() {
    return (
      <form onSubmit={this.onSubmitForm} id="qsl-form">
        <div className={"qsl-msg "+(this.state.input_msg?this.state.input_msg.type:'hidden')}>
          {this.state.input_msg?this.state.input_msg.content:null}
        </div>
        <div className="radio">
          <input
            required={true}
            type="text"
            onChange={this.changeMyCS}
            onKeyDown={this.dispatchKeydown}
            value={this.props.myqsl.his}
            tabIndex={1}
            placeholder="His call sign (I sent)"
            pattern="(J[A-S]|[78][J-N])([0-9])([0-9A-Z]{2,3}(?:/[0-9])?)"/>
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
            value={this.props.myqsl.his_no || ''}
            placeholder="His contest number (I sent)"
            pattern="[1-5][1-9]{1,2}\d{2}[K-N]"/>
          <input
            required={true}
            type="text"
            ref={this.my}
            onKeyDown={this.dispatchKeydown}
            tabIndex={4}
            placeholder="My call sign (he sent)"
            onChange={_=>{let it = (this.my.current||{value: ''});it.value = it.value.toUpperCase()}}
            pattern="(J[A-S]|[78][J-N])([0-9])([0-9A-Z]{2,3}(?:/[0-9])?)"/>
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
            placeholder="My contest number (he sent)"
            pattern="[1-5][1-9]{1,2}\d{2}[K-N]"/>
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
          <div id="forms-toggle">
            <input
              type="checkbox"
              id="forms-shown"
              checked={!!this.state.forms_hidden}
              onChange={e=>this.setState({forms_hidden: e.target.checked})}/>
            <label htmlFor="forms-shown">
              {this.state.forms_hidden?"Open form":"Close form"}
            </label>
          </div>
          <div className={
            "sync-button "+
            (this.state.sync_state?this.state.sync_state==="SYNCHRONIZING"?"synchronizing":"pending":"not-sync")}
            onClick={this.syncRequested}></div>
        </div>
      </header>)
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
// #endregion
}

export default connectWith(App);
