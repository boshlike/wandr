const bcrypt = require("bcrypt");
const userModel = require("../../models/users/users");
const placeModel = require("../../models/places/places");
const countryModel = require("../../models/places/countries");
const controller = {
    showRegistrationForm: (req, res) => {
        res.render("pages/register.ejs");
    },
    register: async (req, res) => {
        //TODO validations
        // Ensure passwords match
        // Ensure no duplicate emails in database
        // Hash the password
        const hash = await bcrypt.hash(req.body.password, 10);
        // Create the user entry
        try {
            await userModel.create({
                name: req.body.name,
                email: req.body.email,
                hash: hash
            })
        } catch(err) {
            console.log(err);
            res.send("failed to create user");
            return;
        }
        // Redirect to login
        res.redirect("/users/login");
    },
    displayLoginPage: (req, res) => {
        res.render("pages/login.ejs");
    },
    login: async (req, res) => {
        // TODo validations
        const validatedResults = req.body;
        let user = null;
        try {
            user = await userModel.findOne({email: validatedResults.email});
        } catch(err) {
            res.send(err);
            return;
        }
        // Use bcrypt to compare given password to one stored in DB
        const passwordMatches = await bcrypt.compare(validatedResults.password, user.hash);
        if (!passwordMatches) {
            res.send('incorrect password');
            return;
        }
        // Log user in by creating a session
        req.session.regenerate((err) => {
            if (err) {
                res.send("Unable to regenerate session");
                console.log(err)
                return;
            }
            req.session.user = validatedResults.email;
            // Store user information in the session
            req.session.save((err) => {
                if (err) {
                    res.send("Unable to save session");
                    console.log(err)
                    return;
                }
                res.redirect("/users/home")
            })
        })
    },
    showDashboard: async (req, res) => {
        const user = req.session.user.toLowerCase();
        let places = null;
        try {
          places = await userModel.aggregate([
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
                    "visitedPlanned.place_id": 1,
                    "place.countryName": 1,
                    "place.searchString": 1,
                }},
                { $replaceRoot: { newRoot: { $mergeObjects: [ "$visitedPlanned", "$place" ] } } }
            ]);
        } catch(err) {
            console.log(err);
            res.send("failed to fetch data");
            return;
        }
        console.log(places)
        res.render("dash/dash.ejs", {places});
    },
    showProfile: async (req, res) => {
        const userProfile = await userModel.findOne({email: req.session.user});
        res.render("users/profile.ejs", {userProfile});
    },
    logout: async (req, res) => {
        req.session.user = null;
        req.session.save((err) => {
            if (err) {
                res.send(err);
                return;
            }
            req.session.regenerate((err) => {
                if (err) {
                    res.send(err);
                    return;
                }
                res.redirect("/");
            })
        })
    }
}
module.exports = controller;