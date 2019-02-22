import React, { Component } from 'react';
import QSLRow from './components/QSLRow';
import { ActionDispatcher, State } from "./datastore/storetypes";
import './styles/app.scss';
import { connectWith } from './datastore/store';
import { QSL } from './datastore/types';

type Props = State & ActionDispatcher;

class App extends Component<Props> {
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
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
        </header>
        <main>
          <table className="qsl-table">
            <caption>QSL Logs</caption>
            <tbody>
              <QSLRow />
              {this.props.qsls.map(qsl=><QSLRow qsl={qsl} />)}
            </tbody>
          </table>
        </main>
        {this.createForm()}
      </div>
    );
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
    let val = parseInt(event.target.value)
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
// #endregion

  onSubmitForm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    let nqsl: QSL = Object.assign({
      my: (this.my.current || {value: ''}).value,
      my_qth: (this.my_qth.current || {value: ''}).value,
      my_op: (this.my_op.current || {value: ''}).value,
      my_no: (this.my_no.current || {value: ''}).value,
      remarks: (this.remarks.current || {value: ''}).value,
      date: new Date()
    }, this.props.myqsl);
    (this.my.current || {value: ''}).value = '';
    (this.my_qth.current || {value: ''}).value = '';
    (this.my_op.current || {value: ''}).value = '';
    (this.my_no.current || {value: ''}).value = '';
    (this.remarks.current || {value: ''}).value = '';
    try{
      this.props.addQSL(nqsl);
    }catch(e) {
      console.log(e.message);
    }
    this.forceUpdate();
  }

  createForm() {
    return (
      <form onSubmit={this.onSubmitForm}>
        <div className="radio">
          <input
            type="text"
            onChange={this.changeMyCS}
            value={this.props.myqsl.his}
            placeholder="His call sign (I sent)"
            pattern="(J[A-S]|[78][J-N])([0-9])([0-9A-Z]{2,3}(?:/[0-9])?)"/>
          <input
            type="text"
            onChange={this.changeMyQTH}
            value={this.props.myqsl.his_qth || ''}
            placeholder="His QTH (I sent)"/>
          <input
            type="text"
            onChange={this.changeMyOP}
            value={this.props.myqsl.his_op || ''}
            placeholder="His operator (I sent)"/>
          <input
            type="text"
            onChange={this.changeMyCnum}
            value={this.props.myqsl.his_no || ''}
            placeholder="His contest number (I sent)"
            pattern="[1-5][1-9]{1,2}\d{2}[K-N]"/>
          <input
            type="text"
            ref={this.my}
            placeholder="My call sign (he sent)"
            onChange={_=>{let it = (this.my.current||{value: ''});it.value = it.value.toUpperCase()}}
            pattern="(J[A-S]|[78][J-N])([0-9])([0-9A-Z]{2,3}(?:/[0-9])?)"/>
          <input type="text" ref={this.my_qth} placeholder="My QTH (he sent)"/>
          <input type="text" ref={this.my_op} placeholder="My operator (he sent)"/>
          <input
            type="text"
            ref={this.my_no}
            placeholder="My contest number (he sent)"
            pattern="[1-5][1-9]{1,2}\d{2}[K-N]"/>
        </div>
        <div className="rad-freq-mode">
          <label htmlFor="frequency">Band</label>
          <input
            type="number"
            id="frequency"
            value={this.props.myqsl.band.frequency}
            minLength={2}
            maxLength={3}
            onChange={this.changeBandFreq}/>
          <select
            id="freq-range"
            value={this.props.myqsl.band.range}
            onChange={this.changeBandRange}>
            <option>Hz</option>
            <option>kHz</option>
            <option>MHz</option>
            <option>GHz</option>
            <option>THz</option>
          </select>
          <label htmlFor="rad-mode">Mode</label>
          <select
            id="rad-mode"
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
          id="remarks"
          placeholder="remarks"
          ref={this.remarks}/>
        <input type="submit" value="Add QSL"/>
      </form>)
  }
}

export default connectWith(App);
