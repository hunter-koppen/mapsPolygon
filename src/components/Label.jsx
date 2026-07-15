export const createLabel = (mxObject, polygon, maps, props) => {
    const { polygonLabel, labelColor, labelSize, labelClass } = props;

    // Get the label text and ensure it's a valid string
    const labelText = polygonLabel.get(mxObject).value;
    if (!labelText || typeof labelText !== "string") {
        return null; // Don't create label if text is not available or not a string
    }

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

    // Only append "px" when the configured size is a bare number, values like "12px" or "1.2em" pass through as-is
    let fontSize = labelSize ? labelSize.get(mxObject).value : "12px";
    if (/^\d+(\.\d+)?$/.test(fontSize)) {
        fontSize += "px";
    }

    const labelElement = document.createElement("div");
    labelElement.textContent = labelText;
    labelElement.className = labelClass ? labelClass.get(mxObject).value : "polygon-label";
    labelElement.style.color = labelColor ? labelColor.get(mxObject).value : "#000";
    labelElement.style.fontSize = fontSize;
    // Legacy marker labels were drawn in Roboto and centered on the position;
    // advanced markers anchor their content bottom-center, so shift down half the height
    labelElement.style.fontFamily = "Roboto, Arial, sans-serif";
    labelElement.style.transform = "translateY(50%)";

    const markerLabel = new maps.marker.AdvancedMarkerElement({
        position: centroid,
        content: labelElement
    });
    return markerLabel;
};
