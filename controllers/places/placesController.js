require("dotenv").config();
var ObjectID = require('mongodb').ObjectID;
const countryModel = require("../../models/places/countries");
const placeModel = require("../../models/places/places");
const userModel = require("../../models/users/users");
const helpers = require("../../helpers/helpers");
const controllers = {
    showCreateForm: (req, res) => {
        res.render("places/new.ejs");
    },
    createPlace: async (req, res) => {
        // TODO validations
        const validatedResults = req.body;
        // Check if the country already exists in the database, if not, get geolocation data and store as a country
        const country = validatedResults.countryCode;
        let countryObject = await countryModel.findOne({countryCode: `${country}`});
        const userObject = await userModel.findOne({email: req.session.user});
        const userId = userObject._id;
        let countryId = countryObject ? countryObject._id : null;
        let placeId = null;
        if (!countryObject) {
            const url = `http://dev.virtualearth.net/REST/v1/Locations?countryRegion=${country}&key=${process.env.BING_API}`;
            const data = await helpers.fetchData(url);
            const countryDocument = {
                name: data.data.resourceSets[0].resources[0].name,
                countryCode: country,
                coordinates: data.data.resourceSets[0].resources[0].point.coordinates,
                bbox: data.data.resourceSets[0].resources[0].bbox
            }
            try {
                const object = await countryModel.create(countryDocument);
                countryObject = await countryModel.findOne({countryCode: `${country}`});
                countryId = object._id;
            } catch(err) {
                console.log(err);
                res.send("failed to create country");
                return;
            }
        }
        // Construct the object for the Place and add to database
        console.log(req.body)
        const place = {
            country: countryId,
            countryName: countryObject.name,
            countryBbox: countryObject.bbox,
            searchString: validatedResults.searchString,
            locality: validatedResults.locality,
            landmark: validatedResults.landmark,
            coordinates: validatedResults.center.split(","),
            createdBy: userId,
            visitedPlanned: validatedResults.visitedPlanned,
            notes: validatedResults.notes
        }
        try {
            const object = await placeModel.create(place);
            placeId = object._id;
        } catch(err) {
            console.log(err);
            res.send("failed to create country");
            return;
        }
        // Link the place to the user that entered it
        if (validatedResults.visitedPlanned === "visited") {
            userObject.visited.push(placeId);
            userObject.save();
        } else {
           userObject.planned.push(placeId);
           userObject.save();
        }
        res.redirect("/users/home");
    },
    showPlace: async (req, res) => {
        const idString = req.params.place_id;
        const place = await placeModel.findById(idString);
        res.render("places/show.ejs", place);
    },
    editPlace: async (req, res) => {
        res.send("edit page");
    },
    showDeletePlace: (req, res) => {
        const id = req.params.place_id;
        res.render("places/delete.ejs", {"_id": id});
    },
    deletePlace: async (req, res) => {
        if (req.body.yes) {
            try {
                await userModel.updateOne({
                    email: req.session.user,
                    $pullAll: {
                        planned: [{_id: req.params.place_id}]
                    }
                  });
                await placeModel.deleteOne({_id: req.params.place_id});  
            } catch(err) {
                res.send("failed to delete");
                console.log(err);
                return;
            }
        }
        res.redirect("/users/home");
    }
}
module.exports = controllers;