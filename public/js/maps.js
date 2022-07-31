// Autosuggest function (note needs to be in this format)
async function GetSuggestion() {
    const credentials = await fetchString(`${location.origin}/fetchstring`);
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
        credentials: credentials 
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
const fetchString = async (url) => {
    const response = await fetch(url)
    const data = await response.json()
    return data;
}
async function GetMap() {
    const credentials = await fetchString(`${location.origin}/fetchstring`);
    const map = new Microsoft.Maps.Map('#my-map', {
        credentials: credentials,
        center: new Microsoft.Maps.Location(51.50632, -0.12714),
        mapTypeId: Microsoft.Maps.MapTypeId.grayscale,
        zoom: 0
    });

    //Add your post map load code here.
}