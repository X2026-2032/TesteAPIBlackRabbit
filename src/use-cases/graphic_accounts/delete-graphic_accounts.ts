import { prisma } from "@/lib/prisma";
import { FastifyReply, FastifyRequest } from "fastify";

// Definindo o tipo esperado para o request
interface DeleteUserRequest {
  userName: string;
}

export async function deleteUserByUserName(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { userName } = request.body as DeleteUserRequest; // Garantindo que o body seja do tipo DeleteUserRequest

  try {
    if (!userName) {
      return reply.status(400).send({ error: "'userName' é obrigatório." });
    }

    // Verificando se o usuário existe
    const user = await prisma.graphicAccount.findUnique({
      where: { userName },
    });

    if (!user) {
      return reply.status(404).send({ error: "Usuário não encontrado." });
    }

    // Verificando e excluindo mensagens ou outras dependências, se necessário
    await prisma.privateMessage.deleteMany({
      where: { senderId: user.id }, // Caso o usuário tenha enviado mensagens
    });

    // Deletar usuário
    await prisma.graphicAccount.delete({
      where: { userName },
    });

    console.log(`Usuário com userName ${userName} foi excluído com sucesso.`);
    return reply.send({ message: "Usuário excluído com sucesso." });
  } catch (error) {
    console.error("Erro ao excluir o usuário:", error);

    // Verificando se o erro tem um código de SQL
    if (error) {
      return reply
        .status(500)
        .send({ error: `Erro do banco de dados: ${error}` });
    }

    return reply.status(400).send({
      error: error || "Erro ao excluir o usuário.",
    });
  }
}
