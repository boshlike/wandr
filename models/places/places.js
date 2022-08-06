const mongoose = require("mongoose");
const placeSchema = new mongoose.Schema({
    country: {
        type: mongoose.ObjectId,
        ref: "Country"
    },
    countryName: String,
    countryBbox: Array,
    searchString: String,
    locality: String,
    landmark: String,
    coordinates: Array,
    createdBy: mongoose.ObjectId,
    visitedPlanned: String,
    notes: String
});

const Place = mongoose.model("Place", placeSchema);

module.exports = Place;