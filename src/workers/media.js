const {
  getChannel
} = require("../config/rmq");

const {
  updateMessage
} = require("../apis/message");

const logger =
  require("../config/logger");

const { getMediaMessage } = require("../helper/download");

const centrifuge = require('sdk-centrifuge');


const startMediaWorker =
  async (queue) => {

    async function processLogs(data) {
      try {
        let message = JSON.parse(data?.content.toString())
        const { messageId, interactionId, extension, mediaIndex, url, mimeType, token, type } = message;
        let newUrl = await getMediaMessage(extension, url, mimeType, interactionId, token);
        let localUrl = null

        if (newUrl?.uploadError) {
          localUrl = newUrl?.message
        }
        else if(!newUrl) {
          localUrl = ""
        }
        await updateMessage({ messageId },{
          [`attachments.${ mediaIndex }.data.url`]: localUrl || newUrl,
          [`attachments.${ mediaIndex }.data.error`]: !newUrl,
          [`attachments.${ mediaIndex }.data.downloading`]: false,
          [`attachments.${ mediaIndex }.type`]: newUrl?.uploadError ? "image" : type,
          [`attachments.${ mediaIndex }.data.originalType`]: undefined,
          messageId
        } )
          .then((response) => {
            // centrifuge.publish(`interaction:${ response?.data?.message?.channel }:${ interactionId }`, {
            //   event: 'update-message',
            //   message: response?.data?.message
            // }).catch(e => console.log('Cannot Publish', e))
            //
            // centrifuge.publish(`sharedInbox`, {
            //   event: 'update-message',
            //   message: response?.data?.message,
            //   channel: response?.data?.message?.channel
            // }).catch(e => console.log('Cannot Publish', e))
          })
          .catch(err => {
            console.log(err)
          })
      }
      catch (e) {
        console.log("Error while processing update via queue", e)
      }
    }

    const channel =
      getChannel();


    await channel.prefetch(5);

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
  startMediaWorker;