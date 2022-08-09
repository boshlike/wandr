// Toggle the navbar
const toggleBurger = () => {
    const burgerIcon = document.querySelector("#burger");
    const navMenu = document.querySelector("#navbarMenu");
    burgerIcon.classList.toggle("is-active");
    navMenu.classList.toggle("is-active");
}
// Toggle new place form
const toggleVisitedPlanned = () => {
    // Make selecting "Select one" disabled
    try {
       document.querySelector("#disable-selection").setAttribute("disabled", "true"); 
    } catch(err) {
        // Do nothing
    }
    // Get the form HTML from the server and store in an element
    const visitedPlanned = document.querySelector("#visited-planned");
    const disableElements = document.querySelectorAll(".disable");
    if (visitedPlanned.value === "planned") {
        // Just set the notes field as enabled and clear the other fields
        disableElements.forEach((element, index) => {
            if (index === 0) {
                element.disabled = false;
            } else {
                element.disabled = true;
                element.value = "";
            }
        })
        return;
    }
    disableElements.forEach(element => {
        element.disabled = false;
    });
}
const fetchData = async (url) => {
    const response = await fetch(url)
    const data = await response.json()
    return data;
}
const panelLogic = (event) => {
    // If the user does not click on a panel button then do nothing
    if (event.target.classList.contains("box")) {
        return;
    }
    // If the icon clicked is already active and is not the back button then do nothing
    if (event.target.classList.contains("is-active") && event.target.id !== "back-button") {
        return;
    }
    // If the back button is the target, set the target to the All button instead
    if (event.target.id === "back-button") {
        const allButton = document.querySelector("#all-button");
        const event = new PointerEvent("click", {composed: true, bubbles: true});
        console.log(event)
        allButton.dispatchEvent(event);
        return;
    }
    // Remove is active from other buttons
    const buttonOptions = event.target.parentNode.children;
    for (let i = 0, len = buttonOptions.length; i < len; i++) {
        buttonOptions[i].classList.remove("is-active")
    }
    // Add is active to tab clicked
    event.target.classList.add("is-active");
    const targetName =  event.target.innerText;
    const scope = document.querySelector("#scope").innerText;
    hideShowPinsVisitedPlanned(targetName.toLowerCase(), scope);
    // Add is-active to the relevant visited, planned or both
    const list = document.getElementsByClassName("list-item");
    for (let i = 0, len = list.length; i < len; i++) {
        switch(targetName) {
            case "Back":
                break;
            case "All":
                list[i].removeAttribute("style");
                break;
            case "Visited":
                if (list[i].classList.contains("visited")) {
                    list[i].removeAttribute("style");
                } else {
                    list[i].style.display = "none";
                }
                break;
            case "Planned":
                if (list[i].classList.contains("planned")) {
                    list[i].removeAttribute("style");
                } else {
                    list[i].style.display = "none";
                }
                break;
        }
    }
}
// Toggle panel view in home dashboard
document.querySelector("#control-panel").onclick = (event) => {
    panelLogic(event);
}
// Toggle country view to places view
document.querySelector("#list-panel").onclick = (event) => {
    // If the user does not click on a country then do nothing
    if (!event.target.classList.contains("country")) {
        return;
    }
    const countries = document.getElementsByClassName("country-li");
    // Zoom the map and show the pins
    const places = document.getElementsByClassName("place");
    hideShowPlacesCountriesPins("place", event.target.innerText);
    // Hide the countries from view and change the scope
    document.querySelector("#scope").innerText = "place";
    for (let i = 0, len = countries.length; i < len; i++) {
        countries[i].classList.add("hidden");
    }
    //Make the back button visible
    document.querySelector("#back-button").classList.remove("hidden");
    // Show the places within that specific country
    for (let i = 0, len = places.length; i < len; i++) {
        if (places[i].classList.contains(event.target.innerText.replace(/\s/g, ""))) {
            places[i].classList.remove("hidden");
        }
    }
}
// Logic for back button
document.querySelector("#back-button").onclick = () => {
    // Make the back button invisible
    document.querySelector("#back-button").classList.add("hidden");
    // Zoom out the map
    const countries = document.getElementsByClassName("country-li");
    const places = document.getElementsByClassName("place");
    // Hide the places and change the scope
    document.querySelector("#scope").innerText = "country";
    hideShowPlacesCountriesPins("country", null);
    for (let i = 0, len = places.length; i < len; i++) {
        places[i].classList.add("hidden");
    }
    // Show the countries
    for (let i = 0, len = countries.length; i < len; i++) {
        countries[i].classList.remove("hidden");
    }
}