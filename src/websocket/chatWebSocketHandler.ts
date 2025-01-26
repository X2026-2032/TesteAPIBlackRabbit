import { Server, Socket } from "socket.io";

interface Message {
  senderId: string;
  receiverId: string;
  content: string;
  encryptedMessage?: string;  // Adicionando suporte a mensagens criptografadas
  encryptedKey?: string;
  iv?: string;
  type?: string;
  timestamp?: number | string | Date; 
  status?: string;
  authorName?: string;
  action?: string;
  chatId?: string;
  authorId?: string;
}



interface Contact {
  userId: string;
  contactId: string;
}

export function setupChatWebSocket(io: Server) {
  console.log("Configurando WebSocket de bate-papo...");

  // Armazenamento em memória
  const messages: Message[] = [];
  const contacts: Contact[] = [];
  const invites: { senderId: string; receiverId: string; status: string }[] = [];
  const messageQueues: { [userId: string]: Message[] } = {}; // Fila de mensagens para usuários offline

  io.on("connection", (socket) => {
    console.log(`Usuário conectado: ${socket.id}`);
  
    // Evento disparado quando um usuário se conecta
    socket.on("user_connected", (userId) => {
      console.log(`Usuário ${userId} está agora online.`);
  
      // Adiciona o socket ao "quarto" do usuário
      socket.join(userId);
  
      // Verifica se há mensagens pendentes para este usuário
      if (messageQueues[userId] && messageQueues[userId].length > 0) {
        console.log(`Enviando mensagens pendentes para o usuário ${userId}.`);
  
        // Envia todas as mensagens pendentes
        messageQueues[userId].forEach((message) => {
          io.to(userId).emit("receive_message", message);
        });
  
        // Limpa a fila de mensagens após envio
        delete messageQueues[userId];
      }
    });

    // Enviar mensagens privadas
      // Enviar mensagens privadas
      socket.on("send_message", (data) => {
        const { content, senderId, receiverId,
          encryptedMessage, encryptedKey, iv,
          authorName,
          action,
          type,
          chatId,
          timestamp,
          authorId,
          } = data;
  
        if (!content || !senderId || !receiverId) {
          console.error("Dados incompletos para criar a mensagem");
          return;
        }
  
        const message: Message = {
          authorId,
          senderId,
          receiverId,
          content,
          encryptedMessage,
          encryptedKey,
          iv,
          authorName,
          action,
          type,
          chatId,
          timestamp
        };
  
        console.log(`Mensagem recebida de ${senderId} para ${receiverId}:`, message);
        console.log("Mensagem criada:", data)
  
        // Verificar se o destinatário está online
        const recipientSocket = io.sockets.adapter.rooms.get(receiverId);
        if (recipientSocket && recipientSocket.size > 0) {
          // O destinatário está online
          io.to(receiverId).emit("receive_message", message);
          console.log("Mensagem enviada com sucesso.");
        } else {
          // O destinatário está offline, armazena a mensagem
          console.log(`Destinatário ${receiverId} offline. Armazenando mensagem.`);
          if (!messageQueues[receiverId]) {
            messageQueues[receiverId] = [];
          }
          messageQueues[receiverId].push(message);
        }
      });

    // Adicionar um contato
    socket.on("add_contact", (data) => {
      const { userId, contactId } = data;
      try {
        // Adicionar contato na memória
        contacts.push({ userId, contactId });
        console.log(`Contato ${contactId} adicionado a lista de ${userId}`);
      } catch (error) {
        console.error("Erro ao adicionar contato:", error);
      }
    });

    // Remover um contato
    socket.on("remove_contact", (data) => {
      const { userId, contactId } = data;
      try {
        // Remover contato da memória
        const index = contacts.findIndex(
          (contact) => contact.userId === userId && contact.contactId === contactId
        );
        if (index > -1) {
          contacts.splice(index, 1);
          console.log(`Contato ${contactId} removido da lista de ${userId}`);
        }
      } catch (error) {
        console.error("Erro ao remover contato:", error);
      }
    });

    // Listar os contatos de um usuário
    socket.on("get_contacts", (userId: string) => {
      try {
        const userContacts = contacts.filter(
          (contact) => contact.userId === userId
        );
        socket.emit("contacts_list", userContacts);
      } catch (error) {
        console.error("Erro ao listar contatos:", error);
      }
    });

    // Enviar convite
    socket.on("send_invite", (data) => {
      const { senderId, receiverId } = data;
      try {
        // Verificar se já existe convite
        const existingInvite = invites.find(
          (invite) => invite.senderId === senderId && invite.receiverId === receiverId
        );

        if (existingInvite && existingInvite.status === "PENDING") {
          console.log("Convite já enviado");
          return;
        }

        // Criar um novo convite
        invites.push({ senderId, receiverId, status: "PENDING" });
        console.log(`Convite enviado de ${senderId} para ${receiverId}`);

        // Notificar o destinatário sobre o convite
        io.to(receiverId).emit("receive_invite", { senderId });
      } catch (error) {
        console.error("Erro ao enviar convite:", error);
      }
    });

    // Aceitar convite
    socket.on("accept_invite", (data) => {
      const { senderId, receiverId } = data;
      try {
        const invite = invites.find(
          (invite) => invite.senderId === senderId && invite.receiverId === receiverId && invite.status === "PENDING"
        );

        if (!invite) {
          console.log("Convite não encontrado ou já foi aceito/rejeitado");
          return;
        }

        invite.status = "ACCEPTED";

        // Adicionar ambos os usuários aos contatos na memória
        contacts.push({ userId: senderId, contactId: receiverId });
        contacts.push({ userId: receiverId, contactId: senderId });

        console.log(`Convite aceito por ${receiverId}`);

        // Notificar os usuários sobre o convite aceito
        io.to(senderId).emit("invite_accepted", { receiverId });
        io.to(receiverId).emit("invite_accepted", { senderId });
      } catch (error) {
        console.error("Erro ao aceitar convite:", error);
      }
    });

    // Recusar convite
    socket.on("reject_invite", (data) => {
      const { senderId, receiverId } = data;
      try {
        const invite = invites.find(
          (invite) => invite.senderId === senderId && invite.receiverId === receiverId && invite.status === "PENDING"
        );

        if (!invite) {
          console.log("Convite não encontrado ou já foi aceito/rejeitado");
          return;
        }

        invite.status = "REJECTED";

        console.log(`Convite recusado por ${receiverId}`);

        // Notificar o remetente do convite recusado
        io.to(senderId).emit("invite_rejected", { receiverId });
      } catch (error) {
        console.error("Erro ao recusar convite:", error);
      }
    });

    // Desconexão
    socket.on("disconnect", () => {
      console.log("Cliente desconectado", socket.id);
    });
  });
}
