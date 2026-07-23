const amqp =
  require("amqplib");

const config = require("./index");


let connection = null;
let channel = null;

const connectRabbitMQ =
  async () => {

    connection =
      await amqp.connect(
        config.RABBITMQ_URL
      );

    channel =
      await connection
        .createChannel();


    await channel.assertExchange(

      config.RABBITMQ_EXCHANGE,

      "topic",

      {
        durable: true
      }

    );


    console.log(
      "Worker connected to RabbitMQ"
    );


    return channel;

  };


const getChannel =
  () => {

    if (!channel) {

      throw new Error(
        "RabbitMQ channel not initialized"
      );

    }

    return channel;

  };


module.exports = {

  connectRabbitMQ,

  getChannel

};