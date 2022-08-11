require("dotenv").config();
var ObjectId = require('mongodb').ObjectId;
const countryModel = require("../../models/places/countries");
const placeModel = require("../../models/places/places");
const userModel = require("../../models/users/users");
const helpers = require("../../helpers/helpers");
const controllers = {
    showCreateForm: (req, res) => {
        res.render("places/new.ejs");
    },
    createUserPlace: async (req, res) => {
        // TODO validations
        const validatedResults = req.body;
        const country = validatedResults.countryCode;
        let countryObject = null;
        let userObject = null;
        let placeObject = null;
        let userId = null;
        let countryId = null;
        let placeId = null;
        try {
            countryObject = await countryModel.findOne({countryCode: `${country}`});
            userObject = await userModel.findOne({email: req.session.user});
            placeObject = await placeModel.findOne({entityId: validatedResults.entityId});
            userId = userObject._id;
            countryId = countryObject ? countryObject._id : null;
            placeId = placeObject ? placeObject._id : null;
        } catch(err) {
            console.log(err);
            res.render("pages/error.ejs", {err});
            return;
        }
        // Check if the country already exists in the database, if not, get geolocation data and store as a country
        if (!countryObject) {
            const url = `https://dev.virtualearth.net/REST/v1/Locations?countryRegion=${country}&key=${process.env.BING_API}`;
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
                res.render("pages/error.ejs", {err});
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
                coordinates: validatedResults.center.split(",")
            }
            if (validatedResults.visitedPlanned === "visited") {
                place.ratings = [{userId: userId, rating: parseInt(validatedResults.rating)}]
            }
            try {
                const object = await placeModel.create(place);
                placeId = object._id;
            } catch(err) {
                console.log(err);
                res.render("pages/error.ejs", {err});
                return;
            }
        } else {
            // Otherwise update the place if there has been a new rating
            if (validatedResults.visitedPlanned === "visited") {
                try {
                    const rating = {userId: userId, rating: parseInt(validatedResults.rating)};
                    placeObject.ratings.push(rating);
                    placeObject.save();
                } catch(err) {
                    console.log(err);
                    res.render("pages/error.ejs", {err});
                    return;
                }
            }
        }
        // Link the place to the user that entered it
        const userNotesOnPlace = {
            place_id: placeId,
            notes: validatedResults.notes,
            visitedPlanned: validatedResults.visitedPlanned,
            dateFrom: validatedResults.dateFrom,
            dateTo: validatedResults.dateTo,
            rating: validatedResults.rating
        }
        userObject.visitedPlanned.push(userNotesOnPlace);
        userObject.save();
        res.redirect("/users/home");
    },
    showUserPlace: async (req, res) => {
        const id = ObjectId(req.params.place_id);
        const user = req.session.user.toLowerCase();
        let userPlace = null;
        try {
            userPlace = await userModel.aggregate([
                {$match: {email: user}},
                {$unwind: "$visitedPlanned"},
                {$match: {"visitedPlanned.place_id": id}},
                {$lookup: {
                    from: "places",
                    localField: "visitedPlanned.place_id",
                    foreignField: "_id",
                    as: "place"
                }},
                {$unwind: "$place"},
                {$project: {
                    _id: 0, 
                    "visitedPlanned.visitedPlanned": 1,
                    "visitedPlanned.place_id": 1,
                    "visitedPlanned.notes": 1,
                    "visitedPlanned.dateFrom": 1,
                    "visitedPlanned.dateTo": 1,
                    "visitedPlanned.rating": 1,   
                    "place.searchString": 1,
                    "place.countryName": 1
                }},
                { $replaceRoot: { newRoot: { $mergeObjects: [ "$visitedPlanned", "$place" ] } } }
            ]);
        } catch(err) {
            console.log(err);
            res.render("pages/error.ejs", {err});
            return;
        }
        res.render("places/showUserPlace.ejs", userPlace[0]);
    },
    showEditUserPlace: async (req, res) => {
        const id = ObjectId(req.params.place_id);
        const user = req.session.user.toLowerCase();
        let userPlace = null;
        try {
            userPlace = await userModel.aggregate([
                {$match: {email: user}},
                {$unwind: "$visitedPlanned"},
                {$match: {"visitedPlanned.place_id": id}},
                {$lookup: {
                    from: "places",
                    localField: "visitedPlanned.place_id",
                    foreignField: "_id",
                    as: "place"
                }},
                {$unwind: "$place"},
                {$project: {
                    _id: 0, 
                    "visitedPlanned.visitedPlanned": 1,
                    "visitedPlanned.place_id": 1,
                    "visitedPlanned.notes": 1,
                    "visitedPlanned.dateFrom": 1,
                    "visitedPlanned.dateTo": 1,
                    "visitedPlanned.rating": 1,   
                    "place.searchString": 1
                }},
                { $replaceRoot: { newRoot: { $mergeObjects: [ "$visitedPlanned", "$place" ] } } }
            ]);
        } catch(err) {
            console.log(err);
            res.render("pages/error.ejs", {err});
            return;
        }
        res.render("places/edit.ejs", userPlace[0]);
    },
    editUserPlace: async (req, res) => {
        // TODO validations
        const validatedResults = req.body;
        console.log(validatedResults)
        const user = req.session.user.toLowerCase();
        const id = ObjectId(req.params.place_id);
        try {
            await userModel.updateOne(
                {email: user},
                {$set: {"visitedPlanned.$[element]": validatedResults}},
                {arrayFilters: [{ "element.place_id": id }]}
            )
            res.redirect(`/places/user/${req.params.place_id}`);
        } catch(err) {
            console.log(err);
            res.render("pages/error.ejs", {err});
            return;
        }
    },
    showDeleteUserPlace: (req, res) => {
        const id = req.params.place_id;
        res.render("places/delete.ejs", {"_id": id});
    },
    deleteUserPlace: async (req, res) => {
        const id = ObjectId(req.params.place_id)
        if (req.body.yes) {
            try {
                const userDoc = await userModel.findOneAndUpdate({email: req.session.user}, {$pull: {
                    visitedPlanned: {
                        place_id: {
                            $in: [id]
                        }
                    }
                }});
                await placeModel.updateOne({_id: id}, {$pull: {
                    ratings: {
                        userId: {
                            $in: [userDoc._id]
                        }
                    }
                }});
            } catch(err) {
                console.log(err);
                res.render("pages/error.ejs", {err});
                return;
            }
        }
        res.redirect("/users/home");
    },
    showInspiration: async (req, res) => {
        const topFive = await placeModel.aggregate([
            {$match: {}},
            {$unwind: "$ratings"},
            {$group: {
                _id: "$searchString",
                averageRating: {$avg: "$ratings.rating"}
            }},
            {$sort: {"averageRating": -1}},
            {$limit: 5}
        ]);
        const bottomFive = await placeModel.aggregate([
            {$match: {}},
            {$unwind: "$ratings"},
            {$group: {
                _id: "$searchString",
                averageRating: {$avg: "$ratings.rating"}
            }},
            {$sort: {"averageRating": 1}},
            {$limit: 5}
        ]);
        const mostVisits = await userModel.aggregate([
            {$match: {}},
            {$unwind: "$visitedPlanned"},
            {$match: {"visitedPlanned.visitedPlanned": "visited"}},
            {$group: {
                _id: "$visitedPlanned.place_id",
                count: {$sum: 1}
            }},
            {$lookup: {
                from: "places",
                localField: "_id",
                foreignField: "_id",
                as: "place"
            }},
            {$unwind: "$place"},
            {$project: {
                _id: 0, 
                "count": 1,  
                "place.searchString": 1
            }},
            {$sort: {"count": -1}},
            {$limit: 5}
        ]);
        res.render("pages/inspire.ejs", {topFive, bottomFive, mostVisits});
    },
    showBeen: (req, res) => {
        res.render("pages/been.ejs");
    }
}
module.exports = controllers;