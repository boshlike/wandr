const express = require("express");
const app = express();
const port = 3000;

app.get("/", (req, res) => {
    res.send("Wandr basic app is working");
});

app.listen(port, () => {
    console.log(`Wandr listening on ${port}`);
});