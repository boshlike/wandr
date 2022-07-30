// Require external packages
require("dotenv").config();
const express = require("express");
const mongoose = require('mongoose');
const session = require("express-session");
// Require internal dependencies
const db = require("./database/wandr_db_connect");
const usersController = require("./controllers/usersController");
const formsController = require("./controllers/forms/formsController");
// Create app and port
const app = express();
const port = 3000;
// Set the view engine
app.set("view engine", "ejs");
// Add the static files
app.use(express.static('public'));
// Add the middleware
app.use(express.urlencoded({extended: true}));
app.use(session({
    secret: process.env.SECRET_SESSION,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,
        httpOnly: false
    }
}))

//User routes
app.get("/register", usersController.showRegistrationForm);
app.post("/register", usersController.register);
app.get("/login", usersController.displayLoginPage);
app.post("/login", usersController.login);
app.get("/users/home", usersController.showDashboard);

//Client side fetch routes
app.get("/fetchdata/:data", formsController.getFormData);

// app.get("/home", (req, res) => {
//     res.render("dash/index_country.ejs");
// });

app.get("/places/create", (req, res) => {
    res.render("places/new.ejs");
});

// app.post("/create", (req, res) => {
//     console.log(req.body)
//     res.json(req.body);
// });

app.get("/test", (req, res) => {
    res.render("test.ejs");
});

app.get("/", (req, res) => {
    res.render("landing.ejs");
});

mongoose.connect(db.connStr, db.connOpt);
mongoose.connection.once("open", () => {
    console.log("=====> Connected to Wandr DB <=====")
})

app.listen(port, async () => {
    console.log(`=====> Wandr listening on ${port} <=====`);
});

