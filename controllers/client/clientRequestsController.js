require("dotenv").config();
const formsModels = require("../../models/forms/forms");
const userModel = require("../../models/users/users");
const placeModel = require("../../models/places/places");
const countryModel = require("../../models/places/countries");
const controllers = {
    getFormData: (req, res) => {
        const data = req.params.data;
        res.json(formsModels[data]);
    },
    getMapsDataObject: async (req, res) => {
        // Get the user
        const userObject = await userModel.findOne({email: req.session.user});
        // Get the list of places they have planned or visited and extract the coordinates
        const placesPlanned = await Promise.all(userObject.planned.map(async (place) => {
            const placeObject = await placeModel.findById(place);
            const countryObject = await countryModel.findById(placeObject.country);
            return [placeObject, countryObject];
        }));
        const placesVisited = await Promise.all(userObject.visited.map(async (place) => {
            const placeObject = await placeModel.findById(place);
            const countryObject = await countryModel.findById(placeObject.country);
            return [placeObject, countryObject];
        }));
        const dataObject = {
            credentials: process.env.BING_API,
            planned: placesPlanned,
            visited: placesVisited
        }
        res.json(dataObject);
    }
}
module.exports = controllers;