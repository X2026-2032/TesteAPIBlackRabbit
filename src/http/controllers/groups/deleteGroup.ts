import { prisma } from "@/lib/prisma";
import { FastifyReply, FastifyRequest } from "fastify";

// Definindo o tipo esperado para o request
interface DeleteGroupRequest {
  id: string;
  name: string;
}

export async function deleteGroupByName(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { name, ownerUsername } = request.body as {
    name: string;
    ownerUsername: string;
  }; // Certifique-se de que está recebendo o `ownerUsername`

  console.log("Nome do grupo:", name); // Verifique o nome do grupo
  console.log("Username do proprietário:", ownerUsername); // Verifique o username do proprietário

  if (!ownerUsername || !name) {
    return reply
      .status(400)
      .send({ error: "Nome do grupo ou usuário inválido." });
  }

  try {
    // Buscando o proprietário do grupo pelo username
    const owner = await prisma.graphicAccount.findUnique({
      where: { userName: ownerUsername },
      include: {
        ownedGroups: true, // Inclui os grupos que o usuário possui
      },
    });

    if (!owner) {
      throw new Error("Usuário não encontrado.");
    }

    // Verificando se o grupo existe e pertence ao proprietário
    const group = owner.ownedGroups.find((group) => group.name === name);

    if (!group) {
      throw new Error(
        "Grupo não encontrado ou o usuário não tem permissão para excluí-lo.",
      );
    }

    // Excluindo o grupo
    await prisma.group.delete({
      where: { id: group.id },
    });

    console.log(`Grupo com nome '${name}' foi excluído com sucesso.`);
    return reply.send({ message: "Grupo excluído com sucesso." });
  } catch (error) {
    console.error("Erro ao excluir o grupo:", error);
    return reply
      .status(400)
      .send({ error: error || "Erro desconhecido ao excluir o grupo." });
  }
}
