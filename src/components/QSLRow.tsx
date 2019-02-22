import React, { Component } from 'react';

import { QSL } from '../datastore/types'

type QSLProps = {
  qsl?: QSL
}

class QSLRow extends Component<QSLProps> {
  render() {
    let qsl = this.props.qsl;
    if(!qsl) {
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
          <th className="his-rst">His RST</th>
          <th className="his-no">His context number</th>
          <th className="my-rst">My RST</th>
          <th className="his-no">My context number</th>
          <th className="band">Band</th>
          <th className="mode">Mode</th>
        </tr>
      );
    }
    let his = (qsl.his_no || '').match(/([1-5][1-9]{1,2})(\d{2}[K-N])/) || ['-', '-', '-'];
    let my = (qsl.my_no || '').match(/([1-5][1-9]{1,2})(\d{2}[K-N])/) || ['-', '-', '-'];
    return (
      <tr className="qsl-row" onContextMenu={this.showContextMenu}>
        <td className="date">{qsl.date.toLocaleDateString()}</td>
        <td className="time">{qsl.date.toLocaleTimeString()}</td>
        <td className="call-sign">{qsl.his}</td>
        <td className="qth">{qsl.his_qth || '-'}</td>
        <td className="op">{qsl.his_op || '-'}</td>
        <td className="call-sign">{qsl.my}</td>
        <td className="qth">{qsl.my_qth || '-'}</td>
        <td className="op">{qsl.my_op || '-'}</td>
        <td className="his-rst">{his[1]}</td>
        <td className="his-no">{his[2]}</td>
        <td className="my-rst">{my[1]}</td>
        <td className="his-no">{my[2]}</td>
        <td className="band">{qsl.band.frequency}{qsl.band.range}</td>
        <td className="mode">{qsl.mode}</td>
      </tr>
    );
  }

  format() {
    let qsl = this.props.qsl;
    if(qsl) {
      let his = (qsl.his_no || '').match(/([1-5][1-9]{1,2})(\d{2}[K-N])/);
      let my = (qsl.my_no || '').match(/([1-5][1-9]{1,2})(\d{2}[K-N])/);
      if(!my || !his) return '';
      return `${qsl.date.toLocaleDateString()} ${qsl.date.toLocaleTimeString()} ${qsl.band.frequency} ${qsl.mode} ${qsl.his} ${his[1]} ${his[2]} ${my[1]} ${my[2]}\n`;
    }
  }

  showContextMenu(event: React.MouseEvent<HTMLTableRowElement, MouseEvent>) {
    event.stopPropagation();
    event.preventDefault();
  }
}

export default QSLRow;
