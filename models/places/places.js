const mongoose = require("mongoose");
const placeSchema = new mongoose.Schema({
    country: mongoose.ObjectId,
    locality: String,
    landmark: String,
    coordinates: Array,
    createdBy: mongoose.ObjectId,
    visitedPlanned: String
});

const Place = mongoose.model("Place", placeSchema);

module.exports = Place;