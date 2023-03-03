import { Component, createElement } from "react";

import GoogleMapReact from "google-map-react";

import { createPolygon } from "./Polygon";
import { configureMapOptions, resizeMap, clearMapItems, createClusterer, clusterMap } from "./Map";

export class MapContainer extends Component {
    state = {
        loaded: false,
        map: null,
        maps: null,
        polygons: [],
        labels: [],
        labelCluster: null,
        clickedPolygon: null
    };

    componentDidUpdate(prevProps) {
        if (!this.state.loaded && this.props.polygonList.status === "available" && this.state.map && this.state.maps) {
            this.loadData(false);
        } else if (prevProps.polygonList.items !== this.props.polygonList.items) {
            if (this.props.fullReload) {
                this.loadData(true);
            } else {
                this.updatePolygon();
            }
        }
    }

    loadData = reload => {
        const { map, maps } = this.state;
        if (this.props.polygonList.items && map && maps) {
            const polygons = [];
            const labels = [];

            this.props.polygonList.items.forEach(mxObject => {
                const polygon = createPolygon(mxObject, maps, this.props);
                if (polygon) {
                    if (this.props.polygonLabel) {
                        const markerLabel = this.createLabel(mxObject, polygon, maps);
                        markerLabel.setMap(map);
                        labels.push(markerLabel);
                    }
                    maps.event.addListener(polygon, "click", event => {
                        if (this.props.onClickPolygon && polygon) {
                            const mxObjectClicked = this.props.polygonList.items.find(poly => poly.id === polygon.id);
                            if (mxObjectClicked) {
                                this.props.onClickPolygon(mxObjectClicked).execute();
                            }
                            this.setState({
                                clickedPolygon: polygon
                            });
                        }
                    });
                    polygon.setMap(map);
                    polygons.push(polygon);
                }
            });

            if (reload) {
                clearMapItems(this.state.polygons);
                clearMapItems(this.state.labels);
            } else {
                resizeMap(polygons, maps, map);
                this.setState({
                    loaded: true
                });
            }
            clusterMap(labels, this.state.labelCluster);
            this.setState({
                polygons: polygons,
                labels: labels
            });
        }
    };

    updatePolygon = () => {
        const { map, maps, clickedPolygon } = this.state;
        if (this.props.polygonList.items && map && maps) {
            const mxObjectClicked = this.props.polygonList.items.find(poly => poly.id === clickedPolygon.id);
            if (mxObjectClicked) {
                // if found first remove the old polygon
                const polygons = this.state.polygons;
                const index = polygons.findIndex(x => x.id === clickedPolygon.id);
                polygons.splice(index, 1);
                clickedPolygon.setMap(null);

                // then create a new polygon based on the new input
                const polygon = createPolygon(mxObjectClicked, maps, this.props);
                if (polygon) {
                    maps.event.addListener(polygon, "click", event => {
                        if (this.props.onClickPolygon && polygon) {
                            const mxObjectClicked = this.props.polygonList.items.find(poly => poly.id === polygon.id);
                            if (mxObjectClicked) {
                                this.props.onClickPolygon(mxObjectClicked).execute();
                            }
                            this.setState({
                                clickedPolygon: polygon
                            });
                        }
                    });
                    polygon.setMap(map);
                    polygons.push(polygon);
                    this.setState({
                        polygons: polygons
                    });
                }
            }
        }
    };

    createLabel = (mxObject, polygon, maps) => {
        const { polygonLabel, labelColor, labelSize, labelClass } = this.props;
        const bounds = new maps.LatLngBounds();
        polygon.getPath().forEach(path => {
            bounds.extend(path);
        });
        const centroid = bounds.getCenter();

        const markerLabel = new maps.Marker({
            position: centroid,
            label: {
                text: polygonLabel.get(mxObject).value,
                color: labelColor ? labelColor.get(mxObject).value : "#000",
                fontSize: labelSize ? labelSize.get(mxObject).value + "px" : "12px",
                className: labelClass ? labelClass.get(mxObject).value : "polygon-label"
            },
            icon: {
                url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAA1JREFUGFdjyHQt+g8ABFsCIF75EPIAAAAASUVORK5CYII="
            }
        });
        return markerLabel;
    };

    handleApiLoaded = (map, maps) => {
        const labelCluster = createClusterer(map);
        const mapOptions = configureMapOptions(this.props);
        map.setOptions(mapOptions);
        this.setState({ map, maps, labelCluster });
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
            <div style={{ height: this.props.height, width: this.props.width }}>
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
