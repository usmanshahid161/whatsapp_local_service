const {
  getChannel
} = require(
  "../config/rmq"
);


const startStatusWorker =
  async (queue) => {

    const channel =
      getChannel();


    await channel.prefetch(20);


    channel.consume(

      queue,

      async (message) => {

        if (!message) {
          return;
        }


        try {

          const event =
            JSON.parse(

              message
                .content
                .toString()

            );


          console.log(
            "Status Event:",
            event
          );


          const {

            tenantId,

            status

          } = event;


          const {

            id:

              whatsappMessageId,

            status:

              messageStatus

          } = status;


          console.log(
            "Tenant:",
            tenantId
          );


          console.log(
            "WhatsApp Message:",
            whatsappMessageId
          );


          console.log(
            "Status:",
            messageStatus
          );


          // TODO:
          //
          // Find Message
          // where:
          //
          // tenantId
          // sourceMessageId
          //
          // Update:
          //
          // sent
          // delivered
          // read
          // failed


          channel.ack(
            message
          );


        } catch (error) {

          console.error(
            "Status Worker Error:",
            error
          );


          channel.nack(

            message,

            false,

            false

          );

        }

      }

    );


    console.log(
      "Status Worker Started"
    );

  };


module.exports =
  startStatusWorker;