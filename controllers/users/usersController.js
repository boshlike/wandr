const bcrypt = require("bcrypt");
const userModel = require("../../models/users/users");
const placeModel = require("../../models/places/places");
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