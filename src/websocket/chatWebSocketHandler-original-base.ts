// import { Server, Socket } from "socket.io";
// import { handleError, validateFields } from "./socketHelpers";

// interface Message {
//   id: string;
//   senderId: string;
//   receiverId: string;
//   content: string;
//   encryptedMessage?: string;  // Adicionando suporte a mensagens criptografadas
//   encryptedKey?: string;
//   iv?: string;
//   type?: string;
//   timestamp?: number | string | Date;
//   status?: string;
//   authorName?: string;
//   action?: string;
//   chatId?: string;
//   authorId?: string;
//   isOwn?: boolean | string;
// }

// interface Contact {
//   userId: string;
//   contactId: string;
// }

// export function setupChatWebSocket(io: Server) {
//   console.log("Configurando WebSocket de bate-papo...");

//   // Armazenamento em memória
//   const messages: Message[] = [];
//   const contacts: Contact[] = [];
//   const invites: { senderId: string; receiverId: string; status: string }[] = [];
//   const messageQueues: { [userId: string]: Message[] } = {}; // Fila de mensagens para usuários offline

//   io.on("connection", (socket) => {
//     console.log(`Usuário conectado: ${socket.id}`);

//       // Usuário conectou
//       socket.on("user_connected", async (userId) => {
//         try {
//           console.log(`Usuário ${userId} está agora online.`);
//           socket.join(userId); // Adiciona ao "quarto" do usuário

//           // Envia mensagens pendentes, se houver
//           if (messageQueues[userId] && messageQueues[userId].length > 0) {
//             console.log(`Enviando mensagens pendentes para o usuário ${userId}.`);
//             messageQueues[userId].forEach((message) => {
//               io.to(userId).emit("receive_message", message);
//             });
//             delete messageQueues[userId]; // Limpa a fila após envio
//           }
//         } catch (error) {
//           handleError(socket, error as Error, "user_connected");
//         }
//       });

//       // Usuário desconectou
//       socket.on("disconnect", async () => {
//         try {
//           const userId = socket.id; // Aqui, ajuste dependendo de onde o userId é mapeado
//           console.log(`Usuário desconectado: ${userId}`);
//         } catch (error) {
//           console.error("Erro ao remover usuário do Redis:", error);
//         }
//       });

//     //   // Enviar mensagens privadas
//     //   socket.on("send_message", (data) => {
//     //     try {
//     //       if (!validateFields(data, ["content", "senderId", "receiverId"])) {
//     //         throw new Error("Dados incompletos para criar a mensagem.");
//     //       }
//     //     const { content, senderId, receiverId,
//     //       encryptedMessage, encryptedKey, iv,
//     //       authorName,
//     //       action,
//     //       type,
//     //       chatId,
//     //       timestamp,
//     //       authorId,
//     //       id,
//     //       isOwn,
//     //       status
//     //       } = data;

//     //     if (!content || !senderId || !receiverId) {
//     //       console.error("Dados incompletos para criar a mensagem");
//     //       return;
//     //     }

//     //     const message: Message = {
//     //       id,
//     //       authorId,
//     //       senderId,
//     //       receiverId,
//     //       content,
//     //       encryptedMessage,
//     //       encryptedKey,
//     //       iv,
//     //       authorName,
//     //       action,
//     //       type,
//     //       chatId,
//     //       timestamp,
//     //       isOwn,
//     //       status,
//     //     };

//     //     console.log(`Mensagem recebida de ${senderId} para ${receiverId}:`, message);
//     //     console.log("Mensagem criada:", data)

//     //     // Verificar se o destinatário está online
//     //     const recipientSocket = io.sockets.adapter.rooms.get(receiverId);
//     //     if (recipientSocket && recipientSocket.size > 0) {
//     //       // O destinatário está online
//     //       io.to(receiverId).emit("receive_message", message);
//     //       console.log("Mensagem enviada com sucesso.");
//     //     } else {
//     //       // O destinatário está offline, armazena a mensagem
//     //       console.log(`Destinatário ${receiverId} offline. Armazenando mensagem.`);
//     //       if (!messageQueues[receiverId]) {
//     //         messageQueues[receiverId] = [];
//     //       }
//     //       messageQueues[receiverId].push(message);
//     //     }
//     //   } catch (error) {
//     //     handleError(socket, error as Error, "send_message");
//     //   }
//     // });

