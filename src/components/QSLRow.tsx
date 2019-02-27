import React, { Component } from 'react';

import { QSL, RadioMode, BandRange } from '../datastore/types'
import { Message } from '../datastore/storetypes';
import QSLRowContextMenu from './QSLRowContextMenu';

interface QSLProps {
  qsl?: QSL;
  num: number;
  editQSL?: (index: number, qsl: QSL) => Message;
  deleteQSL?: (index: number) => Message;
}

type CommomState = {
  editing?: "IN-EDITING" | "ERROR-IN-EDITING";
  vaild?: number;
  t_band?: string;
  contextMenu?: {x: number, y: number};
}

type BodyState = { pqsl: QSL };

type HeadState = { pqsl: null };


type OwnState = CommomState & (BodyState | HeadState);

const isBodyState = (state: OwnState): state is BodyState => state.pqsl !== null

class QSLRow extends Component<QSLProps, OwnState> {
  constructor(props: QSLProps) {
    super(props);
    this.state = {pqsl: this.props.qsl?Object.assign({}, this.props.qsl):null} as OwnState;
  }
  render() {
    if(!isBodyState(this.state)) {
      return(
        <tr className="qsl-row">
          <th className="date">Date</th>
          <th className="time">Time</th>
          <th className="call-sign">His Callsign</th>
          <th className="qth">His QTH</th>
          <th className="op">His Operator</th>
          <th className="call-sign">My Callsign</th>
          <th className="qth">My QTH</th>
          <th className="op">My Operator</th>
          <th className="his-ctn">His RST/Context Number</th>
          <th className="my-ctn">My RST/Context Number</th>
          <th className="band">Band</th>
          <th className="mode">Mode</th>
        </tr>
      );
    }
    let qsl = this.state.pqsl;
    qsl.date = new Date(qsl.date);
    if(!this.state.editing) {
      return (
        <tr
          className="qsl-row"
          onClick={this.onClick}
          onContextMenu={e=>(e.preventDefault(),this.setState({contextMenu: {x: e.pageX, y: e.pageY}}))}>
          <td className="date">{qsl.date.toLocaleDateString()}</td>
          <td className="time">{(it=>`${it.getHours()}:${it.getMinutes()}`)(qsl.date)}</td>
          <td className="call-sign">{qsl.his}</td>
          <td className="qth">{qsl.his_qth || '-'}</td>
          <td className="op">{qsl.his_op || '-'}</td>
          <td className="call-sign">{qsl.my}</td>
          <td className="qth">{qsl.my_qth || '-'}</td>
          <td className="op">{qsl.my_op || '-'}</td>
          <td className="his-ctn">{qsl.his_no || '-'}</td>
          <td className="my-ctn">{qsl.my_no || '-'}</td>
          <td className="band">{qsl.band.frequency}{qsl.band.range}</td>
          <td className="mode">
            {qsl.mode}
            {this.state&&this.state.contextMenu?<QSLRowContextMenu row={this} pos={this.state.contextMenu} />:null}
          </td>
        </tr>
      );
    }
    return (
      <tr className={"qsl-row"+(this.state.editing==="ERROR-IN-EDITING"?" errored":"")} onKeyDown={this.onKeyDown}>
        <td className="date">{qsl.date.toLocaleDateString()}</td>
        <td className="time">{(it=>`${it.getHours()}:${it.getMinutes()}`)(qsl.date)}</td>
        <td className="call-sign">
          <input
            type="text"
            value={qsl.his}
            onChange={e=>(this.forceUpdate(),this.vaildate(e.target,0),(this.state.pqsl as any).his = e.target.value)}
            pattern="(J[A-S]|[78][J-N])([0-9])([0-9A-Z]{2,3}(?:/[0-9])?)"/>
        </td>
        <td className="qth">
          <input
            type="text"
            onChange={e=>(this.forceUpdate(),this.vaildate(e.target,1),(this.state.pqsl as any).his_qth = e.target.value)}
            value={qsl.his_qth || ''}/>
        </td>
        <td className="op">
          <input
            type="text"
            onChange={e=>(this.forceUpdate(),this.vaildate(e.target,2),(this.state.pqsl as any).his_op = e.target.value)}
            value={qsl.his_op || ''}/>
        </td>
        <td className="call-sign">
          <input
            type="text"
            onChange={e=>(this.forceUpdate(),this.vaildate(e.target,3),(this.state.pqsl as any).my = e.target.value)}
            pattern="(J[A-S]|[78][J-N])([0-9])([0-9A-Z]{2,3}(?:/[0-9])?)"
            value={qsl.my}/>
        </td>
        <td className="qth">
          <input
            type="text"
            onChange={e=>(this.forceUpdate(),this.vaildate(e.target,4),(this.state.pqsl as any).my_qth = e.target.value)}
            value={qsl.my_qth || ''}/>
        </td>
        <td className="op">
          <input
            type="text"
            onChange={e=>(this.forceUpdate(),this.vaildate(e.target,5),(this.state.pqsl as any).my_op = e.target.value)}
            value={qsl.my_op || ''}/>
        </td>
        <th className="his-ctn">
          <input
            type="text"
            value={qsl.his_no || ''}
            onChange={e=>(this.forceUpdate(),this.vaildate(e.target,6),(this.state.pqsl as any).his_no = e.target.value)}
            pattern="[1-5][1-9]{1,2}\d{2}[K-N]"/>
        </th>
        <th className="my-ctn">
          <input
            type="text"
            value={qsl.my_no || ''}
            onChange={e=>(this.forceUpdate(),this.vaildate(e.target,7),(this.state.pqsl as any).my_no = e.target.value)}
            pattern="[1-5][1-9]{1,2}\d{2}[K-N]"/>
        </th>
        <td className="band">
          <input
            type="text"
            pattern="[0-9]*(?:.[0-9]*)?[kMGT]?Hz"
            onChange={this.onBandChanged}
            value={(typeof this.state.t_band !== 'undefined' && this.state.t_band) || (qsl.band.frequency + qsl.band.range)}/>
        </td>
        <td className="mode">
          <select
            id="rad-mode"
            onChange={e=>(this.forceUpdate(),(this.state.pqsl as any).mode = e.target.value as RadioMode)}
            value={qsl.mode}>
            <optgroup label="voice">
              <option>AM</option>
              <option>FM</option>
              <option>SSB</option>
            </optgroup>
            <option>CW</option>
          </select>
          <div className="delete"></div>
          {this.state&&this.state.contextMenu?<QSLRowContextMenu row={this} pos={this.state.contextMenu} />:null}
        </td>
      </tr>
    );
  }

