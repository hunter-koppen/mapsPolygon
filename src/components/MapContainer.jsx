import { Component, createElement } from "react";

import GoogleMapReact from "google-map-react";

export class MapContainer extends Component {
    state = {
        map: null,
        maps: null
    };

    componentDidUpdate(prevProps) {
        // datasource is loaded so we can create the PolygonList
        if (prevProps.polygonList.status === "loading" && this.props.polygonList.status === "available") {
            this.loadData();
        }
    }
    loadData = () => {
        const { map, maps } = this.state;
        if (this.props.polygonList.items && map && maps) {
            let bounds = new maps.LatLngBounds();
            this.props.polygonList.items.forEach(mxObject => {
                const coordinates = this.props.coordinates.get(mxObject).value;
                const coordinatesParsed = JSON.parse(coordinates);
                let paths = [];
                for (let i = 0; i < coordinatesParsed.length; i++) {
                    let gData = new maps.LatLng(
                        parseFloat(coordinatesParsed[i][1]),
                        parseFloat(coordinatesParsed[i][0])
                    );
                    paths.push(gData);
                }
                const polygon = new maps.Polygon({
                    paths: paths,
                    strokeColor: "#FF0000",
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: "#FF0000",
                    fillOpacity: 0.35,
                    id: mxObject.id
                });
                polygon.setMap(map);

                for (var i = 0; i < polygon.getPath().getLength(); i++) {
                    bounds.extend(polygon.getPath().getAt(i));
                }

                maps.event.addListener(polygon, 'click', function (event) {
                    //alert the index of the polygon
                    alert(polygon.id);
                });
            });
            map.fitBounds(bounds);
        }
    };

    handleApiLoaded = (map, maps) => {
        this.setState({ map: map, maps: maps });
    };

    render() {
        const defaultProps = {
            center: {
                lat: 0,
                lng: 0
            },
            zoom: 10
        };
        return (
            <div style={{ height: "600px", width: "800px" }}>
                <GoogleMapReact
                    bootstrapURLKeys={{ key: this.props.googleKey }}
                    defaultCenter={defaultProps.center}
                    defaultZoom={defaultProps.zoom}
                    yesIWantToUseGoogleMapApiInternals
                    onGoogleApiLoaded={({ map, maps }) => this.handleApiLoaded(map, maps)}
                ></GoogleMapReact>
            </div>
        );
    }
}
