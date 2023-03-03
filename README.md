## MapsPolygon
A Google Maps based widget for displaying and interacting with polygons. Its primary purpose is being able to click on polygons to help with (de)selecting area's.

## Features
- Load polygons on a map, including refreshes of the datasource
- Optionally with labels
- Set the look and feel of everything, including the polygons and labels
- OnClick action for the polygons
- Option to only reload the data of the last clicked polygon.

## Usage
1. Add a Google Maps API key to the APIKey field.
2. Add a Datasource for the polygons. The required format is as follows: [[lat1,long1],[lat2,long2],[lat3,long3],[..]]

Optionally
3. Add labels for each polygon and any other style props like colors and weights. 
4. Add an onclick activity for the polygons, you could change the color of the polygon when clicking and then refreshing.
5. Determine if you want a full reload or not before refreshing, if you only wish to update the last clicked polygon simply set it to false. If you wish to update any other data in the mapview that was not the last clicked polygon on the map you should set it to true. Note that you can swap this boolean at any time.

## Future ideas
- Add support for multi-line polygons and holes.
- Add support for dragging and creating new polygons.
- Add infowindow support to show custom container when clicking on a polygon.

## Issues, suggestions and feature requests
https://github.com/hunter-koppen/mapsPolygon/issues