import { Channel, connect, Connection } from "amqplib";

class RabbitmqServer {
  private conn!: Connection;
  private channel!: Channel;

  constructor(private url: string) {
    this.start();
  }

  async start() {
    this.conn = await connect(this.url);
    this.channel = await this.conn.createChannel();
  }

  async publishInQueue(queue: string, msg: string) {
    await this.channel.assertQueue(queue, { durable: false });
    return this.channel.sendToQueue(queue, Buffer.from(msg));
  }

  async consume(queue: string, callback: (msg: string) => void) {
    await this.channel.assertQueue(queue, { durable: false });
    return this.channel.consume(queue, (msg) => {
      if (msg) {
        callback(msg.content.toString());
        this.channel.ack(msg);
      }
    });
  }
}

const rabbitmqServer = new RabbitmqServer(process.env.RABBITMQ_URL!);
rabbitmqServer.start().then(() => {
  console.log("Connected to RabbitMQ");
});

export default rabbitmqServer;
