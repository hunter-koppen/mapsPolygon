import { MarkerClusterer, SuperClusterAlgorithm } from "@googlemaps/markerclusterer";

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
    const algorithm = new SuperClusterAlgorithm({ radius: 120 });
    const markerClusterer = new MarkerClusterer({ map, markers, algorithm, renderer });

    return markerClusterer;
};
