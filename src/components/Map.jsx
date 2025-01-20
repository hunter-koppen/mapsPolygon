import { MarkerClusterer, SuperClusterAlgorithm } from "@googlemaps/markerclusterer";

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
