// Display the map of the world centered and zoomed out
function GetMap() {
    const worldBox = Microsoft.Maps.LocationRect.fromCorners(new Microsoft.Maps.Location(82.906490, -169.628906), new Microsoft.Maps.Location(-64.287526, 182.109375));
    const map = new Microsoft.Maps.Map('#my-map', {
        credentials: "Ag3EgilR0lQgmH1519Wzom4yo7qgUABgEOOZ4DOpoI1zox5NUUcVGi_qZ1DXadt6",
        center: new Microsoft.Maps.Location(0, 0),
        mapTypeId: Microsoft.Maps.MapTypeId.canvasLight,
        bounds: worldBox,
        showLocateMeButton: false,
        showZoomButtons: false,
        disableScrollWheelZoom: true,
        showMapTypeSelector: false
    });
    //Add your post map load code here.
}
// Autosuggest function
function GetSuggestion() {
    Microsoft.Maps.loadModule('Microsoft.Maps.AutoSuggest', {
        callback: function () {
            const manager = new Microsoft.Maps.AutosuggestManager({
                placeSuggestions: true
            });
            manager.attachAutosuggest('#searchBox', '#searchBoxContainer', selectedSuggestion);
            console.log(manager.getSuggestions())
        },
        errorCallback: function(msg){
            alert(msg);
        },
        credentials: 'Ag3EgilR0lQgmH1519Wzom4yo7qgUABgEOOZ4DOpoI1zox5NUUcVGi_qZ1DXadt6' 
    });
}

async function getCountryGeocode(countryCode, locality) {
    const credentials = "AjSM6jXlMl0BeYCkp1-wXlAGk-6wbNA586gX3NqEKSLYc0QAyopFEh7fSVOCRd3T";
    const countryUrl = `http://dev.virtualearth.net/REST/v1/Locations/${countryCode}/-/-/-?key=${credentials}`;
    const localityUrl = `http://dev.virtualearth.net/REST/v1/Locations/${countryCode}/-/-/${locality}?key=${credentials}`;
    // Fetch the geocode
    const countryData = await geocodeApiCall(countryUrl);
    // If there is no locality, don't fetch the locality
    if (locality !== undefined) {
        const localityData = await geocodeApiCall(localityUrl);
        return [countryData.resourceSets[0].resources[0].geocodePoints[0].coordinates, localityData.resourceSets[0].resources[0].geocodePoints[0].coordinates];
    }
    return [countryData.resourceSets[0].resources[0].geocodePoints[0].coordinates, null];
}

async function geocodeApiCall(url) {
    const response = await fetch(url);
    return await response.json();
}

async function selectedSuggestion(result) {
    //Populate the address textbox values.
    console.log(result.address)
    const coord = await getCountryGeocode(result.address.countryRegionISO2, result.address.locality);
    const countryCoord = coord[0];
    const localityCoord = coord[1];
    document.querySelector("#country-geo").value = countryCoord;
    if (localityCoord !== null) {
        document.querySelector("#place-geo").value = localityCoord;
    }
    document.querySelector('#country').value = result.address.countryRegion || '';
    document.querySelector('#place').value = result.address.locality || '';
}