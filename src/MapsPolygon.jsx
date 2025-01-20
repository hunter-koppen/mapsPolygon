import { Component, createElement } from "react";

import { MapContainer } from "./components/MapContainer";

export class MapsPolygon extends Component {
    render() {
        return (
            <MapContainer
                googleKey={this.props.googleKey.value}
                mapType={this.props.mapType}
                scrollwheel={this.props.scrollwheel}
                mapTypeControl={this.props.mapTypeControl}
                zoomControl={this.props.zoomControl}
                rotateControl={this.props.rotateControl}
                fullReload={this.props.fullReload.value}
                autoZoom={this.props.autoZoom}
                zoom={this.props.zoom}
                autoTilt={this.props.autoTilt}
                tilt={this.props.tilt}
                panByX={this.props.panByX}
                panByY={this.props.panByY}
                dutchImagery={this.props.dutchImagery}
                width={this.props.width}
                height={this.props.height}
                streetViewControl={this.props.streetViewControl}
                fullscreenControl={this.props.fullscreenControl}
                polygonList={this.props.polygonList}
                coordinates={this.props.coordinates}
                onClickPolygon={this.props.onClickPolygon}
                fillColor={this.props.fillColor}
                fillOpacity={this.props.fillOpacity}
                strokeColor={this.props.strokeColor}
                strokeOpacity={this.props.strokeOpacity}
                strokeWeight={this.props.strokeWeight}
                polygonLabel={this.props.polygonLabel}
                labelColor={this.props.labelColor}
                labelSize={this.props.labelSize}
                labelClass={this.props.labelClass}
                mapId={this.props.mapId}
                classNames={this.props.class}
                caching={this.props.caching}
            />
        );
    }
}
