import React, { Component } from 'react';

import { QSL, RadioMode, BandRange } from '../datastore/types'
import { Message } from '../datastore/storetypes';
import QSLRowContextMenu from './QSLRowContextMenu';
import { tl } from '../multilingual';

interface QSLProps {
  qsl?: QSL;
  num: number;
  editQSL?: (index: number, qsl: QSL) => Message;
  deleteQSL?: (index: number) => Message;
}

type CommomState = {
  editing?: "IN-EDITING" | "ERROR-IN-EDITING";
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

  componentWillReceiveProps(nextProps: QSLProps, nextContext: any) {
    super.componentWillReceiveProps?super.componentWillReceiveProps(nextProps, nextContext):null;
    this.setState({pqsl: nextProps.qsl || null});
  }

  render() {
    if(!isBodyState(this.state)) {
      return(
        <tr className="qsl-row">
          <th className="date">{tl("Date")}</th>
          <th className="time">{tl("Time")}</th>
          <th className="call-sign">{tl("His Callsign")}</th>
          <th className="qth">{tl("His QTH")}</th>
          <th className="op">{tl("His Operator")}</th>
          <th className="call-sign">{tl("My Callsign")}</th>
          <th className="qth">{tl("My QTH")}</th>
          <th className="op">{tl("My Operator")}</th>
          <th className="his-ctn">{tl("His RST/Context Number")}</th>
          <th className="my-ctn">{tl("My RST/Context Number")}</th>
          <th className="band">{tl("Band")}</th>
          <th className="mode">{tl("Mode")}</th>
          <th className="has-remarks">{tl("Has Remarks")}</th>
        </tr>
      );
    }
    let qsl = this.state.pqsl;
    qsl.date = new Date(qsl.date);
    if(!this.state.editing) {
      return (
        <tr
          className="qsl-row"
          onClick={this.onClick}>
          <td className="date">{qsl.date.toLocaleDateString()}</td>
          <td className="time">
            {(it=>`${it.getHours().toString().padStart(2, '0')}:${it.getMinutes().toString().padStart(2, '0')}`)(qsl.date)}
          </td>
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
          <td>{qsl.remarks?'○':'×'}</td>
        </tr>
      );
    }
    return (
      <tr className={"qsl-row"+(this.state.editing==="ERROR-IN-EDITING"?" errored":"")} onKeyDown={this.onKeyDown}>
        <td className="date">{qsl.date.toLocaleDateString()}</td>
        <td className="time">
          {(it=>`${it.getHours().toString().padStart(2, '0')}:${it.getMinutes().toString().padStart(2, '0')}`)(qsl.date)}
        </td>
        <td className="call-sign">
          <input
            type="text"
            value={qsl.his}
            onChange={e=>(this.forceUpdate(),(this.state.pqsl as any).his = e.target.value)}/>
        </td>
        <td className="qth">
          <input
            type="text"
            onChange={e=>(this.forceUpdate(),(this.state.pqsl as any).his_qth = e.target.value)}
            value={qsl.his_qth || ''}/>
        </td>
        <td className="op">
          <input
            type="text"
            onChange={e=>(this.forceUpdate(),(this.state.pqsl as any).his_op = e.target.value)}
            value={qsl.his_op || ''}/>
        </td>
        <td className="call-sign">
          <input
            type="text"
            onChange={e=>(this.forceUpdate(),(this.state.pqsl as any).my = e.target.value)}
            value={qsl.my}/>
        </td>
        <td className="qth">
          <input
            type="text"
            onChange={e=>(this.forceUpdate(),(this.state.pqsl as any).my_qth = e.target.value)}
            value={qsl.my_qth || ''}/>
        </td>
        <td className="op">
          <input
            type="text"
            onChange={e=>(this.forceUpdate(),(this.state.pqsl as any).my_op = e.target.value)}
            value={qsl.my_op || ''}/>
        </td>
        <th className="his-ctn">
          <input
            type="text"
            value={qsl.his_no || ''}
            onChange={e=>(this.forceUpdate(),(this.state.pqsl as any).his_no = e.target.value)}/>
        </th>
        <th className="my-ctn">
          <input
            type="text"
            value={qsl.my_no || ''}
            onChange={e=>(this.forceUpdate(),(this.state.pqsl as any).my_no = e.target.value)}/>
        </th>
        <td className="band">
          <input
            type="text"
            onChange={this.onBandChanged}
            value={(typeof this.state.t_band !== 'undefined' && this.state.t_band) || ((qsl.band.frequency||'') + qsl.band.range)}/>
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
        <td>{qsl.remarks?'○':'×'}</td>
      </tr>
    );
  }

  remove = () => {
    if(!this.props.deleteQSL) return;
    if(!confirm(tl("Are you sure to delete this log?"))) return;
    this.props.deleteQSL(this.props.num);
  }

  updateRemarkes = (new_remarks: string) => {
    if(this.state.pqsl && this.props.editQSL)
      this.props.editQSL(this.props.num, Object.assign(this.state.pqsl, {remarks: new_remarks}));
  }

  onKeyDown = (evt: React.KeyboardEvent<HTMLElement>) => {
    if(evt.key !== "Enter") return;
    if(!this.state.t_band || (this.props.qsl || {band: {frequency: 0}}).band.frequency != 0) {
      this.setState(() => ({editing: undefined}));
      if(this.props.editQSL && this.props.qsl && isBodyState(this.state)) {
        let qsl = Object.assign(this.state.pqsl, {
          my: this.state.pqsl.my.toUpperCase(),
          his: this.state.pqsl.his.toUpperCase(),
          my_no: (this.state.pqsl.my_no||'').toUpperCase(),
          his_no: (this.state.pqsl.his_no||'').toUpperCase()
        }) as QSL;
        this.props.editQSL(this.props.num, qsl);
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
    this.setState({contextMenu: {x: evt.pageX, y: evt.pageY}});
  }

  onBandChanged = (evt: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({t_band: evt.target.value})
    if(this.props.qsl) {
      if(this.props.qsl.his_no){
        let m = evt.target.value.match(/([0-9]*(?:\.[0-9]+)?)([kMGT]?Hz)/);
        if(m) {
          console.log(m);
          this.props.qsl.band.frequency = parseInt(m[1]) || 0;
          this.props.qsl.band.range = m[2] as BandRange
          this.setState({t_band: undefined})
        }
      }
      this.forceUpdate();
    }
  }
}

export default QSLRow;
