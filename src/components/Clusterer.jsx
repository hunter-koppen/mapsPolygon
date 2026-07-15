import { MarkerClusterer, SuperClusterAlgorithm } from "@googlemaps/markerclusterer";

export const createClusterer = (map, maps) => {
    const renderer = {
        render({ count, position }) {
            // Clusters are intentionally invisible (labels simply disappear when
            // they overlap), so pass an empty element as content; without it the
            // advanced marker would render the default red pin
            return new maps.marker.AdvancedMarkerElement({
                position,
                content: document.createElement("div"),
                zIndex: 1000 + count
            });
        }
    };

    const markers = [];
    const algorithm = new SuperClusterAlgorithm({ radius: 120 });
    const markerClusterer = new MarkerClusterer({ map, markers, algorithm, renderer });

    return markerClusterer;
};
