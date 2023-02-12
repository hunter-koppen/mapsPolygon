import { Component, createElement } from "react";

import GoogleMapReact from "google-map-react";

export class MapContainer extends Component {
    render() {
        const handleApiLoaded = (map, maps) => {
            const triangleCoords = [
                { lat: 25.774, lng: -80.19 },
                { lat: 18.466, lng: -66.118 },
                { lat: 32.321, lng: -64.757 },
                { lat: 25.774, lng: -80.19 }
            ];

            var bermudaTriangle = new maps.Polygon({
                paths: triangleCoords,
                strokeColor: "#FF0000",
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: "#FF0000",
                fillOpacity: 0.35
            });
            bermudaTriangle.setMap(map);
        };
        const defaultProps = {
            center: {
                lat: 25.77,
                lng: -80.19
            },
            zoom: 5
        };
        return (
            <div style={{ height: "600px", width: "800px" }}>
                <GoogleMapReact
                    bootstrapURLKeys={{ key: this.props.googleKey }}
                    defaultCenter={defaultProps.center}
                    defaultZoom={defaultProps.zoom}
                    yesIWantToUseGoogleMapApiInternals
                    onGoogleApiLoaded={({ map, maps }) => handleApiLoaded(map, maps)}
                ></GoogleMapReact>
            </div>
        );
    }
}
