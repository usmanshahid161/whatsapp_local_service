const {
  getChannel
} = require("../config/rmq");

const config = require("../config");


const setupQueues = async (queue, pattern) => {

  const channel = getChannel();

  // ==============================
  // Queue Creation
  // ==============================

  await channel.assertQueue(
    queue,
    {
      durable: true
    }
  );

  await channel.bindQueue(
    queue,
    config.RABBITMQ_EXCHANGE,
    pattern
  );

  console.log(
    `${queue} configured`
  );

};


module.exports = {
  setupQueues
};