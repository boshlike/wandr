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
        // Get the user
        const userObject = await userModel.findOne({email: req.session.user});
        // Get the list of places they have planned or visited and extract the coordinates
        const places = await Promise.all(userObject.visitedPlanned.map(async (place) => {
            const placeObject = await placeModel.findById(place.place_id);
            return placeObject;
        }));
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