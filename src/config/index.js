require("dotenv").config();

module.exports = {
  PORT: process.env.PORT || 3031,
  RABBITMQ_URL:
  process.env.RABBITMQ_URL,

  RABBITMQ_EXCHANGE:
    process.env.RABBITMQ_EXCHANGE ||
    "whatsapp.events",

  MONGODB_URI:
  process.env.MONGODB_URI,
  HOSTNAME:
  process.env.HOSTNAME
};