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

  INTERACTION_MANAGER:
  process.env.INTERACTION_MANAGER,

  HOSTNAME:
  process.env.HOSTNAME,

  META_BASE_URL:
  process.env.META_BASE_URL,

  META_VERSION:
  process.env.META_VERSION,
};