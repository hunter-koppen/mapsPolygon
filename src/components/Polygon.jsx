export const createPolygon = (mxObject, maps, props) => {
    const { strokeColor, strokeOpacity, strokeWeight, fillColor, fillOpacity, coordinates } = props;
    try {
        const coordinatesValue = JSON.parse(coordinates.get(mxObject).value);
        const paths = coordinatesValue.map(([lng, lat]) => new maps.LatLng(parseFloat(lat), parseFloat(lng)));

        const polygon = new maps.Polygon({
            paths,
            strokeColor: strokeColor ? strokeColor.get(mxObject).value : "#FFFFFF",
            strokeOpacity: strokeOpacity ? strokeOpacity.get(mxObject).value : 0.8,
            strokeWeight: strokeWeight ? strokeWeight.get(mxObject).value : 2,
            fillColor: fillColor ? fillColor.get(mxObject).value : "transparent",
            fillOpacity: fillOpacity ? fillOpacity.get(mxObject).value : 0.5,
            id: mxObject.id
        });

        return polygon;
    } catch (error) {
        console.log(error);
        return null;
    }
};
