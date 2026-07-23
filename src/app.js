const express =
  require("express");

const app =
  express();

const config = require(
  "./config"
);

const {
  connectRabbitMQ
} = require(
  "./config/rmq"
);

const {
  setupQueues
} = require(
  "./queues/setup"
);

const startMessageWorker =
  require(
    "./workers/message"
  );

const startStatusWorker =
  require(
    "./workers/status"
  );

const startMediaWorker =
  require(
    "./workers/media"
  );

const startOutgoingWorker =
  require(
    "./workers/outgoing"
  );

const messageQueue = "message.queue"
const statusQueue = "status.queue"
const mediaQueue = "media.queue"
const outgoingQueue = "outgoing.queue"



const startApp =
  async () => {

    app.listen(

      config.PORT,

      () => {

        console.log(
          `Whatsapp Local Service running on port ${config.PORT} 🚀 🚀 🚀`
        );

      }

    );


    // =========================
    // CONNECT RABBITMQ
    // =========================

    await connectRabbitMQ();


    // =========================
    // CREATE QUEUES
    // =========================

    await setupQueues(messageQueue, "message.*");
    await setupQueues(statusQueue, "status.*");
    await setupQueues(mediaQueue, "media.*");
    await setupQueues(outgoingQueue, "outgoing.*");

    // =========================
    // START WORKERS
    // =========================

    await startMessageWorker(messageQueue);

    await startStatusWorker(statusQueue);

    await startMediaWorker(mediaQueue);

    await startOutgoingWorker(outgoingQueue);

    console.log(
      "All workers started"
    );

  };


module.exports =
  startApp;