import { createElement, useCallback, useEffect, useRef, useState } from "react";
import { APIProvider, Map, useMap } from "@vis.gl/react-google-maps";

import { clearPolygons, createPolygon } from "./Polygon";
import { createLabel } from "./Label";
import { createClusterer } from "./Clusterer";

export function MapContainer(props) {
    const [state, setState] = useState({
        map: null,
        currentZoom: null,
        labelCluster: null
    });
    const polygonsRef = useRef({});
    const labelsRef = useRef([]);
    const clickedPolygonRef = useRef(null);
    const polygonHashesRef = useRef([]);

    const positionMap = () => {
        // this takes all the polygon coordinates and centers the map on it, also handles autoZoom, autoTilt, panByX, panByY
        if (props.polygonList.items && state.map && !Object.keys(polygonsRef.current).length) {
            const bounds = new google.maps.LatLngBounds();
            props.polygonList.items.forEach(mxObject => {
                const coords = JSON.parse(props.coordinates.get(mxObject).value);
                coords.forEach(coord => {
                    bounds.extend({ lat: coord[1], lng: coord[0] });
                });
            });

            state.map.fitBounds(bounds, { animation: false });

            if (props.autoZoom === false && props.zoom) {
                google.maps.event.addListenerOnce(state.map, "bounds_changed", () => {
                    setState(prev => ({ ...prev, currentZoom: props.zoom }));
                    // Clear the zoom after a brief moment
                    setTimeout(() => {
                        setState(prev => ({ ...prev, currentZoom: undefined }));
                    }, 100);
                });
            }

            if (props.autoTilt === false && props.tilt) {
                state.map.setTilt(props.tilt);
            }
            if (props.panByX !== 0 || props.panByY !== 0) {
                state.map.panBy(props.panByX, props.panByY);
            }
        }
    };

    const handlePolygonClick = useCallback((onClickPolygon, polygon, polygonList) => {
        if (onClickPolygon && polygon) {
            const mxObjectClicked = polygonList.items.find(poly => poly.id === polygon.id);
            if (mxObjectClicked) {
                onClickPolygon.get(mxObjectClicked).execute();
            }
            clickedPolygonRef.current = polygon;
        }
    }, []);

    const createPolygonHash = useCallback(
        mxObject => {
            const attributes = [
                "coordinates",
                "fillColor",
                "fillOpacity",
                "strokeColor",
                "strokeOpacity",
                "strokeWeight",
                "polygonLabel",
                "labelColor",
                "labelSize",
                "labelClass"
            ];

            return attributes
                .map(attr => {
                    const value = props[attr]?.get(mxObject)?.value;
                    return `${attr}:${value}`;
                })
                .join("|");
        },
        [
            props.coordinates,
            props.fillColor,
            props.fillOpacity,
            props.strokeColor,
            props.strokeOpacity,
            props.strokeWeight,
            props.polygonLabel,
            props.labelColor,
            props.labelSize,
            props.labelClass
        ]
    );

    const createPolygonWithLabel = (
        mxObject,
        map,
        polygonLabel,
        onClickPolygon,
        polygonList,
        newLabels,
        newPolygons
    ) => {
        const newPolygon = createPolygon(mxObject, google.maps, props);
        if (newPolygon) {
            if (polygonLabel) {
                const newLabel = createLabel(mxObject, newPolygon, google.maps, props);
                if (newLabel) {
                    newLabels.push(newLabel);
                }
            }
            if (onClickPolygon) {
                google.maps.event.addListener(newPolygon, "click", event => {
                    handlePolygonClick(onClickPolygon, newPolygon, polygonList);
                });
            }
            newPolygon.setMap(map);
            newPolygons[newPolygon.id] = newPolygon;
            polygonHashesRef.current.push(createPolygonHash(mxObject));
        }
    };

    // useEffect: Handle Dutch imagery WMS layer overlay
    useEffect(() => {
        // if the dutchImagery prop is true, we add a WMS layer to the map
        if (props.dutchImagery && state.map && window.google) {
            const WMSLayer = new window.google.maps.ImageMapType({
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

            state.map.overlayMapTypes.push(WMSLayer);
        }

        return () => {
            clearPolygons(polygonsRef.current);
        };
    }, [props.dutchImagery, state.map]);

    // useEffect: Handle polygon data changes and updates
    useEffect(() => {
        if (!state.map) return;

        // Handle polygon loading and updates
        const { polygonList, fullReload } = props;
        if (polygonList?.status === "available") {
            const newPolygonHashes = polygonList.items.map(mxObject => {
                const attributes = [
                    "coordinates",
                    "fillColor",
                    "fillOpacity",
                    "strokeColor",
                    "strokeOpacity",
                    "strokeWeight",
                    "polygonLabel",
                    "labelColor",
                    "labelSize",
                    "labelClass"
                ];
                return attributes
                    .map(attr => {
                        const value = props[attr]?.get(mxObject)?.value;
                        return `${attr}:${value}`;
                    })
                    .join("|");
            });

            if (JSON.stringify(polygonHashesRef.current) !== JSON.stringify(newPolygonHashes)) {
                if (fullReload) {
                    // Direct loadData logic
                    const newPolygons = {};
                    const newLabels = [];
                    polygonHashesRef.current = [];
                    positionMap();
                    if (Object.keys(polygonsRef.current).length > 0) {
                        clearPolygons(polygonsRef.current);
                    }
                    // Clear existing labels
                    if (labelsRef.current.length > 0) {
                        labelsRef.current.forEach(label => {
                            if (label && label.cleanup) {
                                label.cleanup();
                            }
                        });
                        labelsRef.current = [];
                    }
                    if (polygonList.items && state.map) {
                        // First create all polygons without labels
                        polygonList.items.forEach(mxObject => {
                            const newPolygon = createPolygon(mxObject, google.maps, props);
                            if (newPolygon) {
                                if (props.onClickPolygon) {
                                    google.maps.event.addListener(newPolygon, "click", event => {
                                        handlePolygonClick(props.onClickPolygon, newPolygon, polygonList);
                                    });
                                }
                                newPolygon.setMap(state.map);
                                newPolygons[newPolygon.id] = newPolygon;
                                polygonHashesRef.current.push(createPolygonHash(mxObject));
                            }
                        });

                        // Then create labels after a delay to ensure polygon data is ready
                        if (props.polygonLabel) {
                            setTimeout(() => {
                                polygonList.items.forEach(mxObject => {
                                    const polygon = Object.values(newPolygons).find(p => p.id === mxObject.id);
                                    if (polygon) {
                                        const newLabel = createLabel(mxObject, polygon, google.maps, props);
                                        if (newLabel) {
                                            newLabels.push(newLabel);
                                        }
                                    }
                                });

                                // Update cluster with the newly created labels
                                if (state.labelCluster) {
                                    state.labelCluster.clearMarkers();
                                    state.labelCluster.addMarkers(newLabels);
                                }
                                labelsRef.current = newLabels.filter(label => label !== null);
                            }, 200);
                        } else {
                            // No labels needed, just clear the cluster
                            if (state.labelCluster) {
                                state.labelCluster.clearMarkers();
                            }
                        }

                        polygonsRef.current = newPolygons;
                    }
                } else {
                    // Direct updatePolygon logic
                    if (polygonList?.items && state.map && clickedPolygonRef.current) {
                        const clickedId = clickedPolygonRef.current.id;
                        const clickedObject = polygonList.items.find(poly => poly.id === clickedId);
                        if (clickedObject && polygonsRef.current[clickedId]) {
                            polygonsRef.current[clickedId].setMap(null);
                            delete polygonsRef.current[clickedId];
                            const newPolygon = createPolygon(clickedObject, google.maps, props);
                            if (newPolygon) {
                                if (props.onClickPolygon) {
                                    google.maps.event.addListener(newPolygon, "click", event => {
                                        handlePolygonClick(props.onClickPolygon, newPolygon, polygonList);
                                    });
                                }
                                newPolygon.setMap(state.map);
                                polygonsRef.current[clickedId] = newPolygon;
                            }
                        }
                    }
                }
                polygonHashesRef.current = newPolygonHashes;
            }
        }
    }, [props.polygonList, props.fullReload, state.map]);

    const { height, width, googleKey, classNames } = props;
    const defaultCenter = { lat: 52.383564, lng: 4.645537 };
    const defaultZoom = 19;

    function MapContent() {
        if (!state.map) {
            const mapInstance = useMap();
            const newLabelCluster = createClusterer(mapInstance, google.maps);
            setState(prev => ({ ...prev, map: mapInstance, labelCluster: newLabelCluster }));
        }
    }

    return (
        <div style={{ height, width }} className={"mx-polygonmap " + classNames}>
            <APIProvider apiKey={googleKey}>
                <Map
                    reuseMaps={props.caching}
                    defaultCenter={defaultCenter}
                    defaultZoom={defaultZoom}
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
