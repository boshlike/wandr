const bcrypt = require("bcrypt");
const userModel = require("../../models/users/users");
const placeModel = require("../../models/places/places");
const userValidationSchema = require("../../validation/userValidation");
const loginValidationSchema = require("../../validation/loginValidation");
const controller = {
    showRegistrationForm: (req, res) => {
        const errorData = null;
        res.render("pages/register.ejs", {errorData});
    },
    register: async (req, res) => {
        let validatedResults = null;
        // Validations
        try {
            validatedResults = await userValidationSchema.validateAsync(req.body, {abortEarly: false});
        } catch(err) {
            const errMsg = []
            err.details.forEach(message => errMsg.push(message.message));
            const errorData = {
                errMsg: errMsg,
                name: req.body.name,
                email: req.body.email
            }
            res.render("pages/register.ejs", {errorData});
            return;
        }
        // Hash the password
        const hash = await bcrypt.hash(validatedResults.password, 10);
        // Create the user entry
        try {
            await userModel.create({
                name: validatedResults.name,
                email: validatedResults.email,
                hash: hash
            })
        } catch(err) {
            // Ensure no duplicate emails in database. Email is a unique key throwing MongoDB error 11000
            if (err.code === 11000) {
                const errorData = {
                    errMsg: ["The email address already exists"],
                    name: validatedResults.name,
                    email: validatedResults.email
                }
                res.render("pages/register.ejs", {errorData});
                return;
            }
            console.log(err);
            res.render("pages/error.ejs", {err});
            return;
        }
        // Redirect to login
        res.redirect("/users/login");
    },
    displayLoginPage: (req, res) => {
        const errorData = null;
        res.render("pages/login.ejs", {errorData});
    },
    login: async (req, res) => {
        let user = null;
        let validatedResults = null;
        // Validations
        try {
            validatedResults = await loginValidationSchema.validateAsync(req.body, {abortEarly: false});
        } catch(err) {
            const errMsg = []
            err.details.forEach(message => errMsg.push(message.message));
            const errorData = {
                errMsg: errMsg,
                email: req.body.email
            }
            res.render("pages/login.ejs", {errorData});
            return;
        }
        try {
            user = await userModel.findOne({email: validatedResults.email});
        } catch(err) {
            console.log(err);
            res.render("pages/error.ejs", {err});
            return;
        }
        // Check if the user has returned a document and print error message if not
        if (!user) {
            const errorData = {
                errMsg: ["The email address does not exist."],
                email: req.body.email
            }
            res.render("pages/login.ejs", {errorData});
            return;
        }
        // Use bcrypt to compare given password to one stored in DB
        const passwordMatches = await bcrypt.compare(validatedResults.password, user.hash);
        if (!passwordMatches) {
            const errorData = {
                errMsg: ["Your password is incorrect."],
                email: req.body.email
            }
            res.render("pages/login.ejs", {errorData});
            return;
        }
        // Log user in by creating a session
        req.session.regenerate((err) => {
            if (err) {
                console.log(err);
                res.render("pages/error.ejs", {err});
                return;
            }
            req.session.user = validatedResults.email;
            // Store user information in the session
            req.session.save((err) => {
                if (err) {
                    console.log(err);
                    res.render("pages/error.ejs", {err});
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
            res.send("failed to fetch user dashboard");
            return;
        }
        res.render("dash/dash.ejs", {places});
    },
    showProfile: async (req, res) => {
        try {
            const userProfile = await userModel.findOne({email: req.session.user}).lean();
            res.render("users/profile.ejs", {userProfile});
        } catch(err) {
            console.log(err);
            res.send("failed to fetch user profile");
            return;
        }
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
    },
    showEditProfile: async (req, res) => {
        try {
            const userProfile = await userModel.findOne({email: req.session.user});
            res.render("users/edit.ejs", {userProfile});
        } catch(err) {
            console.log(err);
            res.send("failed to fetch user profile");
            return;
        }
    },
    editProfile: async (req, res) => {
        // TODO validation
        validatedResults = req.body;
        try {
            const userProfile = await userModel.updateOne({email: req.session.user}, validatedResults);
            res.redirect("/users/profile");
        } catch(err) {
            console.log(err);
            res.send("failed to update profile");
            return;
        }
    },
    showDeleteProfile: (req, res) => {
        res.render("users/delete.ejs");
    },
    deleteProfile: async (req, res) => {
        const email = req.session.user;
        if (req.body.yes) {
            // Logout and delete the user from the database and all associated ratings
            try {
                userDoc = await userModel.findOne({email: email});
                await placeModel.updateMany({}, {$pull: {
                    ratings: {
                        userId: {
                            $in: [userDoc._id]
                        }
                    }
                }});
                userDoc.deleteOne();
                res.redirect("/users/logout");
                return;
            } catch(err) {
                console.log(err);
                res.send("failed to delete user");
                return;
            }
            
        }
        res.redirect("/users/profile");
    }
}
module.exports = controller;