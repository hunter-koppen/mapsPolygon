import { createElement } from "react";

import { MarkerClusterer, SuperClusterAlgorithm } from "@googlemaps/markerclusterer";
import { AdvancedMarker } from "@vis.gl/react-google-maps";

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
