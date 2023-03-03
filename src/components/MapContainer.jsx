import { Component, createElement } from "react";

import GoogleMapReact from "google-map-react";
import { MarkerClusterer, SuperClusterAlgorithm } from "@googlemaps/markerclusterer";
export class MapContainer extends Component {
    state = {
        loaded: false,
        map: null,
        maps: null,
        polygons: [],
        labels: [],
        labelCluster: null
    };

    componentDidUpdate(prevProps) {
        if (!this.state.loaded && this.props.polygonList.status === "available" && this.state.map && this.state.maps) {
            this.loadData(false);
        } else if (prevProps.polygonList.items !== this.props.polygonList.items) {
            this.loadData(true);
        }
    }

    loadData = reload => {
        const { map, maps } = this.state;
        if (this.props.polygonList.items && map && maps) {
            const polygons = [];
            const labels = [];

            this.props.polygonList.items.forEach(mxObject => {
                const polygon = this.createPolygon(mxObject, maps);
                if (polygon) {
                    if (this.props.polygonLabel) {
                        const markerLabel = this.createLabel(mxObject, polygon, maps);
                        markerLabel.setMap(map);
                        labels.push(markerLabel);
                    }
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
            this.clusterMap(map, labels);
            this.setState({
                polygons: polygons,
                labels: labels
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

    createLabel = (mxObject, polygon, maps) => {
        const bounds = new maps.LatLngBounds();
        polygon.getPath().forEach(path => {
            bounds.extend(path);
        });
        const centroid = bounds.getCenter();

        const markerLabel = new maps.Marker({
            position: centroid,
            label: {
                text: this.props.polygonLabel.get(mxObject).value,
                color: "#FFFFFF",
                fontSize: "12px"
            },
            icon: {
                url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAA1JREFUGFdjyHQt+g8ABFsCIF75EPIAAAAASUVORK5CYII="
            }
        });
        return markerLabel;
    };

    clearPolygons = () => {
        const { maps, polygons, labels } = this.state;
        if (maps) {
            polygons.forEach(polygon => {
                polygon.setMap(null);
            });
            labels.forEach(label => {
                label.setMap(null);
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

    clusterMap = labels => {
        if (labels && this.state.labelCluster) {
            this.state.labelCluster.clearMarkers();
            this.state.labelCluster.addMarkers(labels);
        }
    };

    createClusterer = map => {
        // Create a custom renderer which hides all the cluster icons
        const renderer = {
            render: ({ count, position }) => {
                return new google.maps.Marker({
                    position,
                    icon: {
                        url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAA1JREFUGFdjyHQt+g8ABFsCIF75EPIAAAAASUVORK5CYII="
                    },
                    zIndex: 1000 + count
                });
            }
        };
        const markerCluster = new MarkerClusterer({
            map,
            markers: [],
            algorithm: new SuperClusterAlgorithm({ radius: 80 }),
            renderer: renderer
        });
        return markerCluster;
    };

    handleApiLoaded = (map, maps) => {
        const labelCluster = this.createClusterer(map);
        this.setState({ map: map, maps: maps, labelCluster: labelCluster });

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
