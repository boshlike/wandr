const mongoose = require("mongoose");
const placeSchema = new mongoose.Schema({
    country: ObjectId,
    locality: String,
    Landmark: String
});

const Place = mongoose.model("Place", placeSchema);

module.exports = Place;