import { FastifyRequest, FastifyReply } from "fastify";
import { UpdateUserStatusUseCase } from "@/use-cases/update-user-status-use-case";

export async function updateUserStatusController(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  try {
    const { userId } = request.params as { userId: string };
    const { status } = request.body as { status: string };
    const { apiKey } = request.body as { apiKey: string };

    const updateUserStatusUseCase = new UpdateUserStatusUseCase();
    const result = await updateUserStatusUseCase.execute({
      userId,
      newStatus: status,
      newApiKey: apiKey,
    });

    if (result.success) {
      reply.code(200).send({
        message: "Status do usuário atualizado com sucesso",
        updatedUser: result.updatedUser,
      });
    } else {
      reply.code(400).send({
        error: "Erro ao atualizar o status do usuário",
        details: result.message,
      });
    }
  } catch (error: any) {
    reply.code(500).send({ error: "Erro interno", details: error.message });
  }
}
