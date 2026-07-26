const axios = require("axios");
const config = require("../config")

const getWhatsappToken = (whatsappNumber) => {
  return axios.get(`${config?.INTERACTION_MANAGER}/token/whatsapp`, {
    params: {
      whatsappNumber
    }
  })
    .then(response => {
      return response.data.token
    })
    .catch(error => {
      console.log('Error while fetching token', error);
      return null;
    })
}

module.exports = {
  getWhatsappToken
}