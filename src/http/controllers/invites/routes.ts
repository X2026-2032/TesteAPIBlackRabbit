import { FastifyInstance } from "fastify";
import {
  sendInvite,
  acceptInvite,
  rejectInvite,
  listInvites,
} from "./inviteController";

export async function InviteRoutes(app: FastifyInstance) {
  // Rota para enviar convite
  app.post("/send", async (request, reply) => {
    await sendInvite(request, reply);
  });

  // Rota para aceitar convite
  app.post("/accept", async (request, reply) => {
    await acceptInvite(request, reply);
  });

  // Rota para recusar convite
  app.post("/reject", async (request, reply) => {
    await rejectInvite(request, reply);
  });

  // Rota para listar convites
  app.get("/list/:userId", async (request, reply) => {
    await listInvites(request, reply);
  });
}

// // Rota para salvar a chave pública do usuário
// app.post('/users/:id/public-key', async (request, reply) => {
//     const { id } = request.params;
//     const { publicKey } = request.body;

//     // Salve a chave pública no banco de dados
//     await prisma.user.update({
//       where: { id },
//       data: { publicKey },
//     });

//     reply.send({ message: "Chave pública salva com sucesso" });
//   });

//   // Rota para buscar a chave pública de um usuário
//   app.get('/users/:id/public-key', async (request, reply) => {
//     const { id } = request.params;

//     const user = await prisma.user.findUnique({
//       where: { id },
//       select: { publicKey: true },
//     });

//     if (!user) {
//       return reply.status(404).send({ message: "Usuário não encontrado" });
//     }

//     reply.send({ publicKey: user.publicKey });
//   });

//   // Rota para enviar mensagem
// app.post('/messages', async (request, reply) => {
//     const { senderId, receiverId, content } = request.body;

//     await prisma.privateMessage.create({
//       data: { senderId, receiverId, content },
//     });

//     reply.send({ message: "Mensagem enviada com sucesso" });
//   });

//   // Rota para buscar mensagens de um chat específico
//   app.get('/messages/:receiverId', async (request, reply) => {
//     const { receiverId } = request.params;
//     const { senderId } = request.query;

//     const messages = await prisma.privateMessage.findMany({
//       where: { senderId, receiverId },
//       orderBy: { created_at: "asc" },
//     });

//     reply.send({ messages });
//   });
