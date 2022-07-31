require("dotenv").config();
const formsModels = require("../../models/forms/forms");
const controllers = {
    getFormData: (req, res) => {
        const data = req.params.data;
        res.json(formsModels[data]);
    },
    getApiKey: (req, res) => {
        res.json(process.env.BING_API);
    }
}
module.exports = controllers;