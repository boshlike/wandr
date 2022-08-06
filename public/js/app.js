// Toggle the navbar
const toggleBurger = () => {
    const burgerIcon = document.querySelector("#burger");
    const navMenu = document.querySelector("#navbarMenu");
    burgerIcon.classList.toggle("is-active");
    navMenu.classList.toggle("is-active");
}
// Toggle new place form
const toggleVisitedPlanned = async () => {
    // Make selecting "Select one" disabled
    document.querySelector("#disable-selection").setAttribute("disabled", "true");
    // Get the form HTML from the server and store in an element
    const dataToFetch = document.querySelector("#visited-planned").value;
    const formData = await fetchData(`${location.origin}/fetchformdata/${dataToFetch}`);
    const div = document.querySelector("#form-items");
    div.innerHTML = formData;

}
const fetchData = async (url) => {
    const response = await fetch(url)
    const data = await response.json()
    return data;
}
// Toggle panel view in home dashboard
document.querySelector("#panel-block").onclick = (event) => {
    // If the user does not click on a panel button then do nothing
    if (event.target.classList.contains("panel-tabs")) {
        return;
    }
    // If the icon clicked is already active then do nothing
    if (event.target.classList.contains("is-active")) {
        return;
    }
    // Remove is active from other tabs
    const panelNavOptions = event.target.parentNode.children;
    for (let i = 0, len = panelNavOptions.length; i < len; i++) {
        panelNavOptions[i].classList.remove("is-active")
    }
    // Add is active to tab clicked
    event.target.classList.add("is-active");
    const targetName =  event.target.text;
    console.log(targetName)   
    // Add is-active to the relevant visited, planned or both
    const panelBlock = document.getElementsByClassName("panel-block");
    for (let i = 0, len = panelBlock.length; i < len; i++) {
        switch(targetName) {
            case "All":
                panelBlock[i].removeAttribute("style");
                break;
            case "Visited":
                if (panelBlock[i].classList.contains("visited")) {
                    panelBlock[i].removeAttribute("style");
                } else {
                    panelBlock[i].style.display = "none";
                }
                break;
            case "Planned":
                if (panelBlock[i].classList.contains("planned")) {
                    panelBlock[i].removeAttribute("style");
                } else {
                    panelBlock[i].style.display = "none";
                }
                break;
        }
    }
}