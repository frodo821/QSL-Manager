import React, { Component } from "react";
import QSLRow from "./QSLRow";
import { tl } from "../multilingual";

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
            onPointerDown={e=>e.stopPropagation()}
            onClick={e=>(e.stopPropagation(),this.props.row.remove(),this.close())}>
            {tl("Delete")}
          </p>
          <p
            onPointerDown={e=>e.stopPropagation()}
            onClick={e=>(e.stopPropagation(),this.props.row.setState({editing: "IN-EDITING"}),this.close())}>
            {tl("Edit")}
          </p>
          <p
            onPointerDown={e=>e.stopPropagation()}
            onClick={e=>(e.stopPropagation(),this.setState({remarks: true}))}>
            {tl("Show remarks")}
          </p>
        </div>
        {this.state.remarks?this.showRemarks():null}
      </div>);
  }

  getStyle() {
    if(getComputedStyle(document.body).getPropertyValue("--is-mobile").trim() === "yes") {
      return;
    }
    return {left: this.props.pos.x, top: this.props.pos.y};
  }

  showRemarks() {
    return (
      <div className="dialog" onPointerDown={_=>this.setState({remarks: false})}>
        <div className="dialog-content" onPointerDown={e=>e.stopPropagation()}>
          <div>
            <i className="material-icons close"
               onClick={e=>this.setState({remarks: false})}>close</i>
          </div>
          <h2>{tl("remarks")}</h2>
          <p>{(this.props.row.state.pqsl||{remarks:tl('No remarks are provided.')}).remarks}</p>
          <div>
            <i className="material-icons">create</i>
          </div>
        </div>
      </div>)
  }

  close() { this.props.row.setState({contextMenu: undefined}) }
}

export default QSLRowContextMenu;
