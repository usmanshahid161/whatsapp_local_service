const {
  getChannel
} = require("../config/rmq");

const {
  updateMessage
} = require("../apis/message");

const logger =
  require("../config/logger");


const startStatusWorker =
  async (queue) => {

    const channel =
      getChannel();


    await channel.prefetch(5);

    const processLogs = async (log) => {
      try {

        const event =
          JSON.parse(

            log
              .content
              .toString()

          );


        logger.info(
          "Incoming Status Event",
          {
            event
          }
        );


        // ========================================
        // GET STATUS DATA
        // ========================================

        const {

          channelMessageId,

          status

        } = event;


        if (
          !channelMessageId ||
          !status
        ) {

          logger.warn(
            "Invalid status event",
            {
              channelMessageId,
              status
            }
          );

          return;

        }


        // ========================================
        // FIND MESSAGE AND UPDATE STATUS
        // ========================================

        const updatedMessage =
          await updateMessage(

            {
              channelMessageId
            },

            {
              "status.message":
              status
            }

          );


        if (!updatedMessage) {

          logger.warn(
            "Message not found for status update",
            {
              channelMessageId,
              status
            }
          );

          return;

        }


        logger.info(
          "Message status updated successfully",
          {
            channelMessageId,

            status,

            messageId:
              updatedMessage
                ?.data
                ?._id ||
              updatedMessage
                ?._id
          }
        );


      } catch (error) {

        logger.error(
          "Status Worker Error",
          {
            error:
            error.message,

            stack:
            error.stack
          }
        );

      }
    }

    channel.consume(

      queue,

      async (log) => {

        if (!log) {

          return;

        }

        await processLogs(log)
          .then(() => channel.ack(
          log
        ))
          .catch((error) => {
            channel.ack(log)
            logger.error(
              "Status Worker Error",
              {
                error:
                error.message,

                stack:
                error.stack
              }
            );
          })

        // ========================================
        // ACK MESSAGE
        // ========================================


      }

    );


    logger.info(
      "Status Worker Started",
      {
        queue
      }
    );

  };


module.exports =
  startStatusWorker;