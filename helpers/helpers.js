const axios = require("axios").default;
module.exports = {
    fetchData: async (url) => {
        try {
            const response = await axios.get(url);
            return response;
          } catch (error) {
            console.error(error);
          }
    }
}