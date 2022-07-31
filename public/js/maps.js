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
    document.querySelector("#country-name").value = result.address.countryRegion;
    document.querySelector("#locality-name").value = result.address.locality;
    document.querySelector("#locality-center").value = [result.bestView.center.latitude, result.bestView.center.longitude];
    if (result.entityType === "Place") {
        document.querySelector("#landmark-name").value = result.title;
        document.querySelector("#landmark-center").value = [result.bestView.center.latitude, result.bestView.center.longitude];
    }
}
const fetchString = async (url) => {
    const response = await fetch(url)
    const data = await response.json()
    return data;
}