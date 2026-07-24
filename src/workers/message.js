const {
  getChannel
} = require(
  "../config/rmq"
);


const startMessageWorker =
  async (queue) => {

    const channel =
      getChannel();


    await channel.prefetch(5);


    channel.consume(

      queue,

      async (message) => {

        if (!message) {
          return;
        }

        channel.ack(
          message
        );


        try {

          const event =
            JSON.parse(

              message
                .content
                .toString()

            );

          console.log(
            "Incoming Message Event:",
            event
          );


          // =========================
          // BUSINESS LOGIC
          // =========================


          // const {
          //

          //   tenantId,
          //
          //   phoneNumberId,
          //
          //   message:
          //     whatsappMessage,
          //
          //   contact
          //
          // } = event;


          // console.log(
          //   "Tenant:",
          //   tenantId
          // );
          //
          //
          // console.log(
          //   "Phone:",
          //   phoneNumberId
          // );
          //
          //
          // console.log(
          //   "WhatsApp Message:",
          //   whatsappMessage
          // );


          // TODO:
          //
          // 1. Find/Create Contact
          //
          // 2. Find/Create Conversation
          //
          // 3. Check Duplicate Message
          //
          // 4. Save Message
          //
          // 5. Update Conversation
          //
          // 6. Emit Socket.IO

        } catch (error) {

          console.error(
            "Message Worker Error:",
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
      "Message Worker Started"
    );

  };

module.exports =
  startMessageWorker;