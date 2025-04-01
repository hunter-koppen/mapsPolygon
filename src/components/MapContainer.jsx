import { createElement, useState, useEffect, useCallback, useRef } from "react";
import { APIProvider, Map, useMap } from "@vis.gl/react-google-maps";

import { createPolygon } from "./Polygon";
import { createLabel } from "./Label";
import { clearMapItems, createClusterer, clusterMap } from "./Map";

export function MapContainer(props) {
    const [state, setState] = useState({
        map: null,
        currentZoom: null
    });
    let labelCluster = null;
    const polygonsRef = useRef([]);
    const labelsRef = useRef([]);
    const clickedPolygonRef = useRef(null);
    const polygonHashesRef = useRef([]);

    const positionMap = () => {
        // this takes all the polygon coordinates and centers the map on it, also handles autoZoom, autoTilt, panByX, panByY
        if (props.polygonList.items && state.map && !polygonsRef.current.length) {
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
            polygonHashesRef.current.push(createPolygonHash(mxObject));
        }
    };

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
        [props]
    );

    const loadData = useCallback(() => {
        const { polygonList, polygonLabel, onClickPolygon } = props;
        const newPolygons = [];
        const newLabels = [];
        polygonHashesRef.current = [];

        // first we load through the coordinates and position the map to fit them
        positionMap();

        // Clear existing items if we have any
        if (polygonsRef.current.length > 0) {
            clearMapItems(polygonsRef.current);
        }
        if (labelsRef.current.length > 0) {
            clearMapItems(labelsRef.current);
        }

        // then we load through the polygondata and create the polygons and labels
        if (polygonList.items && state.map) {
            polygonList.items.forEach(mxObject =>
                createPolygonWithLabel(
                    mxObject,
                    state.map,
                    polygonLabel,
                    onClickPolygon,
                    polygonList,
                    newLabels,
                    newPolygons
                )
            );

            // then we cluster the labels
            clusterMap(newLabels, labelCluster);

            // Update refs with new polygons and labels
            polygonsRef.current = newPolygons;
            labelsRef.current = newLabels;
        }
    }, [props, state.map]);

    const updatePolygon = useCallback(() => {
        const { polygonList, onClickPolygon } = props;

        if (polygonList?.items && state.map) {
            const clickedObject = polygonList.items.find(poly => poly.id === clickedPolygonRef.current.id);
            if (clickedObject) {
                const newPolygons = polygonsRef.current;

                const clickedIndex = newPolygons.findIndex(x => x.id === clickedPolygonRef.current.id);
                newPolygons.splice(clickedIndex, 1);
                clickedPolygonRef.current.setMap(null);

                const newPolygon = createPolygon(clickedObject, google.maps, props);

                if (newPolygon) {
                    if (onClickPolygon) {
                        google.maps.event.addListener(newPolygon, "click", event => {
                            handlePolygonClick(onClickPolygon, newPolygon, polygonList);
                        });
                    }
                    newPolygon.setMap(state.map);
                    newPolygons.push(newPolygon);
                    polygonsRef.current = newPolygons;
                }
            }
        }
    }, [props, state.map]);

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
            console.log("Component will unmount");
            clearMapItems(polygonsRef.current);
            clearMapItems(labelsRef.current);
        };
    }, [props.dutchImagery, state.map]);

    useEffect(() => {
        if (!state.map) return;

        // Handle polygon loading and updates
        const { polygonList, fullReload } = props;
        if (polygonList?.status === "available") {
            // We create a hash of the polygon data (including all the attributes) to check if the polygon has changed
            const newPolygonHashes = polygonList.items.map(mxObject => createPolygonHash(mxObject));

            if (JSON.stringify(polygonHashesRef.current) !== JSON.stringify(newPolygonHashes)) {
                if (fullReload) {
                    loadData();
                } else {
                    updatePolygon();
                }
            }
        }
    }, [
        props.polygonList,
        props.fullReload,
        props.polygonLabel,
        props.onClickPolygon,
        state.map,
        labelCluster,
        createPolygonHash
    ]);

    const { height, width, googleKey, classNames } = props;
    const defaultCenter = { lat: 52.383564, lng: 4.645537 };
    const defaultZoom = 19;

    function MapContent() {
        if (!state.map) {
            const mapInstance = useMap();
            labelCluster = createClusterer(mapInstance, google.maps);
            setState(prev => ({ ...prev, map: mapInstance }));
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
