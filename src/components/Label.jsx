export const createLabel = (mxObject, polygon, maps, props) => {
    const { polygonLabel, labelColor, labelSize, labelClass } = props;

    // Calculate the geometric centroid of the polygon
    const path = polygon.getPath();
    let latSum = 0;
    let lngSum = 0;
    const pathLength = path.getLength();

    for (let i = 0; i < pathLength; i++) {
        const point = path.getAt(i);
        latSum += point.lat();
        lngSum += point.lng();
    }

    const centroid = new maps.LatLng(latSum / pathLength, lngSum / pathLength);

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
