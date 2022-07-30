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
    console.log(dataToFetch)
    const formData = await fetchForm(`${location.origin}/fetchdata/${dataToFetch}`);
    const div = document.querySelector("#form-items");
    div.innerHTML = formData;

}
const fetchForm = async (url) => {
    const response = await fetch(url)
    const data = await response.json()
    return data;
}