import { createElement } from "react";

import { MarkerClusterer, SuperClusterAlgorithm } from "@googlemaps/markerclusterer";
import { AdvancedMarker } from "@vis.gl/react-google-maps";

export const clearMapItems = mapItems => {
    if (!Array.isArray(mapItems)) {
        throw new Error("Input is not an array.");
    }

    mapItems.forEach(mapItem => {
        mapItem.setMap(null);
        // If this is a marker with a label, explicitly clear the label
        if (mapItem.getLabel) {
            const label = mapItem.getLabel();
            if (label) {
                mapItem.setLabel(null);
            }
        }
    });
    mapItems.length = 0;
};

export const createClusterer = (map, maps) => {
    const renderer = {
        render({ count, position }) {
            return <AdvancedMarker position={position} zIndex={1000 + count} />;
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
