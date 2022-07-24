const express = require("express");
const app = express();
const port = 3000;

// Set the view engine
app.set("view engine", "ejs");
// Add the middleware to use and static files
app.use(express.static('public'));

app.get("/", (req, res) => {
    res.render("home.ejs");
});

app.listen(port, () => {
    console.log(`Wandr listening on ${port}`);
});