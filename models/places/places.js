const mongoose = require("mongoose");
const placeSchema = new mongoose.Schema({
    country: {
        type: mongoose.ObjectId,
        ref: "Country"
    },
    countryName: String,
    countryCoord: Array,
    countryBbox: Array,
    searchString: String,
    entityId: String,
    coordinates: Array,
    ratings: [{
        userId: mongoose.ObjectId,
        rating: Number
    }]
});

const Place = mongoose.model("Place", placeSchema);

module.exports = Place;