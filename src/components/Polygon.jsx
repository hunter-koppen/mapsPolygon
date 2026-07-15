export const clearPolygons = polygons => {
    if (typeof polygons !== "object" || polygons === null) {
        throw new Error("Input is not an object.");
    }

    Object.values(polygons).forEach(polygon => {
        window.google.maps.event.clearInstanceListeners(polygon);
        polygon.setMap(null);
    });
    Object.keys(polygons).forEach(key => delete polygons[key]);
};

export const createPolygon = (mxObject, maps, props) => {
    const { strokeColor, strokeOpacity, strokeWeight, fillColor, fillOpacity, coordinates } = props;
    try {
        const coordinatesValue = JSON.parse(coordinates.get(mxObject).value);
        const paths = coordinatesValue.map(([lng, lat]) => new maps.LatLng(parseFloat(lat), parseFloat(lng)));

        const polygon = new maps.Polygon({
            paths,
            strokeColor: strokeColor ? strokeColor.get(mxObject).value : "#FFFFFF",
            // Mendix Decimal expressions return Big.js objects, Google Maps expects plain numbers
            strokeOpacity: strokeOpacity ? Number(strokeOpacity.get(mxObject).value ?? 0.8) : 0.8,
            strokeWeight: strokeWeight ? Number(strokeWeight.get(mxObject).value ?? 2) : 2,
            fillColor: fillColor ? fillColor.get(mxObject).value : "transparent",
            fillOpacity: fillOpacity ? Number(fillOpacity.get(mxObject).value ?? 0.5) : 0.5,
            id: mxObject.id
        });

        return polygon;
    } catch (error) {
        console.log(error);
        return null;
    }
};
