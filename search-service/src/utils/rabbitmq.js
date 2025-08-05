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

const consumeEvent = async (routingKey, callback) => {
  if (!channel) {
    await connectToRabbitmq();
  }
  const q = await channel.assertQueue("", { exclusive: true });
  await channel.bindQueue(q.queue, EXCHANGE_NAME, routingKey);
  channel.consume(q.queue, (msg) => {
    if (msg) {
      console.log("Message Content: Consume Event :::", msg.content.toString());

      const content = JSON.parse(msg.content.toString());
      console.log(" Content: Consume Event :::", content);

      callback(content);
      channel.ack(msg);
    }
    logger.info(`Subscribed event :${routingKey}`);
  });
};
module.exports = { connectToRabbitmq, consumeEvent };
