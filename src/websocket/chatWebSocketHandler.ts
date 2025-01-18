import { Server, Socket } from "socket.io";
import { prisma } from "@/lib/prisma";
import { encryptMessage, decryptMessage } from "@/http/controllers/privateMessage/encriptionAndDescription";

export function setupChatWebSocket(io: Server) {
  console.log("Configurando WebSocket de bate-papo...");

  io.on("connection", (socket: Socket) => {
    console.log("Cliente conectado", socket.id);

    // Registrar o usuário quando se conecta
    socket.on("register", (userId: string) => {
      socket.join(userId); // Mantém o usuário "logado" enquanto ele estiver conectado
      console.log(`${userId} conectado com o socket id ${socket.id}`);
    });

    // Enviar mensagens privadas
    socket.on("send_message", async (data) => {
      const { senderId, receiverId, content } = data;
      try {
        const sender = await prisma.graphicAccount.findUnique({ where: { id: senderId } });
        const receiver = await prisma.graphicAccount.findUnique({ where: { id: receiverId } });

        if (!sender || !receiver) {
          console.log("Usuário não encontrado");
          return;
        }

        const encryptedMessage = encryptMessage(content, receiver.publicKey as string);

        // Salvando a mensagem criptografada
        await prisma.privateMessage.create({
          data: {
            senderId,
            receiverId,
            content: encryptedMessage,
            type: "private",
          },
        });

        // Enviando mensagem para o destinatário
        io.to(receiverId).emit("receive_message", {
          senderId,
          content: encryptedMessage,
        });
      } catch (error) {
        console.error("Erro ao enviar mensagem:", error);
      }
    });

    // Remover um contato
    socket.on("remove_contact", async (data) => {
      const { userId, contactId } = data;
      try {
        // Remover o contato da lista
        await prisma.contact.deleteMany({
          where: {
            contactId: userId,
            graphicAccountId: contactId,
          },
        });

        console.log(`Contato ${contactId} removido da lista de ${userId}`);
      } catch (error) {
        console.error("Erro ao remover contato:", error);
      }
    });

    // Listar os contatos de um usuário
    socket.on("get_contacts", async (userId: string) => {
      try {
        const contacts = await prisma.contact.findMany({
          where: { graphicAccountId: userId },
          include: {
            graphicAccount: true, // Inclui os dados do gráfico de contas (usuários)
          },
        });

        socket.emit("contacts_list", contacts);
      } catch (error) {
        console.error("Erro ao listar contatos:", error);
      }
    });

    // Recusar convite
    socket.on("reject_invite", async (data) => {
      const { senderId, receiverId } = data;
      try {
        const invite = await prisma.invite.findFirst({
          where: {
            senderId,
            receiverId,
            status: "PENDING",
          },
        });

        if (!invite) {
          console.log("Convite não encontrado ou já foi aceito/rejeitado");
          return;
        }

        await prisma.invite.update({
          where: { id: invite.id },
          data: { status: "REJECTED" },
        });

        console.log(`Convite recusado por ${receiverId}`);

        // Notificar o remetente do convite recusado
        io.to(senderId).emit("invite_rejected", { receiverId });
      } catch (error) {
        console.error("Erro ao recusar convite:", error);
      }
    });

    // Aceitar convite
    socket.on("accept_invite", async (data) => {
      const { senderId, receiverId } = data;
      try {
        const invite = await prisma.invite.findFirst({
          where: {
            senderId,
            receiverId,
            status: "PENDING",
          },
        });

        if (!invite) {
          console.log("Convite não encontrado ou já foi aceito/rejeitado");
          return;
        }

        await prisma.invite.update({
          where: { id: invite.id },
          data: { status: "ACCEPTED" },
        });

        // Adicionar ambos os usuários à lista de contatos
        await prisma.contact.create({
          data: {
            contactId: senderId,
            graphicAccountId: receiverId,
          },
        });

        await prisma.contact.create({
          data: {
            contactId: receiverId,
            graphicAccountId: senderId,
          },
        });

        console.log(`Convite aceito por ${receiverId}`);

        // Notificar os usuários sobre o convite aceito
        io.to(senderId).emit("invite_accepted", { receiverId });
        io.to(receiverId).emit("invite_accepted", { senderId });
      } catch (error) {
        console.error("Erro ao aceitar convite:", error);
      }
    });

    // Enviar convite
    socket.on("send_invite", async (data) => {
      const { senderId, receiverId } = data;
      try {
        const sender = await prisma.graphicAccount.findUnique({ where: { id: senderId } });
        const receiver = await prisma.graphicAccount.findUnique({ where: { id: receiverId } });

        if (!sender || !receiver) {
          console.log("Usuário não encontrado");
          return;
        }

        const existingInvite = await prisma.invite.findFirst({
          where: {
            senderId,
            receiverId,
            status: "PENDING",
          },
        });

        if (existingInvite) {
          console.log("Convite já enviado");
          return;
        }

        await prisma.invite.create({
          data: {
            senderId,
            receiverId,
            status: "PENDING",
          },
        });

        console.log(`Convite enviado de ${senderId} para ${receiverId}`);

        // Notificar o destinatário sobre o convite
        io.to(receiverId).emit("receive_invite", { senderId });
      } catch (error) {
        console.error("Erro ao enviar convite:", error);
      }
    });

    // Desconexão
    socket.on("disconnect", () => {
      console.log("Cliente desconectado", socket.id);
    });
  });
}
