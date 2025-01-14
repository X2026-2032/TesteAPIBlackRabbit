import { prisma } from "@/lib/prisma";
import { FastifyReply, FastifyRequest } from "fastify";

// Definindo o tipo esperado para o request
interface DeleteGroupRequest {
  id: string;
  name: string;
}

export async function deleteGroupByName(
  request: FastifyRequest, // Podemos omitir a tipagem explícita aqui
  reply: FastifyReply
) {
  const { id, name } = request.body as DeleteGroupRequest; // Garantindo que o body seja do tipo DeleteUserRequest

  try {
    if (!id) {
      throw new Error("Deve-se fornecer um 'name'.");
    }

    // Verificando se o usuário existe
    const group = await prisma.group.findUnique({
      where: { id },
    });

    if (!group) {
      throw new Error("Grupo não encontrado.");
    }

    // Deletar usuário
    await prisma.group.delete({
      where: { id },
    });

    console.log(`Grupo com name ${name} foi excluído com sucesso.`);
    return reply.send({ message: "Grupo excluído com sucesso." });
  } catch (error) {
    console.error("Erro ao excluir o Grupo:", error);
    return reply.status(400).send({
      error: error || "Erro ao excluir o Grupo.",
    });
  }
}
