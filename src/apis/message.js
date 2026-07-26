const axios =
  require("axios");

const config =
  require("../config");

const logger =
  require("../config/logger");


const BASE_URL =
  config.INTERACTION_MANAGER;


// ========================================
// CREATE MESSAGE
// ========================================

const createMessage =
  async (data) => {

    try {

      const response =
        await axios.post(

          `${BASE_URL}/message`,

          data

        );


      return response.data;

    } catch (error) {

      logger.error(

        "Error while creating message",

        {

          error:
          error.message,

          response:
          error.response?.data

        }

      );


      throw error;

    }

  };


// ========================================
// UPDATE MESSAGE
// ========================================

const updateMessage =
  async (
    filter,
    updateData
  ) => {

    try {

      const response =
        await axios.patch(

          `${BASE_URL}/message/update`,

          {
            filter,

            updateData

          }

        );


      return response.data;

    } catch (error) {

      logger.error(

        "Error while finding and updating message",

        {

          error:
          error.message,

          filter,

          updateData,

          response:
          error.response?.data

        }

      );


      throw error;

    }

  };


module.exports = {

  createMessage,

  updateMessage

};