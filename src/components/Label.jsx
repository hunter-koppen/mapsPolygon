import { createElement } from "react";

import { AdvancedMarker, AdvancedMarkerAnchorPoint } from "@vis.gl/react-google-maps";

const LabelContent = ({ mxObject, polygonLabel, labelColor, labelSize, labelClass }) => {
    return (
        <div
            className={labelClass ? labelClass.get(mxObject).value : "polygon-label"}
            style={{
                color: labelColor ? labelColor.get(mxObject).value : "#000",
                fontSize: labelSize ? labelSize.get(mxObject).value + "px" : "12px"
            }}
        >
            {polygonLabel.get(mxObject).value}
        </div>
    );
};

export const createLabel = (mxObject, polygon, maps, props) => {
    const { polygonLabel, labelColor, labelSize, labelClass } = props;
    const bounds = new maps.LatLngBounds();
    polygon.getPath().forEach(path => bounds.extend(path));
    const centroid = bounds.getCenter();

    return (
        <AdvancedMarker
            position={centroid}
            title={polygonLabel.get(mxObject).value}
            anchorPoint={AdvancedMarkerAnchorPoint.CENTER}
        >
            <LabelContent
                mxObject={mxObject}
                polygonLabel={polygonLabel}
                labelColor={labelColor}
                labelSize={labelSize}
                labelClass={labelClass}
            />
        </AdvancedMarker>
    );
};
