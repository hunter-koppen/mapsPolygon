import { Component, createElement } from "react";

import { MapContainer } from "./components/MapContainer";
import "./ui/MapsPolygon.css";

export class MapsPolygon extends Component {
    render() {
        return (
            <MapContainer
                googleKey={this.props.googleKey}
                polygonList={this.props.polygonList}
                coordinates={this.props.coordinates}
                onClickPolygon={this.props.onClickPolygon}
                fillColor={this.props.fillColor}
                fillOpacity={this.props.fillOpacity}
                strokeColor={this.props.strokeColor}
                strokeOpacity={this.props.strokeOpacity}
                strokeWeight={this.props.strokeWeight}
                polygonLabel={this.props.polygonLabel}
                labelColor={this.props.labelColor}
                labelSize={this.props.labelSize}
                labelClass={this.props.labelClass}
                styleArray={this.props.styleArray}
            />
        );
    }
}
