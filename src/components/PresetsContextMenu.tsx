import { Component } from "react";
import { Presets, BandPreset } from "../datastore/types";

class PresetDetails extends Component<{preset: BandPreset}> {
  render() {
    return (
      <div className="preset-detail">
        <div className="band">{this.props.preset.frequency}{this.props.preset.range}</div>
        <div className="remarks">{this.props.preset.remarks || "Remarks are not provided."}</div>
      </div>);
  }
}

class PresetMenu extends Component<{name: string, preset: BandPreset}> {
  hovering: boolean = false;

  render() {
    return (
      <div className="preset"
           onClick={this.usePreset}
           onPointerEnter={this.startHover}
           onPointerLeave={this.endHover}>
        <div className="name">{this.props.name}</div>
        { this.hovering ? <PresetDetails preset={this.props.preset} /> : null }
      </div>);
  }

  usePreset() {}

  startHover() { this.hovering = true; }

  endHover() { this.hovering = false; }
}

class PresetsContextMenu extends Component<{presets: Presets}> {
  render() {
    return (
      <div className="context-menu">
        <div className="title">Available presets</div>
        <div className="available-presets">
          {Object.keys(this.props.presets)
                 .map(k=>({key: k, preset: this.props.presets[k]}))
                 .map(v=><PresetMenu name={v.key} preset={v.preset}/>)}
        </div>
      </div>
    )
  }
}

export default PresetsContextMenu;
