const logger = require("../config/logger");
const config = require("../config");

const createPubsub = (
  channel,
  queue,
  pattern
) => {

  return {

    start: async () => {

      await channel.assertQueue(
        queue,
        {
          durable: true
        }
      );

      await channel.bindQueue(
        queue,
        config.RABBITMQ_EXCHANGE,
        pattern
      );

      logger.info(
        "Pubsub started",
        {
          queue,
          pattern
        }
      );

    },


    publish: (
      payload,
      topic
    ) => {

      const message =
        typeof payload === "string"
          ? payload
          : JSON.stringify(payload);


      logger.debug(
        "Publishing event",
        {
          topic
        }
      );


      return channel.publish(

        config.RABBITMQ_EXCHANGE,

        topic,

        Buffer.from(message),

        {
          persistent: true,

          contentType:
            "application/json"

        }

      );

    }

  };

};


module.exports =
  createPubsub;