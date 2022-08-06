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
        const country = validatedResults.countryCode;
        let countryObject = await countryModel.findOne({countryCode: `${country}`});
        const userObject = await userModel.findOne({email: req.session.user});
        const placeObject = await placeModel.findOne({entityId: validatedResults.entityId});
        const userId = userObject._id;
        let countryId = countryObject ? countryObject._id : null;
        let placeId = placeObject ? placeObject._id : null;
        // Check if the country already exists in the database, if not, get geolocation data and store as a country
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
        // Check if the place already exists in the database based on the unique identifier
        if (!placeObject) {
        // If so, create the place
            const place = {
                country: countryId,
                countryName: countryObject.name,
                countryBbox: countryObject.bbox,
                countryCoord: countryObject.coordinates,
                searchString: validatedResults.searchString,
                entityId: validatedResults.entityId,
                coordinates: validatedResults.center.split(","),
                rating: validatedResults.visitedPlanned === "visited" ? {rating: validatedResults.rating, user: userId} : null,
            }
            try {
                const object = await placeModel.create(place);
                placeId = object._id;
            } catch(err) {
                console.log(err);
                res.send("failed to create country");
                return;
            }
        } else {
            // Otherwise update the place if there has been a new rating
            if (validatedResults.validatedResults.visitedPlanned === "visited") {
                try {
                    const rating = {userId: userId, rating: validatedResults.rating}
                    placeObject.ratings.push(rating);
                    placeObject.save();
                } catch(err) {
                    console.log(err);
                    res.send("failed to create country");
                    return;
                }
            }
        }
        // Link the place to the user that entered it
        const userNotesOnPlace = {
            place_id: placeId,
            notes: validatedResults.notes,
            dateFrom: validatedResults.dateFrom,
            dateTo: validatedResults.dateTo,
            rating: validatedResults.rating
        }
        if (validatedResults.visitedPlanned === "visited") {
            userObject.visited.push(userNotesOnPlace);
            userObject.save();
        } else {
           userObject.planned.push(userNotesOnPlace);
           userObject.save();
        }
        res.redirect("/users/home");
    },
    showPlace: async (req, res) => {
        const idString = req.params.place_id;
        const place = await placeModel.findById(idString, "countryName locality landmark visitedPlanned dateFrom dateTo rating notes");
        console.log(place)
        res.render("places/show.ejs", place);
    },
    showEditPlace: async (req, res) => {
        let place = null;
        try {
            place = await placeModel.findOne({_id: req.params.place_id});
        } catch(err) {
            res.send("couldn't find place");
            console.log(err);
            return;
        }
        console.log(place)
        res.render("places/edit.ejs", {place});
    },
    editPlace: async (req, res) => {
        console.log(req.body, req.params.place_id);
        try {
            const place = await placeModel.findById(req.params.place_id);
            const keys = Object.keys(req.body);
            keys.forEach(key => {
                place[key] = req.body[key];
            });
            await place.save();
            res.redirect(`/places/${place._id}`);
        } catch(err) {
            res.send("failed to update");
            console.log(err);
            return;
        }
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
                        planned: [{_id: req.params.place_id}],
                        visited: [{_id: req.params.place_id}]
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