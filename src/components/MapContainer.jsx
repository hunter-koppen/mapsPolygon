import { Component, createElement } from "react";

import GoogleMapReact from "google-map-react";

export class MapContainer extends Component {
    state = {
        loaded: false,
        map: null,
        maps: null,
        polygons: []
    };

    componentDidUpdate(prevProps) {
        if (
            !this.state.loaded &&
            this.props.polygonList.status === "available" &&
            this.state.map &&
            this.state.maps
        ) {
            this.loadData(false);
        } else if (prevProps.polygonList.items !== this.props.polygonList.items) {
            this.loadData(true);
        }
    }

    loadData = reload => {
        const { map, maps } = this.state;
        if (this.props.polygonList.items && map && maps) {
            const polygons = [];

            this.props.polygonList.items.forEach(mxObject => {
                const polygon = this.createPolygon(mxObject, maps);
                if (polygon) {
                    polygon.setMap(map);
                    polygons.push(polygon);
                }
            });

            if (reload) {
                this.clearPolygons();
            } else {
                this.resizeMap(polygons, maps, map);
                this.setState({
                    loaded: true
                });
            }

            this.setState({
                polygons: polygons
            });
        }
    };

    createPolygon = (mxObject, maps) => {
        const {
            strokeColor,
            strokeOpacity,
            strokeWeight,
            fillColor,
            fillOpacity,
            polygonList,
            coordinates,
            onClickPolygon
        } = this.props;
        try {
            const coordinatesValue = JSON.parse(coordinates.get(mxObject).value);
            const paths = [];

            for (let i = 0; i < coordinatesValue.length; i++) {
                const newPath = new maps.LatLng(parseFloat(coordinatesValue[i][1]), parseFloat(coordinatesValue[i][0]));
                paths.push(newPath);
            }

            const polygon = new maps.Polygon({
                paths: paths,
                strokeColor: strokeColor ? strokeColor.get(mxObject).value : "#FFFFFF",
                strokeOpacity: strokeOpacity ? strokeOpacity.get(mxObject).value : 0.8,
                strokeWeight: strokeWeight ? strokeWeight.get(mxObject).value : 2,
                fillColor: fillColor ? fillColor.get(mxObject).value : "#F9B20B",
                fillOpacity: fillOpacity ? fillOpacity.get(mxObject).value : 0.5,
                id: mxObject.id
            });

            maps.event.addListener(polygon, "click", event => {
                if (onClickPolygon && polygon) {
                    const mxObjectClicked = polygonList.items.find(poly => poly.id === polygon.id);
                    if (mxObjectClicked) {
                        onClickPolygon(mxObjectClicked).execute();
                    }
                }
            });
            return polygon;
        } catch (error) {
            console.log(error);
            return null;
        }
    };

    clearPolygons = () => {
        const { maps, polygons } = this.state;
        if (maps) {
            polygons.forEach(polygon => {
                polygon.setMap(null);
            });
        }
    };

    resizeMap = (polygons, maps, map) => {
        const bounds = new maps.LatLngBounds();
        polygons.forEach(polygon => {
            polygon.getPath().forEach(path => {
                bounds.extend(path);
            });
        });
        map.fitBounds(bounds);
    };

    handleApiLoaded = (map, maps) => {
        this.setState({ map: map, maps: maps });

        // add map options once the google API is loaded
        if (this.props.styleArray && this.props.styleArray !== "") {
            const mapOptions = {
                styles: JSON.parse(this.props.styleArray)
              };
            map.setOptions(mapOptions);
        }
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
