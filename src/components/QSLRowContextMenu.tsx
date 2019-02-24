import React, { Component } from "react";
import QSLRow from "./QSLRow";

interface Props {
  row: QSLRow
  pos: {x:number, y:number}
}

class QSLRowContextMenu extends Component<Props> {
  hovering: boolean = false;

  render() {
    return (
      <div
        className="contextmenu"
        onClick={e=>e.stopPropagation()}
        onPointerDown={e=>(e.stopPropagation(),this.close())}>
        <div
          className="clicktrap"
          style={{left: this.props.pos.x, top: this.props.pos.y}}>
          <p
            onPointerDown={e=>e.stopPropagation()}
            onClick={e=>(e.stopPropagation(),this.props.row.remove(),this.close())}>
            Delete
          </p>
          <p
            onPointerDown={e=>e.stopPropagation()}
            onClick={e=>(e.stopPropagation(),this.props.row.setState({editing: "IN-EDITING"}),this.close())}>
            Edit
          </p>
        </div>
      </div>);
  }

  startHover() { this.hovering = true; }

  endHover() { this.hovering = false; }

  close() { this.props.row.setState({contextMenu: undefined}) }
}

export default QSLRowContextMenu;
