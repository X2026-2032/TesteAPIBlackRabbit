app.get("/messages/:userId", async (request, reply) => {
    const { userId } = request.params;
  
    // Busca as mensagens recebidas pelo usuário
    const messages = await prisma.privateMessage.findMany({
      where: { receiverId: userId },
      include: { sender: true },
    });
  
    // Descriptografa as mensagens
    const decryptedMessages = messages.map((msg) => ({
      ...msg,
      content: decryptMessage(msg.content, msg.receiver.privateKey),
    }));
  
    return reply.send(decryptedMessages);
  });
  