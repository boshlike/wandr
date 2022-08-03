// Autosuggest function (note needs to be in this format)
async function GetSuggestion() {
    const dataObject = await fetchObject(`${location.origin}/fetchmapdata`);
    Microsoft.Maps.loadModule('Microsoft.Maps.AutoSuggest', {
        callback: function () {
            const manager = new Microsoft.Maps.AutosuggestManager({
                placeSuggestions: true
            });
            manager.attachAutosuggest('#searchBox', '#searchBoxContainer', selectPlace);
            document.querySelector("#searchBox").style = null;
        },
        errorCallback: function(msg){
            alert(msg);
        },
        credentials: dataObject.credentials
    });
}
const selectPlace = (result) => {
    console.log(result)
    document.querySelector("#country-name").value = result.address.countryRegion;
    document.querySelector("#country-code").value = result.address.countryRegionISO2;
    document.querySelector("#locality-name").value = result.address.locality;
    document.querySelector("#center").value = [result.bestView.center.latitude, result.bestView.center.longitude];
    if (result.entityType === "Place") {
        document.querySelector("#landmark-name").value = result.title;
    }
}
const fetchObject = async (url) => {
    const response = await fetch(url)
    const data = await response.json()
    return data;
}
async function GetMap() {
    const dataObject = await fetchObject(`${location.origin}/fetchmapdata`);
    const countryPlannedCoords = dataObject.planned.map(place => place[1].coordinates);
    const countryVisitedCoords = dataObject.visited.map(place => place[1].coordinates);
    const placesPlannedPins = dataObject.planned.map(place => place[0].coordinates);
    const locationTopLeft = new Microsoft.Maps.Location(65, 180);
    const locationBotRight = new Microsoft.Maps.Location(-50, -180);
    const map = new Microsoft.Maps.Map('#my-map', {
        credentials: dataObject.credentials ,
        bounds: new Microsoft.Maps.LocationRect.fromCorners(locationBotRight, locationTopLeft),
        mapTypeId: Microsoft.Maps.MapTypeId.grayscale,
        zoom: 0,
        disableMapTypeSelectorMouseOver: true,
        disableScrollWheelZoom: true,
        disablePanning: true,
        disableZooming: true,
        showLocateMeButton: false,
        showMapTypeSelector: false,
        customMapStyle: dataObject.style,
        showScalebar: false
    });
    countryPlannedCoords.forEach(coord => {
        map.entities.push(createPin(coord, "red"));
    });
    countryVisitedCoords.forEach(coord => {
        map.entities.push(createPin(coord, "blue"));
    });
}
const createPin = (arr, color) => {
    const location = new Microsoft.Maps.Location(arr[0], arr[1]);
    const pin = new Microsoft.Maps.Pushpin(location, {color: color});
    return pin;
}
async function GetMiniMap() {
    const dataObject = await fetchObject(`${location.origin}/fetchmapdata${location.pathname}`);
    const color = dataObject.placeObject.visitedPlanned === "visited" ? "blue" : "red";
    const locationTopLeft = new Microsoft.Maps.Location(dataObject.placeObject.countryBbox[0], dataObject.placeObject.countryBbox[1]);
    const locationBotRight = new Microsoft.Maps.Location(dataObject.placeObject.countryBbox[2], dataObject.placeObject.countryBbox[3]);
    const map = new Microsoft.Maps.Map('#my-mini-map', {
        credentials: dataObject.credentials,
        bounds: new Microsoft.Maps.LocationRect.fromCorners(locationTopLeft, locationBotRight),
        mapTypeId: Microsoft.Maps.MapTypeId.grayscale,
        zoom: 0,
        disableMapTypeSelectorMouseOver: true,
        disableScrollWheelZoom: true,
        disablePanning: true,
        disableZooming: true,
        showLocateMeButton: false,
        showMapTypeSelector: false,
        customMapStyle: dataObject.style,
        showScalebar: false
    });
    map.entities.push(createPin(dataObject.placeObject.coordinates, color));
}