const mongoose = require("mongoose");
const usersSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        lowercase: true,
        required: true,
        unique: true
    },
    hash: {
        type: String,
        required: true
    },
    aboutMe: {
        type: String
    },
    profileImg: {
        data: Buffer,
        contentType: String
    },
    visitedPlanned: [{
        place_id: {
            type: mongoose.ObjectId,
            ref: "Place"
        },
        visitedPlanned: String,
        notes: String,
        dateFrom: String,
        dateTo: String,
        rating: Number
    }]
});

const UserModel = mongoose.model("User", usersSchema);

module.exports = UserModel;