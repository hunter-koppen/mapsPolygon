import { Component, createElement } from "react";

import { HelloWorldSample } from "./components/HelloWorldSample";
import "./ui/MapsPolygon.css";

export class MapsPolygon extends Component {
    render() {
        return <HelloWorldSample sampleText={this.props.sampleText} />;
    }
}
