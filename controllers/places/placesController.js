require("dotenv").config();
const countryModel = require("../../models/places/countries");
const helpers = require("../../helpers/helpers");
const controllers = {
    showCreateForm: (req, res) => {
        res.render("places/new.ejs");
    },
    createPlace: async (req, res) => {
        // TODO validations
        // Check if the country already exists in the database, if not, get geolocation data and store as a country
        const country = req.body.country;
        const countrySearch = await countryModel.findOne({name: `${country}`});
        if (!countrySearch) {
            const url = `http://dev.virtualearth.net/REST/v1/Locations?query=${country}&key=${process.env.BING_API}`;
            const data = await helpers.fetchData(url);
            const countryDocument = {
                name: data.data.resourceSets[0].resources[0].name,
                coordinates: data.data.resourceSets[0].resources[0].point.coordinates,
                bbox: data.data.resourceSets[0].resources[0].bbox
            }
            try {
                await countryModel.create(countryDocument);
            } catch(err) {
                console.log(err);
                res.send("failed to create country");
                return;
            }
        }
        res.redirect("/places/create");
    }
}
module.exports = controllers;