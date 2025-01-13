export class MessageController {
    async sendMessage(request, reply) {
      const { senderId, receiverId, content } = request.body;
  
      const encryptedMessage = encryptMessage(receiverId, content);
  
      await prisma.privateMessage.create({
        data: {
          senderId,
          receiverId,
          content: encryptedMessage,
        },
      });
  
      reply.send({ message: "Mensagem criptografada e enviada!" });
    }
  
    async getMessages(request, reply) {
      const { senderId, receiverId } = request.query;
  
      const messages = await prisma.privateMessage.findMany({
        where: { senderId, receiverId },
        orderBy: { created_at: "asc" },
      });
  
      const decryptedMessages = messages.map((msg) =>
        decryptMessage(senderId, msg.content)
      );
  
      reply.send({ messages: decryptedMessages });
    }
  }
  