require("dotenv").config();
const userModel = require("../../models/users/users");
const placeModel = require("../../models/places/places");
const credentials = process.env.BING_API;
const style = {
  "version": "1.*",
  "settings": {
    "landColor": "#FFF9F6D8"
  },
  "elements": {
    "baseMapElement": {
    "labelVisible": false
    },
    "area": {
    "visible": false
    },
    "water": {
    "fillColor": "#8DCFD0"
    }
  }
}
const controllers = {
    getMapsDataObject: async (req, res) => {
      const user = req.session.user.toLowerCase();
      let userDataObject = null;
      try {
        userDataObject = await userModel.aggregate([
              {$match: {email: user}},
              {$unwind: "$visitedPlanned"},
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
                  "place.countryCoord": 1,
                  "place.coordinates": 1,
                  "place.countryName": 1,
                  "place.countryBbox": 1
              }},
              { $replaceRoot: { newRoot: { $mergeObjects: [ "$visitedPlanned", "$place" ] } } }
          ]);
      } catch(err) {
          console.log(err);
          res.render("pages/error.ejs", {err});
          return;
      }
      const dataObject ={
        userData: userDataObject,
        credentials,
        style
      }
      res.json(dataObject);
    },
    getOnePlaceData: async (req, res) => {
		let placeObject = null;
      	try {
        	placeObject = await placeModel.findById(req.params._id,"countryBbox coordinates visitedPlanned").lean();
      	} catch(err) {
            console.log(err);
            res.render("pages/error.ejs", {err});
            return;
      	}
		res.json({placeObject, credentials, style});
	},
  fetchAll: async (req, res) => {
    try {
      const allPlacesVisited = await userModel.aggregate([
        {$match: {}},
        {$unwind: "$visitedPlanned"},
        {$match: {"visitedPlanned.visitedPlanned": "visited"}},
        {$lookup: {
            from: "places",
            localField: "visitedPlanned.place_id",
            foreignField: "_id",
            as: "place"
        }},
        {$unwind: "$place"},
        {$project: {
            _id: 0, 
            "place.coordinates": 1
        }}
      ]);
      const colors = ["black", "silver", "gray", "white", "maroon", "red", "purple", "fuchsia", "green", "lime", "olive", "yellow", "navy", "blue", "teal", "aqua"];
      res.json({allPlacesVisited, credentials, style, colors});
    } catch(err) {
      console.log(err);
      res.render("pages/error.ejs", {err});
      return;
    }
  }
}
module.exports = controllers;