const mongoose = require("mongoose");
const placeSchema = new mongoose.Schema({
    country: mongoose.ObjectId,
    countryName: String,
    locality: String,
    landmark: String,
    coordinates: Array,
    createdBy: mongoose.ObjectId,
    visitedPlanned: String,
    notes: String
});

const Place = mongoose.model("Place", placeSchema);

module.exports = Place;