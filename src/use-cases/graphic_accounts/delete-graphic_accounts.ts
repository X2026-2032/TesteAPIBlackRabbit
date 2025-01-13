import { prisma } from "@/lib/prisma";
import { FastifyReply, FastifyRequest } from "fastify";

// Definindo o tipo esperado para o request
interface DeleteUserRequest {
  userName: string;
}

export async function deleteUserByUserName(
  request: FastifyRequest, // Podemos omitir a tipagem explícita aqui
  reply: FastifyReply
) {
  const { userName } = request.body as DeleteUserRequest; // Garantindo que o body seja do tipo DeleteUserRequest

  try {
    if (!userName) {
      throw new Error("Deve-se fornecer um 'userName'.");
    }

    // Verificando se o usuário existe
    const user = await prisma.graphicAccount.findUnique({
      where: { userName },
    });

    if (!user) {
      throw new Error("Usuário não encontrado.");
    }

    // Deletar usuário
    await prisma.graphicAccount.delete({
      where: { userName },
    });

    console.log(`Usuário com userName ${userName} foi excluído com sucesso.`);
    return reply.send({ message: "Usuário excluído com sucesso." });
  } catch (error) {
    console.error("Erro ao excluir o usuário:", error);
    return reply.status(400).send({
      error: error || "Erro ao excluir o usuário.",
    });
  }
}
