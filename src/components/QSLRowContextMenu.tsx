import React, { Component } from "react";
import QSLRow from "./QSLRow";
import { tl } from "../multilingual";

interface Props {
  row: QSLRow;
  pos: {x:number, y:number};
}

interface State {
  remarks?: boolean;
}

class QSLRowContextMenu extends Component<Props, State> {
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
        {this.state.remarks?null:null}
      </div>);
  }

  getStyle() {
    if(getComputedStyle(document.body).getPropertyValue("--is-mobile") === "yes") {
      return {};
    }
    return {left: this.props.pos.x, top: this.props.pos.y};
  }

  close() { this.props.row.setState({contextMenu: undefined}) }
}

export default QSLRowContextMenu;
