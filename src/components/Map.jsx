import { MarkerClusterer, SuperClusterAlgorithm } from "@googlemaps/markerclusterer";

export const resizeMap = (polygons, maps, map, autoZoom, zoom, autoTilt, tilt, panByX, panByY) => {
    if (!maps || !map || !Array.isArray(polygons)) {
        console.error("Invalid arguments to resizeMap function");
        return;
    }

    if (polygons.length === 0) {
        return;
    }

    const bounds = new maps.LatLngBounds();
    polygons.forEach(polygon => {
        polygon.getPath().forEach(path => {
            bounds.extend(path);
        });
    });

    map.fitBounds(bounds);

    if (autoZoom === false && zoom) {
        map.setZoom(zoom);
    }
    if (autoTilt === false && tilt) {
        map.setTilt(tilt);
    }
    if (panByX !== 0 || panByY !== 0) {
        map.panBy(panByX, panByY);
    }
};

export const clearMapItems = mapItems => {
    if (!Array.isArray(mapItems)) {
        throw new Error("Input is not an array.");
    }

    mapItems.forEach(mapItem => mapItem.setMap(null));
    mapItems.length = 0;
};

export const createClusterer = (map, maps) => {
    const renderer = {
        render({ count, position }) {
            return new maps.Marker({
                position,
                icon: {
                    url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAA1JREFUGFdjyHQt+g8ABFsCIF75EPIAAAAASUVORK5CYII="
                },
                zIndex: 1000 + count
            });
        }
    };

    const markers = [];
    const algorithm = new SuperClusterAlgorithm({ radius: 80 });
    const markerCluster = new MarkerClusterer({ map, markers, algorithm, renderer });

    return markerCluster;
};

export const clusterMap = (labels, labelCluster) => {
    labelCluster?.clearMarkers();
    labelCluster?.addMarkers(labels);
};
