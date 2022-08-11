// Require external packages
require("dotenv").config();
const express = require("express");
const mongoose = require('mongoose');
const session = require("express-session");
const methodOverride = require('method-override');
// Require internal dependencies
const db = require("./database/wandr_db_connect");
const usersController = require("./controllers/users/usersController");
const clientRequestController = require("./controllers/client/clientRequestsController");
const placesController = require("./controllers/places/placesController");
const middleware = require("./middleware/middleware");
// Create app and port
const app = express();
const port = process.env.PORT || 3000;
// Set the view engine
app.set("view engine", "ejs");
// Add the static files
app.use(express.static('public'));
// Add the middleware
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(session({
    secret: process.env.SECRET_SESSION,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,
        httpOnly: false
    }
}));
app.use(middleware.authUser);
//User routes
app.get("/register", usersController.showRegistrationForm);
app.post("/register", usersController.register);
app.get("/users/login", usersController.displayLoginPage);
app.post("/users/login", usersController.login);
app.get("/users/logout", usersController.logout);
app.get("/users/home", middleware.isAuthenticated, usersController.showDashboard);
app.get("/users/profile", middleware.isAuthenticated, usersController.showProfile);
app.get("/users/edit", middleware.isAuthenticated, usersController.showEditProfile);
app.patch("/users/edit", middleware.isAuthenticated, usersController.editProfile);
app.get("/users/delete", middleware.isAuthenticated, usersController.showDeleteProfile);
app.delete("/users/delete", middleware.isAuthenticated, usersController.deleteProfile);
//Client side fetch routes
app.get("/fetchmapdata/fetchall", clientRequestController.fetchAll);
app.get("/fetchmapdata", clientRequestController.getMapsDataObject);
app.get("/fetchmapdata/places/user/:_id", clientRequestController.getOnePlaceData);
//Places routes
app.get("/places/create", middleware.isAuthenticated, placesController.showCreateForm);
app.post("/places/create", middleware.isAuthenticated, placesController.createUserPlace);
app.get("/places/user/:place_id", middleware.isAuthenticated, placesController.showUserPlace);
app.get("/places/user/edit/:place_id", middleware.isAuthenticated, placesController.showEditUserPlace);
app.patch("/places/user/edit/:place_id", middleware.isAuthenticated, placesController.editUserPlace);
app.get("/places/user/delete/:place_id", middleware.isAuthenticated, placesController.showDeleteUserPlace);
app.delete("/places/user/delete/:place_id", middleware.isAuthenticated, placesController.deleteUserPlace);
app.get("/places/inspire", placesController.showInspiration);
app.get("/places/users/all", placesController.showBeen);
//Landing route
app.get("/", (req, res) => {
    res.render("landing.ejs");
});
mongoose.connect(db.connStr, db.connOpt);
mongoose.connection.once("open", () => {
    console.log("=====> Connected to Wandr DB <=====")
});
app.listen(port, async () => {
    console.log(`=====> Wandr listening on ${port} <=====`);
});

