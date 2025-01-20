import { Component, createElement } from "react";
import { APIProvider, Map, useMap } from "@vis.gl/react-google-maps";

import { createPolygon } from "./Polygon";
import { createLabel } from "./Label";
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
        const { polygonList, fullReload } = this.props;
        const { loaded, map, maps } = this.state;

        if (!loaded && polygonList?.status === "available" && map && maps) {
            this.loadData();
            return;
        }

        if (prevProps.polygonList.items !== polygonList.items) {
            if (fullReload) {
                this.loadData();
            } else {
                this.updatePolygon();
            }
        }
    }

    loadData = () => {
        const { map, maps, polygons, labels, labelCluster, loaded } = this.state;
        const {
            polygonList,
            polygonLabel,
            onClickPolygon,
            autoZoom,
            zoom,
            autoTilt,
            tilt,
            panByX,
            panByY,
            dutchImagery
        } = this.props;
        const newPolygons = [];
        const newLabels = [];

        const createPolygonWithLabel = mxObject => {
            const newPolygon = createPolygon(mxObject, maps, this.props);
            if (newPolygon) {
                if (polygonLabel) {
                    // if labels have been configured we have to add them for each polygon
                    const newLabel = createLabel(mxObject, newPolygon, maps, this.props);
                    newLabel.setMap(map);
                    newLabels.push(newLabel);
                }
                // if an onClickAction has been set we have to add the event for each polygon
                if (onClickPolygon) {
                    maps.event.addListener(newPolygon, "click", event => {
                        this.handlePolygonClick(onClickPolygon, newPolygon, polygonList);
                    });
                }
                newPolygon.setMap(map);
                newPolygons.push(newPolygon);
            }
        };

        if (polygonList.items && map && maps) {
            // Create all the polygons here
            polygonList.items.forEach(createPolygonWithLabel);
            if (loaded) {
                // when doing a full reload we have to clear all the old polygons and labels
                clearMapItems(polygons);
                clearMapItems(labels);
            } else {
                // this will only run on first load because we need to center on the map
                resizeMap(newPolygons, maps, map, autoZoom, zoom, autoTilt, tilt, panByX, panByY);
                this.setState({
                    loaded: true
                });
            }

            if (dutchImagery) {
                const WMSLayer = new google.maps.ImageMapType({
                    // eslint-disable-next-line space-before-function-paren
                    getTileUrl: function (coord, gZoom) {
                        var z2 = Math.pow(2, gZoom);
                        var tileX = coord.x % z2; // Wrap tiles horizontally.
                        if (tileX < 0) tileX += z2;
                        var tileY = coord.y;

                        var url =
                            `https://service.pdok.nl/hwh/luchtfotorgb/wmts/v1_0/Actueel_orthoHR/` +
                            `OGC:1.0:GoogleMapsCompatible/${gZoom}/${tileX}/${tileY}.jpeg`;
                        return url;
                    },
                    tileSize: new google.maps.Size(256, 256),
                    name: "Dutch Aerial Imagery",
                    maxZoom: 21
                });

                map.overlayMapTypes.push(WMSLayer);
            }

            // We then have to add clusters for the labels in case there are too many and they are overlapping
            clusterMap(newLabels, labelCluster);

            // And finally we can set the new polygons and labels to the state.
            this.setState({
                polygons: newPolygons,
                labels: newLabels
            });
        }
    };

    updatePolygon = () => {
        const { map, maps, clickedPolygon, polygons } = this.state;
        const { polygonList, onClickPolygon } = this.props;

        if (polygonList?.items && map && maps) {
            const clickedObject = polygonList.items.find(poly => poly.id === clickedPolygon.id);
            if (clickedObject) {
                const newPolygons = polygons;

                // if found first remove the old polygon from the new list
                const clickedIndex = newPolygons.findIndex(x => x.id === clickedPolygon.id);
                newPolygons.splice(clickedIndex, 1);
                clickedPolygon.setMap(null);

                // then create a new polygon based on the new input
                const newPolygon = createPolygon(clickedObject, maps, this.props);

                if (newPolygon) {
                    if (onClickPolygon) {
                        maps.event.addListener(newPolygon, "click", event => {
                            this.handlePolygonClick(onClickPolygon, newPolygon, polygonList);
                        });
                    }
                    newPolygon.setMap(map);
                    newPolygons.push(newPolygon);
                    this.setState({
                        polygons: newPolygons
                    });
                }
            }
        }
    };

    handlePolygonClick = (onClickPolygon, polygon, polygonList) => {
        if (onClickPolygon && polygon) {
            const mxObjectClicked = polygonList.items.find(poly => poly.id === polygon.id);
            if (mxObjectClicked) {
                onClickPolygon.get(mxObjectClicked).execute();
            }
            this.setState({
                clickedPolygon: polygon
            });
        }
    };

    handleMapLoad = map => {
        const maps = window.google.maps;
        const labelCluster = createClusterer(map, maps);
        const mapOptions = configureMapOptions(this.props);
        Object.entries(mapOptions).forEach(([key, value]) => {
            map.set(key, value);
        });
        this.setState({ map, maps, labelCluster });
    };

    render() {
        const { height, width, googleKey, classNames } = this.props;
        const defaultCenter = { lat: 0, lng: 0 };
        const defaultZoom = 10;

        return (
            <div style={{ height, width }} className={"mx-polygonmap " + classNames}>
                <APIProvider apiKey={googleKey}>
                    <Map
                        defaultCenter={defaultCenter}
                        defaultZoom={defaultZoom}
                        onLoad={this.handleMapLoad}
                        gestureHandling={"greedy"}
                        disableDefaultUI={true}
                    />
                </APIProvider>
            </div>
        );
    }
}
