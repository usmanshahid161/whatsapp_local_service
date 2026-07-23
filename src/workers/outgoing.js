const {
  getChannel
} = require(
  "../config/rmq"
);


const startOutgoingWorker =
  async (queue) => {

    const channel =
      getChannel();


    await channel.prefetch(10);


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
            "Outgoing Event:",
            event
          );


          // TODO:
          //
          // 1. Get Tenant
          //
          // 2. Get WhatsApp Access Token
          //
          // 3. Call Meta WhatsApp API
          //
          // 4. Save Response
          //
          // 5. Save WhatsApp Message ID


          channel.ack(
            message
          );


        } catch (error) {

          console.error(
            "Outgoing Worker Error:",
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
      "Outgoing Worker Started"
    );

  };


module.exports =
  startOutgoingWorker;