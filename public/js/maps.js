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
    document.querySelector("#entity-id").value = result.entityId;
    document.querySelector("#country-code").value = result.address.countryRegionISO2;
    document.querySelector("#center").value = [result.bestView.center.latitude, result.bestView.center.longitude];
}
const fetchObject = async (url) => {
    const response = await fetch(url)
    const data = await response.json()
    return data;
}
let dashMap = null;
async function GetMap() {
    const dataObject = await fetchObject(`${location.origin}/fetchmapdata`);
    const countryPlannedCoords = dataObject.planned.map(place => place.countryCoord);
    const countryVisitedCoords = dataObject.visited.map(place => place.countryCoord);
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
    // Add the pins to a pin layer of the map
    const layer = new Microsoft.Maps.Layer("pin");
    countryPlannedCoords.forEach(coord => {
        layer.add(createPin(coord, "red", "planned"));
    });
    countryVisitedCoords.forEach(coord => {
        layer.add(createPin(coord, "blue", "visited"));
    });
    map.layers.insert(layer);
    // Access map object outside of function scope
    dashMap = map;
}
const createPin = (arr, color, visitedPlanned) => {
    const location = new Microsoft.Maps.Location(arr[0], arr[1]);
    const pin = new Microsoft.Maps.Pushpin(location, {color: color});
    pin.metadata = visitedPlanned;
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
// Function that hides and shows pins depending on if planned or visited is clicked
function hideShowPins (toShow) {
    const pins = dashMap.layers[0].getPrimitives();
    const pinsLen = pins.length;
    for (let i = 0; i < pinsLen; i++) {
        if (pins[i].metadata === toShow || toShow === "all") {
            pins[i].setOptions({visible: true});
        } else {
           pins[i].setOptions({visible: false}); 
        }
    }
}