//      // Usuário enviou mensagem
//      socket.on("send_message", async (data) => {
//       try {
//         if (!validateFields(data, ["content", "senderId", "receiverId"])) {
//           throw new Error("Dados incompletos para criar a mensagem.");
//         }

//         const { content, senderId, receiverId, ...rest } = data;
//         const message: Message = { content, senderId, receiverId, ...rest };

//         console.log(`Mensagem recebida de ${senderId} para ${receiverId}:`, message);

//         // Verifica se o destinatário está online
//         const isOnline = await redisClient.sIsMember("online_users", receiverId);

//         if (isOnline) {
//           io.to(receiverId).emit("receive_message", message); // Envia para o destinatário
//           console.log("Mensagem enviada com sucesso.");
//         } else {
//           console.log(`Destinatário ${receiverId} offline. Armazenando mensagem.`);
//           if (!messageQueues[receiverId]) {
//             messageQueues[receiverId] = [];
//           }
//           messageQueues[receiverId].push(message); // Armazena na fila
//         }
//       } catch (error) {
//         handleError(socket, error as Error, "send_message");
//       }
//     });

//     // Adicionar um contato
//     socket.on("add_contact", (data) => {
//       const { userId, contactId } = data;
//       try {
//         // Adicionar contato na memória
//         contacts.push({ userId, contactId });
//         console.log(`Contato ${contactId} adicionado a lista de ${userId}`);
//       } catch (error) {
//         console.error("Erro ao adicionar contato:", error);
//       }
//     });

//     // Remover um contato
//     socket.on("remove_contact", (data) => {
//       const { userId, contactId } = data;
//       try {
//         // Remover contato da memória
//         const index = contacts.findIndex(
//           (contact) => contact.userId === userId && contact.contactId === contactId
//         );
//         if (index > -1) {
//           contacts.splice(index, 1);
//           console.log(`Contato ${contactId} removido da lista de ${userId}`);
//         }
//       } catch (error) {
//         console.error("Erro ao remover contato:", error);
//       }
//     });

//     // Listar os contatos de um usuário
//     socket.on("get_contacts", (userId: string) => {
//       try {
//         const userContacts = contacts.filter(
//           (contact) => contact.userId === userId
//         );
//         socket.emit("contacts_list", userContacts);
//       } catch (error) {
//         console.error("Erro ao listar contatos:", error);
//       }
//     });

//     // Enviar convite
//     socket.on("send_invite", (data) => {
//       const { senderId, receiverId } = data;
//       try {
//         // Verificar se já existe convite
//         const existingInvite = invites.find(
//           (invite) => invite.senderId === senderId && invite.receiverId === receiverId
//         );

//         if (existingInvite && existingInvite.status === "PENDING") {
//           console.log("Convite já enviado");
//           return;
//         }

//         // Criar um novo convite
//         invites.push({ senderId, receiverId, status: "PENDING" });
//         console.log(`Convite enviado de ${senderId} para ${receiverId}`);

//         // Notificar o destinatário sobre o convite
//         io.to(receiverId).emit("receive_invite", { senderId });
//       } catch (error) {
//         console.error("Erro ao enviar convite:", error);
//       }
//     });

//     // Aceitar convite
//     socket.on("accept_invite", (data) => {
//       const { senderId, receiverId } = data;
//       try {
//         const invite = invites.find(
//           (invite) => invite.senderId === senderId && invite.receiverId === receiverId && invite.status === "PENDING"
//         );

//         if (!invite) {
//           console.log("Convite não encontrado ou já foi aceito/rejeitado");
//           return;
//         }

//         invite.status = "ACCEPTED";

//         // Adicionar ambos os usuários aos contatos na memória
//         contacts.push({ userId: senderId, contactId: receiverId });
//         contacts.push({ userId: receiverId, contactId: senderId });

//         console.log(`Convite aceito por ${receiverId}`);

