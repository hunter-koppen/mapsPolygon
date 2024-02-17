import { MarkerClusterer, SuperClusterAlgorithm } from "@googlemaps/markerclusterer";

export const configureMapOptions = props => {
    const { mapTypeControl, zoomControl, streetViewControl, fullscreenControl, scrollwheel, mapType, styleArray } =
        props;

    const mapOptions = {
        mapTypeControl,
        zoomControl,
        streetViewControl,
        fullscreenControl,
        scrollwheel,
        mapTypeId: mapType
    };

    if (styleArray && styleArray !== "") {
        mapOptions.styles = JSON.parse(styleArray);
    }

    return mapOptions;
};

export const resizeMap = (polygons, maps, map, autoZoom, zoom, autoTilt, tilt, panByX, panByY) => {
    if (!maps || !map || !Array.isArray(polygons)) {
        console.error("Invalid arguments to resizeMap function");
        return;
    }

    const bounds = new maps.LatLngBounds();
    polygons.forEach(polygon => {
        polygon.getPath().forEach(path => {
            bounds.extend(path);
        });
    });
    map.fitBounds(bounds);
    if (autoZoom === false) {
        map.setZoom(zoom);
    }
    if (autoTilt === false) {
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

    mapItems.map(mapItem => mapItem.setMap(null));

    // Clear the array
    mapItems.length = 0;
};

export const createClusterer = (map, maps) => {
    // Create a custom renderer which hides all the cluster icons
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
