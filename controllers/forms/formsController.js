const formsModels = require("../../models/forms/forms");
const controllers = {
    getFormData: (req, res) => {
        const data = req.params.data;
        res.json(formsModels[data]);
    }
}
module.exports = controllers;