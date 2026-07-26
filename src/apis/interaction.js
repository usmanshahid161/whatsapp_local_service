const axios =
  require("axios");

const config =
  require("../config");

const logger =
  require("../config/logger");

const BASE_URL =
  config.INTERACTION_MANAGER;


// ========================================
// FIND INTERACTION
// ========================================

const findInteraction =
  async (query) => {

    try {

      const response =
        await axios.get(

          `${BASE_URL}/interaction/findOne`,

          {
            params:
            query
          }

        );


      return response.data;

    } catch (error) {

      logger.error(

        "Error while retrieving interaction:",

        {

          error:
            error.response?.data ||
            error.message,

          response:
          error.response?.data

        }

      );

      throw error;

    }

  };


// ========================================
// CREATE INTERACTION
// ========================================

const createInteraction =
  async (data) => {

    try {

      const response =
        await axios.post(

          `${BASE_URL}/interaction`,

          data

        );


      return response.data;

    } catch (error) {

      logger.error(

        "Error while creating interaction:",

        {

          error:
            error.response?.data ||
            error.message,

          response:
          error.response?.data

        }

      );

      throw error;

    }

  };


module.exports = {

  findInteraction,

  createInteraction

};