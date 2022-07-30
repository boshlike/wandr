const bcrypt = require("bcrypt");
const userModel = require("../models/users/users");

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
        res.redirect("/login");
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
        console.log(user);
        // Use bcrypt to compare given password to one stored in DB
        const passwordMatches = await bcrypt.compare(validatedResults.password, user.hash);
        if (!passwordMatches) {
            res.send('incorrect password');
            return;
        }

    }
}
module.exports = controller;