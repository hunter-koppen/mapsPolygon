export const createLabel = (mxObject, polygon, maps, props) => {
    const { polygonLabel, labelColor, labelSize, labelClass } = props;
    const bounds = new maps.LatLngBounds();
    polygon.getPath().forEach(path => bounds.extend(path));
    const centroid = bounds.getCenter();

    const markerLabel = new maps.Marker({
        position: centroid,
        label: {
            text: polygonLabel.get(mxObject).value,
            color: labelColor ? labelColor.get(mxObject).value : "#000",
            fontSize: labelSize ? labelSize.get(mxObject).value + "px" : "12px",
            className: labelClass ? labelClass.get(mxObject).value : "polygon-label"
        },
        icon: {
            url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAA1JREFUGFdjyHQt+g8ABFsCIF75EPIAAAAASUVORK5CYII="
        }
    });
    return markerLabel;
};
