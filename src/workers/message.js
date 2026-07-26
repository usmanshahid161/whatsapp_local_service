const {
  getChannel
} = require(
  "../config/rmq"
);
const moment = require('moment/moment');
const { findInteraction, createInteraction } = require('../apis/interaction');
const { createMessage } = require('../apis/message');
const logger = require('../config/logger');
const { normalizeWhatsAppMessage, mediaPublishFunction } = require('../helper/helper');

const handleMedia = (message)=> {
  if(message?.attachments?.length > 0) {
    message?.attachments.map(async (attachment, idx) => {
      if(attachment?.data?.downloading) {
        let token = ""
        let mimeType = attachment?.data?.mimeType;
        let url = `url/whatsApp/media/${ message?.extension }/${ attachment?.data?.mediaId }`
        await mediaPublishFunction(message, url, mimeType, idx, token)
      }
    })
  }
}

const newInteractionFlow = async (
  newInteractionData,
  whatsappMessage
) => {

  try {

    const interaction =
      await createInteraction(
        newInteractionData
      );


    if (!interaction) {

      logger.error(
        "Error while creating interaction"
      );

      return;

    }


    const interactionId =
      interaction?._id ||
      interaction?.data?._id;


    if (!interactionId) {

      logger.error(
        "Interaction ID not found after creating interaction"
      );

      return;

    }


    whatsappMessage.interactionId =
      interactionId;


    const createdMessage =
      await createMessage(
        whatsappMessage
      );


    if (createdMessage) {

      logger.info(
        "Interaction and Message Created Successfully",
        {
          interactionId
        }
      );

      await handleMedia(createdMessage)

    }
    else {

      logger.error(
        "Error while creating message"
      );

    }

  }
  catch (error) {

    logger.error(
      "New Interaction Flow Error",
      {
        error:
        error.message,

        stack:
        error.stack
      }
    );

  }

};


const startMessageWorker =
  async (queue) => {

    const channel =
      getChannel();


    await channel.prefetch(5);


    channel.consume(
      queue,

      async (log) => {

        if (!log) {
          return;
        }

        channel.ack(
          log
        );


        try {

          const event =
            JSON.parse(
              log
                .content
                .toString()
            );

          let whatsappMessage = {}
          let newInteractionData = {}
          const datetime = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

          console.log(
            "Incoming Message Event:",
            event
          );


          // =========================
          // BUSINESS LOGIC
          // =========================


          const {

            tenantInfo,

            message,

            contact

          } = event;

          let caller = {
            id: contact?.wa_id,
            name: contact?.profile?.name || contact?.wa_id,
            role: 'customer'
          }

          let recipient = tenantInfo?.phoneNumber;

          whatsappMessage = {
            author: caller,
            channelMessageId: message?.id,
            direction: 0,
            recipient,
            extension: recipient,
            channel: 'whatsapp',
            extraPayload: {},
            receivedAt: datetime
          }

          newInteractionData = {
            caller: caller,
            participants: [{
              ...caller,
              joinDtTime: datetime,
              status: true
            }],
            extension: recipient,
            status: true,
            direction: 0,
            channel: 'whatsapp',
            receivedAt: datetime,
            extraPayload: {}
          };


// ========================================
// NORMALIZE WHATSAPP MESSAGE
// ========================================

          await normalizeWhatsAppMessage({ message, whatsappMessage })

          //Find Interaction

          try {
            let interaction = await findInteraction({
              "caller.id": caller?.id,
              channel: "whatsapp",
              extension: recipient
            });

            if (interaction) {

              const interactionId =
                interaction?._id ||
                interaction?.data?._id;


              whatsappMessage.interactionId =
                interactionId;


              const createdMessage =
                await createMessage(
                  whatsappMessage
                );


              if (createdMessage) {

                logger.info(
                  "Message Created Successfully",
                  {
                    interactionId
                  }
                );

                await handleMedia(createdMessage)
              }
              else {

                logger.error(
                  "Error while creating message"
                );

              }

            }
            else {

              await newInteractionFlow(
                newInteractionData,

                whatsappMessage
              );

            }
          }
          catch (error) {
            return logger.error("Error while creating interaction/message", {
              error
            });
          }
        }
        catch (error) {

          logger.error("Message Worker Error:", {
            error: error
          })


          channel.nack(
            log,

            false,

            false
          );

        }

      }
    );


    console.log(
      "Message Worker Started"
    );

  };


module.exports =
  startMessageWorker;