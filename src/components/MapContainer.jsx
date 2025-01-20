import { createElement, useState, useEffect, useCallback, useRef } from "react";
import { APIProvider, Map, useMap } from "@vis.gl/react-google-maps";

import { createPolygon } from "./Polygon";
import { createLabel } from "./Label";
import { resizeMap, clearMapItems, createClusterer, clusterMap } from "./Map";

export function MapContainer(props) {
    const [state, setState] = useState({
        loaded: false,
        map: null,
        polygons: [],
        labels: [],
        labelCluster: null,
        clickedPolygon: null,
        currentZoom: null
    });

    const prevPolygonListRef = useRef(props.polygonList);

    const handlePolygonClick = useCallback((onClickPolygon, polygon, polygonList) => {
        if (onClickPolygon && polygon) {
            const mxObjectClicked = polygonList.items.find(poly => poly.id === polygon.id);
            if (mxObjectClicked) {
                onClickPolygon.get(mxObjectClicked).execute();
            }
            setState(prev => ({
                ...prev,
                clickedPolygon: polygon
            }));
        }
    }, []);

    const loadData = useCallback(() => {
        const { map, polygons, labels, labelCluster, loaded } = state;
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
            dutchImagery,
            coordinates
        } = props;
        const newPolygons = [];
        const newLabels = [];

        if (polygonList.items && map && !loaded) {
            const bounds = new google.maps.LatLngBounds();
            polygonList.items.forEach(mxObject => {
                const coords = JSON.parse(coordinates.get(mxObject).value);
                coords.forEach(coord => {
                    bounds.extend({ lat: coord[1], lng: coord[0] });
                });
            });

            map.fitBounds(bounds, { animation: false });

            if (autoZoom === false && zoom) {
                const boundsListener = google.maps.event.addListenerOnce(map, "bounds_changed", () => {
                    setState(prev => ({ ...prev, currentZoom: zoom }));
                    // Clear the zoom after a brief moment
                    setTimeout(() => {
                        setState(prev => ({ ...prev, currentZoom: undefined }));
                    }, 100);
                });
            }
        }

        const createPolygonWithLabel = mxObject => {
            const newPolygon = createPolygon(mxObject, google.maps, props);
            if (newPolygon) {
                if (polygonLabel) {
                    const newLabel = createLabel(mxObject, newPolygon, google.maps, props);
                    newLabel.setMap(map);
                    newLabels.push(newLabel);
                }
                if (onClickPolygon) {
                    google.maps.event.addListener(newPolygon, "click", event => {
                        handlePolygonClick(onClickPolygon, newPolygon, polygonList);
                    });
                }
                newPolygon.setMap(map);
                newPolygons.push(newPolygon);
            }
        };

        if (polygonList.items && map) {
            polygonList.items.forEach(createPolygonWithLabel);
            if (loaded) {
                clearMapItems(polygons);
                clearMapItems(labels);
            } else {
                resizeMap(newPolygons, google.maps, map, autoZoom, zoom, autoTilt, tilt, panByX, panByY);
                setState(prev => ({ ...prev, loaded: true }));
            }

            if (dutchImagery) {
                const WMSLayer = new google.maps.ImageMapType({
                    // eslint-disable-next-line space-before-function-paren
                    getTileUrl: function (coord, gZoom) {
                        var z2 = Math.pow(2, gZoom);
                        var tileX = coord.x % z2;
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

            clusterMap(newLabels, labelCluster);

            setState(prev => ({
                ...prev,
                polygons: newPolygons,
                labels: newLabels
            }));
        }
    }, [state, props]);

    const updatePolygon = useCallback(() => {
        const { map, polygons, clickedPolygon } = state;
        const { polygonList, onClickPolygon } = props;

        if (polygonList?.items && map) {
            const clickedObject = polygonList.items.find(poly => poly.id === clickedPolygon.id);
            if (clickedObject) {
                const newPolygons = polygons;

                const clickedIndex = newPolygons.findIndex(x => x.id === clickedPolygon.id);
                newPolygons.splice(clickedIndex, 1);
                clickedPolygon.setMap(null);

                const newPolygon = createPolygon(clickedObject, google.maps, props);

                if (newPolygon) {
                    if (onClickPolygon) {
                        google.maps.event.addListener(newPolygon, "click", event => {
                            handlePolygonClick(onClickPolygon, newPolygon, polygonList);
                        });
                    }
                    newPolygon.setMap(map);
                    newPolygons.push(newPolygon);
                    setState(prev => ({
                        ...prev,
                        polygons: newPolygons
                    }));
                }
            }
        }
    }, [state, props]);

    function MapContent() {
        const map = useMap();

        useEffect(() => {
            if (!map) return;

            // Initialize map and cluster if not loaded
            if (!state.loaded) {
                const labelCluster = createClusterer(map, google.maps);
                setState(prev => ({ ...prev, map, labelCluster }));
            }

            // Handle polygon loading and updates
            const { polygonList, fullReload } = props;
            if (!state.loaded && polygonList?.status === "available") {
                loadData();
                return;
            }

            if (polygonList.items !== prevPolygonListRef.current?.items) {
                if (fullReload) {
                    loadData();
                } else {
                    updatePolygon();
                }
            }

            prevPolygonListRef.current = polygonList;
        }, [map, props.polygonList, props.fullReload, state.loaded, loadData, updatePolygon]);

        return null;
    }

    const { height, width, googleKey, classNames } = props;
    const defaultCenter = { lat: 52.383564, lng: 4.645537 };

    return (
        <div style={{ height, width }} className={"mx-polygonmap " + classNames}>
            <APIProvider apiKey={googleKey}>
                <Map
                    reuseMaps={props.caching}
                    defaultCenter={defaultCenter}
                    zoom={state.currentZoom}
                    mapId={props.mapId}
                    mapTypeId={props.mapType}
                    disableDefaultUI={true}
                    mapTypeControl={props.mapTypeControl}
                    streetViewControl={props.streetViewControl}
                    fullscreenControl={props.fullscreenControl}
                    rotateControl={props.rotateControl}
                    cameraControl={props.cameraControl}
                    gestureHandling={props.scrollwheel ? "greedy" : "none"}
                >
                    <MapContent />
                </Map>
            </APIProvider>
        </div>
    );
}