  vaildate(elem: HTMLInputElement, key: number) {
    let pattern = elem.getAttribute('pattern');
    if(pattern) {
      let m = elem.value.match(new RegExp(`^${pattern}$`));
      if(typeof this.state.vaild !== "undefined") {
        if(m !== null) {
          this.setState({vaild: (1<<key)^this.state.vaild});
        } else {
          this.setState({vaild: (1<<key)|this.state.vaild});
        }
      } else {
        this.setState({vaild: m?1<<key:0});
      }
    }
  }

  remove = () => {
    if(!this.props.deleteQSL) return;
    if(!confirm("Are you sure to delete this log?")) return;
    this.props.deleteQSL(this.props.num);
  }

  onKeyDown = (evt: React.KeyboardEvent<HTMLElement>) => {
    if(evt.key !== "Enter") return;
    if(!this.state.t_band && !this.state.vaild) {
      this.setState(() => ({editing: undefined}));
      if(this.props.editQSL && this.props.qsl && isBodyState(this.state)) {
        this.props.editQSL(this.props.num, this.state.pqsl);
      }
    } else {
      this.setState(() => ({editing: "ERROR-IN-EDITING"}));
    }
    evt.stopPropagation();
    evt.preventDefault();
  }

  onClick = (evt: React.MouseEvent<HTMLElement, MouseEvent>) => {
    evt.preventDefault();
    evt.stopPropagation();
    (window as any).editing = this;
    this.setState(() => ({editing: "IN-EDITING"}));
  }

  onBandChanged = (evt: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({t_band: evt.target.value})
    if(this.props.qsl) {
      if(this.props.qsl.his_no){
        let m = evt.target.value.match(/([0-9]*(?:\.[0-9]*)?)([kMGT]?Hz)/);
        if(m) {
          console.log(m);
          this.props.qsl.band.frequency = parseInt(m[1]) || 7;
          this.props.qsl.band.range = m[2] as BandRange
          this.setState({t_band: undefined})
        }
      }
      this.forceUpdate();
    }
  }
}

export default QSLRow;
