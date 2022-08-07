require("dotenv").config();
const formsModels = require("../../models/forms/forms");
const userModel = require("../../models/users/users");
const placeModel = require("../../models/places/places");
const countryModel = require("../../models/places/countries");
const controllers = {
    getFormData: (req, res) => {
        const data = req.params.data;
        res.json(formsModels[data]);
    },
    getMapsDataObject: async (req, res) => {
        // Get the user
        const userObject = await userModel.findOne({email: req.session.user});
        // Get the list of places they have planned or visited and extract the coordinates
        const places = await Promise.all(userObject.visitedPlanned.map(async (place) => {
            const placeObject = await placeModel.findById(place.place_id);
            return placeObject;
        }));
        const dataObject = {
            credentials: process.env.BING_API,
            visitedPlanned: places,
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
        	placeObject = await placeModel.findById(req.params._id);
      	} catch(err) {
        	console.log(err);
        	res.send("failed to create user");
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