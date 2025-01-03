import { AppError } from "@/use-cases/errors/app-error";
import { FastifyReply, FastifyRequest } from "fastify";
import { changePassword } from "@/use-cases/graphic_accounts/fetch-graphic_accounts";

export async function changeUserPassword(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  try {
    const userId = request.params.id; // Verifique se o ID está sendo capturado corretamente aqui

    const { newPassword } = request.body as { newPassword: string }; // Certifique-se de ter userId e newPassword disponíveis no corpo da solicitação

    const result = await changePassword(userId, newPassword);

    return reply.status(200).send(result);
  } catch (error) {
    if (error instanceof AppError) {
      reply.status(error.statusCode).send({ error: error.message });
    } else {
      reply.status(500).send({ error: "Internal Server Error" });
    }
  }
}
