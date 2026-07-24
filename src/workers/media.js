const {
  getChannel
} = require(
  "../config/rmq"
);


const startMediaWorker =
  async (queue) => {

    const channel =
      getChannel();


    await channel.prefetch(5);


    channel.consume(

      queue,

      async (message) => {
        channel.ack(
          message
        );

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
            "Media Event:",
            event
          );


          // TODO:
          //
          // 1. Get WhatsApp Media ID
          //
          // 2. Get Media URL from Meta
          //
          // 3. Download Media
          //
          // 4. Upload to S3
          //
          // 5. Save Media URL MongoDB


        } catch (error) {

          console.error(
            "Media Worker Error:",
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
      "Media Worker Started"
    );

  };


module.exports =
  startMediaWorker;