require("dotenv").config();
const connStr = process.env.MONGO_URL
const connOpt = {
	dbName: "wandr"
}
module.exports = {
	connStr,
	connOpt
}