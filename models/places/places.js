const mongoose = require("mongoose");
const placeSchema = new mongoose.Schema({
    country: ObjectId,
    locality: String,
    landmark: String,
    coordinates: Array
});

const Place = mongoose.model("Place", placeSchema);

module.exports = Place;