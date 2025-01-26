import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "@/lib/prisma"; // Prisma ORM
import { z } from "zod"; // Validação de esquema
import { updatePublicKeyService } from "@/use-cases/graphic_accounts/updatePublicKeyService";

export async function updatePublicKey(request: FastifyRequest, reply: FastifyReply) {
  try {
    // Validação do corpo da requisição
    const schema = z.object({
      publicKey: z.string().min(1, "Chave pública não pode ser vazia."),
    });

    const { publicKey } = schema.parse(request.body);

    // Obter o parâmetro da rota
    const { userName } = request.params as { userName: string };

    if (!userName) {
      return reply.status(400).send({ message: "Usuário não identificado." });
    }

    // Chamar o serviço para atualizar a chave pública
    const updatedAccount = await updatePublicKeyService(userName, publicKey);

    return reply.status(200).send({
      message: "Chave pública atualizada com sucesso.",
      account: updatedAccount,
    });
  } catch (error) {
    console.error("Erro ao atualizar a chave pública:", error);

    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        message: error.errors.map((err) => err.message).join(", "),
      });
    }

    return reply.status(500).send({ message: "Erro ao atualizar a chave pública." });
  }
}
