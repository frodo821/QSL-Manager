import React, { Component } from "react";
import QSLRow from "./QSLRow";
import { tl } from "../multilingual";
import { isMobile } from "../utils";

interface Props {
  row: QSLRow;
  pos: {x:number, y:number};
}

interface State {
  remarks: boolean;
  editing_remarks: boolean;
}

class QSLRowContextMenu extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      remarks: false,
      editing_remarks: false
    };
  }

  render() {
    return (
      <div
        className="contextmenu"
        onClick={e=>e.stopPropagation()}
        onPointerDown={e=>(e.stopPropagation(),this.close())}>
        <div
          className="clicktrap"
          style={this.getStyle()}>
          <p
            className="clickable"
            onPointerDown={e=>e.stopPropagation()}
            onClick={e=>(e.stopPropagation(),this.props.row.remove(),this.close())}>
            {tl("Delete")}
          </p>
          <p
            className="clickable"
            onPointerDown={e=>e.stopPropagation()}
            onClick={e=>(e.stopPropagation(),this.props.row.setState({editing: "IN-EDITING"}),this.close())}>
            {tl("Edit")}
          </p>
          <p
            className="clickable"
            onPointerDown={e=>e.stopPropagation()}
            onClick={e=>(e.stopPropagation(),this.setState({remarks: true}))}>
            {tl("Show remarks")}
          </p>
          {isMobile()?<p
            className="clickable"
            onPointerDown={e=>e.stopPropagation()}
            onClick={e=>(e.stopPropagation(),this.close())}>
            {tl("Close Menu")}
          </p>:null}
        </div>
        {this.state.remarks?this.showRemarks():null}
      </div>);
  }

  getStyle() {
    if(isMobile()) {
      return;
    }
    return {left: this.props.pos.x, top: this.props.pos.y};
  }

  showRemarks() {
    return (
      <div className="dialog" onPointerDown={_=>this.setState({remarks: false, editing_remarks: false})}>
        <div className="dialog-content" onPointerDown={e=>e.stopPropagation()}>
          <div>
            <i className="material-icons close clickable no-underline"
               onClick={e=>this.setState({remarks: false, editing_remarks: false})}>close</i>
          </div>
          <h2>{tl("remarks")}</h2>
          {this.state.editing_remarks?
            this.remarksEditor():
            <p>{(this.props.row.state.pqsl||{remarks:tl('No remarks are provided.')}).remarks}</p>}
          <div>
            <i onClick={_=>{this.setState({editing_remarks: true})}}
               style={!this.state.editing_remarks?{display: 'initial'}:{display: 'none'}}
               className="material-icons clickable no-underline">edit</i>
          </div>
        </div>
      </div>)
  }

  remarksEditor() {
    return (
      <div className="remarks">
        <div>
          <input
            className="remarks-editor"
            id="remarks-input-box"
            type="text"
            onKeyDown={e=>e.key==="Enter"&&this.editDone()}
            defaultValue={(this.props.row.state.pqsl||{remarks: ''}).remarks}/>
          </div>
        <div>
          <i onClick={_=>this.editDone()}
             className="material-icons clickable no-underline">done</i>
        </div>
      </div>);
  }

  editDone = () => {
    let rem = document.getElementById('remarks-input-box') as HTMLInputElement;
    this.props.row.updateRemarkes(rem.value);
    this.setState({editing_remarks: false});
  }

  close() { this.props.row.setState({contextMenu: undefined}) }
}

export default QSLRowContextMenu;
