import React, { Component } from "react";
import QSLRow from "./QSLRow";
import { tl } from "../multilingual";

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
        </div>
      </div>);
  }

  getStyle() {
    if(getComputedStyle(document.body).getPropertyValue("--is-mobile") === "yes") {
      return {};
    }
    return {left: this.props.pos.x, top: this.props.pos.y};
  }

  startHover() { this.hovering = true; }

  endHover() { this.hovering = false; }

  close() { this.props.row.setState({contextMenu: undefined}) }
}

export default QSLRowContextMenu;
