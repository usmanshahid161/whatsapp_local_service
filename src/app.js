const express = require("express");

const app = express();

const config = require("./config");

const {
  connectRabbitMQ
} = require("./config/rmq");

const {
  setupQueues
} = require("./queues/setup");

const startMessageWorker =
  require("./workers/message");

const startStatusWorker =
  require("./workers/status");

const startMediaWorker =
  require("./workers/media");

const startOutgoingWorker =
  require("./workers/outgoing");


const messageQueue =
  config.HOSTNAME + "/message.queue";

const mediaQueue =
  config.HOSTNAME + "/message.media";

const statusQueue =
  config.HOSTNAME + "/status.queue";

const outgoingQueue =
  config.HOSTNAME + "/outgoing.queue";


const startApp = async () => {

  try {

    // =========================
    // CONNECT RABBITMQ
    // =========================

    await connectRabbitMQ();


    // =========================
    // CREATE QUEUES
    // =========================

    await setupQueues(
      messageQueue,
      "message.text"
    );

    await setupQueues(
      mediaQueue,
      "message.media"
    );

    await setupQueues(
      statusQueue,
      "status.*"
    );

    await setupQueues(
      outgoingQueue,
      "outgoing.*"
    );


    // =========================
    // START WORKERS
    // =========================

    await startMessageWorker(
      messageQueue
    );

    await startStatusWorker(
      statusQueue
    );

    await startMediaWorker(
      mediaQueue
    );

    await startOutgoingWorker(
      outgoingQueue
    );


    // =========================
    // START HTTP SERVER
    // =========================

    const message =
      `Whatsapp Local Webhook Service running on port ${config.PORT} 🚀 🚀 🚀`;

    app.get(
      "/",
      (req, res) => {

        res.send(message);

      }
    );


    app.listen(
      config.PORT,
      () => {

        console.log(message);

      }
    );


    console.log(
      "All workers started"
    );


  } catch (error) {

    console.error(
      "Failed to start Local Service:",
      error
    );

    process.exit(1);

  }

};


module.exports = startApp;