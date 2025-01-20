import { createElement, useState, useEffect, useCallback, useRef } from "react";
import { APIProvider, Map } from "@vis.gl/react-google-maps";

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
        clickedPolygon: null
    });
    
    const prevPolygonListRef = useRef(props.polygonList);

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
            dutchImagery
        } = props;
        const newPolygons = [];
        const newLabels = [];

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

    const handleMapLoad = useCallback(mapEvent => {
        const map = mapEvent.map;
        const labelCluster = createClusterer(map, google.maps);
        setState(prev => ({ ...prev, map, labelCluster }));
    }, []);

    useEffect(() => {
        const { polygonList, fullReload } = props;
        const { loaded, map } = state;

        if (!loaded && polygonList?.status === "available" && map) {
            loadData();
            return;
        }

        if (polygonList.items !== prevPolygonListRef.current?.items && map) {
            if (fullReload) {
                loadData();
            } else {
                updatePolygon();
            }
        }

        prevPolygonListRef.current = polygonList;
    }, [props.polygonList, props.fullReload, state.loaded, state.map, loadData, updatePolygon]);

    const { height, width, googleKey, classNames } = props;
    const defaultCenter = { lat: 52.383564, lng: 4.645537 };
    const defaultZoom = 10;

    return (
        <div style={{ height, width }} className={"mx-polygonmap " + classNames}>
            <APIProvider apiKey={googleKey}>
                <Map
                    reuseMaps={props.caching}
                    defaultCenter={defaultCenter}
                    defaultZoom={defaultZoom}
                    onIdle={!state.loaded ? handleMapLoad : null}
                    mapId={props.mapId}
                    mapTypeId={props.mapType}
                    disableDefaultUI={true}
                    mapTypeControl={props.mapTypeControl}
                    streetViewControl={props.streetViewControl}
                    fullscreenControl={props.fullscreenControl}
                    rotateControl={props.rotateControl}
                    cameraControl={props.cameraControl}
                    gestureHandling={props.scrollwheel ? "greedy" : "none"}
                />
            </APIProvider>
        </div>
    );
}
