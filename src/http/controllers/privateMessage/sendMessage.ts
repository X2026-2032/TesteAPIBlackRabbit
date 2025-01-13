// import { FastifyInstance } from "fastify";
// import { encryptMessage, decryptMessage } from "@/utils/crypto";
// import { prisma } from "@/lib/prisma";

// export async function MessageRoutes(app: FastifyInstance) {
//   app.post("/messages/send", async (request, reply) => {
//     const { senderId, receiverId, content } = request.body;

//     // Verifica se os usuários existem
//     const [sender, receiver] = await Promise.all([
//       prisma.graphicAccount.findUnique({ where: { id: senderId } }),
//       prisma.graphicAccount.findUnique({ where: { id: receiverId } }),
//     ]);

//     if (!sender || !receiver) {
//       return reply.status(404).send({ message: "Usuário não encontrado" });
//     }

//     // Criptografa a mensagem com a chave pública do destinatário
//     const encryptedContent = encryptMessage(content, receiver.publicKey);

//     // Salva a mensagem no banco
//     const message = await prisma.privateMessage.create({
//       data: {
//         content: encryptedContent,
//         senderId: senderId,
//         receiverId: receiverId,
//       },
//     });

//     return reply.status(201).send(message);
//   });
// }
