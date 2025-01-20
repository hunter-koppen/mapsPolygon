import { createElement } from "react";

import { MapContainer } from "./components/MapContainer";

export function MapsPolygon(props) {
    return (
        <MapContainer
            googleKey={props.googleKey.value}
            mapType={props.mapType}
            scrollwheel={props.scrollwheel}
            mapTypeControl={props.mapTypeControl}
            cameraControl={props.cameraControl}
            rotateControl={props.rotateControl}
            fullReload={props.fullReload.value}
            autoZoom={props.autoZoom}
            zoom={props.zoom}
            autoTilt={props.autoTilt}
            tilt={props.tilt}
            panByX={props.panByX}
            panByY={props.panByY}
            dutchImagery={props.dutchImagery}
            width={props.width}
            height={props.height}
            streetViewControl={props.streetViewControl}
            fullscreenControl={props.fullscreenControl}
            polygonList={props.polygonList}
            coordinates={props.coordinates}
            onClickPolygon={props.onClickPolygon}
            fillColor={props.fillColor}
            fillOpacity={props.fillOpacity}
            strokeColor={props.strokeColor}
            strokeOpacity={props.strokeOpacity}
            strokeWeight={props.strokeWeight}
            polygonLabel={props.polygonLabel}
            labelColor={props.labelColor}
            labelSize={props.labelSize}
            labelClass={props.labelClass}
            mapId={props.mapId}
            classNames={props.class}
            caching={props.caching}
        />
    );
}