//         // Notificar os usuários sobre o convite aceito
//         io.to(senderId).emit("invite_accepted", { receiverId });
//         io.to(receiverId).emit("invite_accepted", { senderId });
//       } catch (error) {
//         console.error("Erro ao aceitar convite:", error);
//       }
//     });

//     // Recusar convite
//     socket.on("reject_invite", (data) => {
//       const { senderId, receiverId } = data;
//       try {
//         const invite = invites.find(
//           (invite) => invite.senderId === senderId && invite.receiverId === receiverId && invite.status === "PENDING"
//         );

//         if (!invite) {
//           console.log("Convite não encontrado ou já foi aceito/rejeitado");
//           return;
//         }

//         invite.status = "REJECTED";

//         console.log(`Convite recusado por ${receiverId}`);

//         // Notificar o remetente do convite recusado
//         io.to(senderId).emit("invite_rejected", { receiverId });
//       } catch (error) {
//         console.error("Erro ao recusar convite:", error);
//       }
//     });

//     // Enviar mensagem em grupo
//  // Armazenamento em memória para mensagens pendentes de grupos
// const groupMessageQueues: { [groupId: string]: Message[] } = {};

// // Enviar mensagem para todos os membros de um grupo
// socket.on("send_group_message", (data) => {
//   const {
//     content, senderId, groupId, encryptedMessage, encryptedKey, iv,
//     authorName, action, type, chatId, timestamp, authorId, id, isOwn, status
//   } = data;

//   if (!content || !senderId || !groupId) {
//     console.error("Dados incompletos para criar a mensagem");
//     return;
//   }

//   const message: Message = {
//     id,
//     authorId,
//     authorName,
//     action,
//     type,
//     chatId,
//     content,
//     encryptedMessage,
//     encryptedKey,
//     iv,
//     timestamp,
//     isOwn,
//     status,
//     senderId,
//     receiverId: groupId, // O "receiverId" é o ID do grupo, neste caso
//   };

//   console.log(`Mensagem recebida de ${senderId} para o grupo ${groupId}:`, message);

//   // Verificar se o grupo tem membros online
//   const groupMembers = io.sockets.adapter.rooms.get(groupId);
//   if (groupMembers && groupMembers.size > 0) {
//     // Emitir a mensagem para todos os membros online do grupo
//     io.to(groupId).emit("receive_group_message", message);
//     console.log(`Mensagem enviada para o grupo ${groupId}`);
//   } else {
//     // Se nenhum membro do grupo estiver online, armazenar a mensagem na fila
//     console.log(`Nenhum membro online no grupo ${groupId}. Armazenando mensagem.`);
//     if (!groupMessageQueues[groupId]) {
//       groupMessageQueues[groupId] = [];
//     }
//     groupMessageQueues[groupId].push(message);
//   }
// });

// // Enviar mensagens pendentes quando um usuário entra em um grupo
// socket.on("user_joined_group", (data) => {
//   const { userId, groupId } = data;

//   console.log(`Usuário ${userId} entrou no grupo ${groupId}`);

//   // Adicionar o usuário ao "room" do grupo
//   socket.join(groupId);

//   // Verificar se há mensagens pendentes para o grupo
//   if (groupMessageQueues[groupId] && groupMessageQueues[groupId].length > 0) {
//     console.log(`Enviando mensagens pendentes para o grupo ${groupId}`);
//     groupMessageQueues[groupId].forEach((message) => {
//       io.to(groupId).emit("receive_group_message", message);
//     });

//     // Limpar a fila de mensagens do grupo
//     delete groupMessageQueues[groupId];
//   }
// });

//     // Ouvindo notificações no front-end
// socket.on('new:notification', (notification) => {
//   console.log('Nova notificação:', notification);
//   // Aqui você pode exibir um modal ou uma notificação para o usuário
// });

// // Exemplo de envio de notificação
//   socket.on('new:notification', (data) => {
//     const { userId, notification } = data;
//     io.to(userId).emit('new:notification', notification);
//   });

//     // Desconexão
//     socket.on("disconnect", () => {
//       console.log("Cliente desconectado", socket.id);
//     });
//   });
// }
