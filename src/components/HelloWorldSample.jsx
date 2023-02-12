import { Component, createElement } from "react";

import GoogleMapReact from "google-map-react";

export class HelloWorldSample extends Component {
    
    render() {
        const defaultProps = {
            center: {
              lat: 10.99835602,
              lng: 77.01502627
            },
            zoom: 11
          };
        return (
            <div style={{ height: "600px", width: "800px" }}>
                <GoogleMapReact
                    bootstrapURLKeys={{ key: "AIzaSyDV9WEiFQF3VEX1H2Yjg64Pahbv78aaJig" }}
                    defaultCenter={defaultProps.center}
                    defaultZoom={defaultProps.zoom}
                ></GoogleMapReact>
            </div>
        );
    }
}
