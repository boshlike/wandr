require("dotenv").config();
const userModel = require("../../models/users/users");
const placeModel = require("../../models/places/places");
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
          console.log(userDataObject)
      } catch(err) {
          console.log(err);
          res.send("failed to fetch data");
          return;
      }
      const dataObject ={
        userData: userDataObject,
        credentials: process.env.BING_API,
        style: {
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
      }
      res.json(dataObject);
    },
    getOnePlaceData: async (req, res) => {
		let placeObject = null;
      	try {
        	placeObject = await placeModel.findById(req.params._id,"countryBbox coordinates visitedPlanned").lean();
      	} catch(err) {
        	console.log(err);
        	res.send("failed to get one place");
        	return;
      	}
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
		res.json({placeObject, credentials, style});
	}
}
module.exports = controllers;