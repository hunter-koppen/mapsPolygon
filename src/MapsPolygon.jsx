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
            />
        );
    }
}
