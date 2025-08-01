const amqp = require("amqplib");
const logger = require("./logger");

let connection = null;
let channel = null;
const EXCHANGE_NAME = "facebook_event";

const connectToRabbitmq = async () => {
  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: false });
    logger.info("connected to rabbitmq");
    return channel;
  } catch (error) {
    logger.error("Error in rabbitmq connection", error);
  }
};

const publishEvent = async (routingKey, message) => {
  if (!channel) {
    await connectToRabbitmq();
  }

  console.log("Publish Event message ::", message);
  channel.publish(
    EXCHANGE_NAME,
    routingKey,
    Buffer.from(JSON.stringify(message))
  );

  logger.info(`Event publish  ${routingKey}`);
};
module.exports = { connectToRabbitmq, publishEvent };
