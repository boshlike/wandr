const express = require("express");
const mongoose = require('mongoose');
const db = require("./database/wandr_db_connect");
const app = express();
const port = 3000;

// Set the view engine
app.set("view engine", "ejs");
// Add the middleware to use and static files
app.use(express.static('public'));

app.get("/home", (req, res) => {
    res.render("dash/index_country.ejs");
});

app.get("/create", (req, res) => {
    res.render("places/new.ejs");
});

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

