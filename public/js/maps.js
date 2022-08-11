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
    const userCountries = dataObject.userData.map(place => [place.countryCoord, place.visitedPlanned, place.countryName, place.countryBbox]);
    const uniqueUserCountries = getUnique(userCountries);
    const userPlaces = dataObject.userData.map(place => [place.coordinates, place.visitedPlanned, , place.countryName, place.countryBbox]);
    const locationTopLeft = new Microsoft.Maps.Location(50, 180);
    const locationBotRight = new Microsoft.Maps.Location(-50, -180);
    const map = new Microsoft.Maps.Map('#my-map', {
        credentials: dataObject.credentials ,
        bounds: new Microsoft.Maps.LocationRect.fromCorners(locationBotRight, locationTopLeft),
        mapTypeId: Microsoft.Maps.MapTypeId.grayscale,
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
    uniqueUserCountries.forEach(country => {
        layer.add(createPin(country[0], country[1], "country", country[2], true, country[3]));
    });
    userPlaces.forEach(place => {
        layer.add(createPin(place[0], place[1], "place", place[2], false, place[3]));
    });
    map.layers.insert(layer);
    // Access map object outside of function scope
    dashMap = map;
}
const createPin = (arr, visitedPlanned, type, country, isVisible, bbox) => {
    const location = new Microsoft.Maps.Location(arr[0], arr[1]);
    const color = visitedPlanned === "visited" ? "red" : "blue"
    const pin = new Microsoft.Maps.Pushpin(location, {color: color, visible: isVisible});
    pin.metadata = {visitedPlanned, type, country, bbox};
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
function hideShowPinsVisitedPlanned (toShow, scope) {
    const pins = dashMap.layers[0].getPrimitives();
    const pinsLen = pins.length;
    for (let i = 0; i < pinsLen; i++) {
        if ((pins[i].metadata.visitedPlanned === toShow && pins[i].metadata.type === scope) || (toShow === "all" && pins[i].metadata.type === scope)) {
            pins[i].setOptions({visible: true});
        } else {
           pins[i].setOptions({visible: false}); 
        }
    }
}
function hideShowPlacesCountriesPins (scope, countryName) {
    const pins = dashMap.layers[0].getPrimitives();
    const pinsLen = pins.length;
    if (scope === "country") {
        // If its the countries/world view, zoom out to world view
        zoomMap(false);
        // If its the countries/world view, only show the pins that are countries
        for (let i = 0; i < pinsLen; i++) {
            if (pins[i].metadata.type === scope) {
                pins[i].setOptions({visible: true});
            } else {
                pins[i].setOptions({visible: false});
            }
        }
        return;
    }
    // If its the country view, zoom to the country bbox
    let bbox = null;
    for (let i = 0; i < pinsLen; i++) {
        if (pins[i].metadata.country === countryName) {
            bbox = pins[i].metadata.bbox;
            break;
        }
    }
    zoomMap(true, bbox);
    // If its the country view, only show the pins for places in that country
    for (let i = 0; i < pinsLen; i++) {
        if (pins[i].metadata.type === scope) {
            pins[i].setOptions({visible: true});
        } else {
            pins[i].setOptions({visible: false});
        }
    }
}
function zoomMap (isZoomIn, bbox) {
    if (!isZoomIn) {
        const locationTopLeft = new Microsoft.Maps.Location(50, 180);
        const locationBotRight = new Microsoft.Maps.Location(-50, -180);
        const center = new Microsoft.Maps.Location(0, 0);
        dashMap.setView({
            bounds: new Microsoft.Maps.LocationRect(center, 360, -100),
        });
        dashMap.setView({center: center})
        return;
    }
    const locationTopLeft = new Microsoft.Maps.Location(bbox[0], bbox[1]);
    const locationBotRight = new Microsoft.Maps.Location(bbox[2], bbox[3]);
    dashMap.setView({
        bounds: new Microsoft.Maps.LocationRect.fromCorners(locationTopLeft, locationBotRight),
        zoom: 0
    })
}
function getUnique(arr) {
    const uniqueCountryNames = [];
    const uniqueIndex = [];
    const uniqueUserCountries = [];
    arr.forEach((item, index) => {
        if (!uniqueCountryNames.includes(item[2])) {
            uniqueCountryNames.push(item[2]);
            uniqueIndex.push(index);
        }
    
    })
    uniqueIndex.forEach(idxNum => {
        uniqueUserCountries.push(arr[idxNum]);
    })
    return uniqueUserCountries;
}
async function getTotalMap() {
    const dataObject = await fetchObject(`${location.origin}/fetchmapdata/fetchall`);
    const locationTopLeft = new Microsoft.Maps.Location(50, 180);
    const locationBotRight = new Microsoft.Maps.Location(-50, -180);
    const map = new Microsoft.Maps.Map('#my-total-map', {
        credentials: dataObject.credentials ,
        bounds: new Microsoft.Maps.LocationRect.fromCorners(locationBotRight, locationTopLeft),
        mapTypeId: Microsoft.Maps.MapTypeId.grayscale,
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
    const colorLen = dataObject.colors.length;
    const layer = new Microsoft.Maps.Layer("pin");
    dataObject.allPlacesVisited.forEach(place => {
        const location = new Microsoft.Maps.Location(place.place.coordinates[0], place.place.coordinates[1]);
        const color = dataObject.colors[Math.floor(Math.random()*colorLen)];
        const pin = new Microsoft.Maps.Pushpin(location, {color: color});
        layer.add(pin);
    });
    map.layers.insert(layer);
}