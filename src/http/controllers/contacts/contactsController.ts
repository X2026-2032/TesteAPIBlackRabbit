import { prisma } from "@/lib/prisma";
import { FastifyRequest, FastifyReply } from "fastify";

// Interface para a query da listagem de contatos
interface ListContactsQuery {
  userId: string;
}

// Listar contatos de um usuário
export const listContacts = async (
  req: FastifyRequest<{ Params: { userId: string } }>, // Alterando para capturar o userId de params
  reply: FastifyReply
) => {
  const { userId } = req.params;  // Agora pega o userId de params

  try {
    const user = await prisma.graphicAccount.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return reply.status(404).send({ error: "Usuário não encontrado" });
    }

    const contacts = await prisma.contact.findMany({
      where: { graphicAccountId: userId },
      include: {
        contact: true,
        graphicAccount: true,
      },
    });

    return reply.status(200).send({ contacts });
  } catch (error) {
    console.error("Erro ao listar contatos:", error);
    return reply.status(500).send({ error: "Erro ao listar contatos" });
  }
};
