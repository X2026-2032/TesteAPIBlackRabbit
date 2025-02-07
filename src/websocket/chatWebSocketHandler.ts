import { Server, Socket } from "socket.io";
import { handleError, validateFields } from "./socketHelpers";

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  encryptedMessage?: string; // Adicionando suporte a mensagens criptografadas
  encryptedKey?: string;
  iv?: string;
  type?: string;
  timestamp?: number | string | Date;
  status?: string;
  authorName?: string;
  action?: string;
  chatId?: string;
  authorId?: string;
  isOwn?: boolean | string;
  userId?: string;
  isRead?: boolean;
}

interface Contact {
  userId: string;
  contactId: string;
}

export function setupChatWebSocket(io: Server) {
  console.log("Configurando WebSocket de bate-papo...");

  const contacts: Contact[] = [];
  const invites: { senderId: string; receiverId: string; status: string }[] =
    [];

  const userMessageQueues: { [userId: string]: Message[] } = {};

  const groupMessageQueues: { [groupId: string]: Message[] } = {};

  const userGroupsMap: { [groupId: string]: string[] } = {};

  const userSocketMap: { [userId: string]: string } = {};

  const userStatusMap: {
    [userId: string]: { online: boolean; lastSeen: string };
  } = {};

  io.on("connection", (socket) => {
    console.log(`Usuário conectado: ${socket.id}`);

    // Usuário conectou
    socket.on("user_connected", async (userId) => {
      socket.data.userId = userId;

      userStatusMap[userId] = {
        online: true,
        lastSeen: new Date().toISOString(),
      };

      if (userMessageQueues[userId] && userMessageQueues[userId].length > 0) {
        userMessageQueues[userId].forEach((message) => {
          socket.emit("receive_message_pending", userId, message);
        });

        delete userMessageQueues[userId];
      }
    });

    // Usuário desconectou
    socket.on("disconnect", async () => {
      const userId = socket.data.userId;

      if (userId && userStatusMap[userId]) {
        userStatusMap[userId].online = false;
        userStatusMap[userId].lastSeen = new Date().toISOString();
      }
    });

    socket.on("get_user_status", async (userId) => {
      if (!userStatusMap[userId.userId]) {
        userStatusMap[userId.userId] = {
          online: false,
          lastSeen: new Date().toISOString(),
        };
      }

      const userStatus = userStatusMap[userId.userId].online
        ? { status: "online" }
        : {
            status: "offline",
            lastSeen: userStatusMap[userId.userId].lastSeen,
          };

      socket.emit("send_user_status", userStatus);
    });

    socket.on("userTyping", ({ chatId, isTyping, userId }) => {
      if (!chatId || !userId) return;

      socket.to(chatId).emit("userTyping", { userId, isTyping });
    });

    socket.on("user_joined_private", (data) => {
      const { userId, groupId } = data;

      socket.join(groupId);

      if (!userGroupsMap[groupId]) {
        userGroupsMap[groupId] = [];
      }

      if (!userGroupsMap[groupId].includes(userId)) {
        userGroupsMap[groupId].push(userId);
      }
    });

    socket.on("user_left_private", (data) => {
      const { userId, groupId } = data;

      if (!userGroupsMap[groupId]) return;

      userGroupsMap[groupId] = userGroupsMap[groupId].filter(
        (id) => id !== userId,
      );

      socket.leave(groupId);

      if (userGroupsMap[groupId].length === 0) {
        delete userGroupsMap[groupId];
      }
    });

    socket.on("user_get_pendent_messages_private", async (userId) => {
      if (userMessageQueues[userId] && userMessageQueues[userId].length > 0) {
        userMessageQueues[userId].forEach((message) => {
          socket.emit("receive_message_individual_pendent", message);
        });

        delete userMessageQueues[userId];
      }
    });

    socket.on("send_message_private", (data) => {
      const {
        content,
        senderId,
        receiverId,
        encryptedMessage,
        encryptedKey,
        iv,
        authorName,
        action,
        type,
        chatId,
        timestamp,
        authorId,
        id,
        isOwn,
        status,
      } = data;

      if (!content || !senderId || !receiverId) {
        console.error("Dados incompletos para criar a mensagem");
        return;
      }

      const message: Message = {
        id,
        authorId,
        authorName,
        action,
        type,
        chatId,
        content,
        encryptedMessage,
        encryptedKey,
        iv,
        timestamp,
        isOwn,
        status,
        senderId,
        receiverId,
        isRead: false,
      };

      console.log(
        `Mensagem recebida de ${senderId} para o usuário ${receiverId}:`,
        message,
      );

      if (userStatusMap[receiverId] && userStatusMap[receiverId].online) {
        io.to(receiverId).emit("receive_message_individual", message);
      } else {
        if (!userMessageQueues[receiverId]) {
          userMessageQueues[receiverId] = [];
        }

        userMessageQueues[receiverId].push(message);
      }
    });

    socket.on("user_joined_group", (data) => {
      const { userId, groupId } = data;

      console.log(`Usuário ${userId} entrou no grupo ${groupId}`);

      // Adicionar o usuário ao "room" do grupo
      socket.join(groupId);

      if (!userGroupsMap[groupId]) {
        userGroupsMap[groupId] = [];
      }

      if (!userGroupsMap[groupId].includes(userId)) {
        userGroupsMap[groupId].push(userId);
      }

      // Verificar se há mensagens pendentes para o grupo
      if (
        groupMessageQueues[groupId] &&
        groupMessageQueues[groupId].length > 0
      ) {
        console.log(`Enviando mensagens pendentes para o grupo ${groupId}`);
        groupMessageQueues[groupId].forEach((message) => {
          io.to(groupId).emit("receive_group_message", message);
        });

        // Limpar a fila de mensagens do grupo
        delete groupMessageQueues[groupId];
      }
    });

    socket.on("send_group_message", (data) => {
      const {
        content,
        senderId,
        groupId,
        encryptedMessage,
        encryptedKey,
        iv,
        authorName,
        action,
        type,
        chatId,
        timestamp,
        authorId,
        id,
        isOwn,
        status,
      } = data;

      if (!content || !senderId || !groupId) {
        console.error("Dados incompletos para criar a mensagem");
        return;
      }

      const message: Message = {
        id,
        authorId,
        authorName,
        action,
        type,
        chatId,
        content,
        encryptedMessage,
        encryptedKey,
        iv,
        timestamp,
        isOwn,
        status,
        senderId,
        receiverId: groupId,
        isRead: false,
      };

      console.log(
        `Mensagem recebida de ${senderId} para o grupo ${groupId}:`,
        message,
      );

      const groupMembers = io.sockets.adapter.rooms.get(groupId);

      if (groupMembers && groupMembers.size > 0) {
        io.to(groupId).emit("receive_group_message", message);
      } else {
        if (!groupMessageQueues[groupId]) {
          groupMessageQueues[groupId] = [];
        }
        groupMessageQueues[groupId].push(message);
      }
    });

    socket.on("user_left_group", (data) => {
      const { userId, groupId } = data;

      if (!userGroupsMap[groupId]) return;

      userGroupsMap[groupId] = userGroupsMap[groupId].filter(
        (id) => id !== userId,
      );

      socket.leave(groupId);

      if (userGroupsMap[groupId].length === 0) {
        delete userGroupsMap[groupId];
      }
    });

    socket.on("user_get_pendent_messages_group", async (userId) => {
      if (userGroupsMap[userId]) {
        userGroupsMap[userId].forEach((groupId) => {
          if (
            groupMessageQueues[groupId] &&
            groupMessageQueues[groupId].length > 0
          ) {
            groupMessageQueues[groupId].forEach((message) => {
              socket.emit("receive_group_message_pendent", message);
            });

            delete groupMessageQueues[groupId];
          }
        });
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
          (contact) =>
            contact.userId === userId && contact.contactId === contactId,
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
          (contact) => contact.userId === userId,
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
          (invite) =>
            invite.senderId === senderId && invite.receiverId === receiverId,
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
          (invite) =>
            invite.senderId === senderId &&
            invite.receiverId === receiverId &&
            invite.status === "PENDING",
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
          (invite) =>
            invite.senderId === senderId &&
            invite.receiverId === receiverId &&
            invite.status === "PENDING",
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

    socket.on("new:notification", (notification) => {
      console.log("Nova notificação:", notification);
      // Aqui você pode exibir um modal ou uma notificação para o usuário
    });

    // Evento de conexão do socket
    socket.on("connect", () => {
      const userId = socket.handshake.query.userId; // Pegue o userId do handshake

      // Verifique se userId é uma string
      if (typeof userId === "string") {
        userSocketMap[userId] = socket.id; // Armazena o socket.id mapeado pelo userId
      } else {
        console.error("userId não é uma string válida no handshake");
      }
    });

    // Função para pegar o socket.id com base no userId
    function getSocketIdByUserId(userId: string): string | undefined {
      return userSocketMap[userId]; // Retorna o socket.id correspondente ao userId
    }

    // Evento de atualização do avatar do usuário
    socket.on("profilePictureUpdated", (newImageUrl, userId) => {
      // Atualiza a imagem do usuário para todos os seus amigos
      const userContacts = contacts.filter(
        (contact) => contact.userId === userId,
      );
      userContacts.forEach((contact) => {
        const contactSocketId = getSocketIdByUserId(contact.contactId);
        if (contactSocketId) {
          console.log(
            `Enviando atualização de avatar para o socket do contato ${contact.contactId}`,
          );
          io.to(contactSocketId).emit("profilePictureUpdated", newImageUrl);
        }
      });

      // Atualiza a imagem do usuário para todos os grupos que ele pertence
      // const userGroups = getUserGroups(userId);
      // userGroups.forEach(groupId => {
      //   console.log(`Enviando atualização de avatar para o grupo ${groupId}`);
      //   io.to(groupId).emit('profilePictureUpdated', newImageUrl);
      // });

      // Emitir para o próprio usuário
      console.log(
        `Enviando atualização de avatar para o próprio usuário ${userId}`,
      );
      io.to(userId).emit("profilePictureUpdated", newImageUrl);

      console.log(
        `Imagem de perfil do usuário ${userId} atualizada para ${newImageUrl}`,
      );
    });

    socket.on("sendAudio", (audioBlob, userId) => {
      console.log("Áudio recebido, retransmitindo...", userId);
      io.emit("receiveAudio", audioBlob, userId); // Envia para todos os clientes
    });

    ////////////////////
    // Exemplo de envio de notificação
    socket.on("new:notification", (data) => {
      const { userId, notification } = data;
      io.to(userId).emit("new:notification", notification);
    });
  });
}
