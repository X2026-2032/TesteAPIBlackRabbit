import { AppError } from "@/use-cases/errors/app-error";
import { changeUserPassword } from "@/use-cases/users/change-user-password";
import { FastifyReply, FastifyRequest } from "fastify";

export async function changeUserPasswordController(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  try {
    const userId = request.params.id;
    const { newPassword } = request.body as { newPassword: string };
    const result = await changeUserPassword(userId, newPassword);

    return reply.status(200).send(result);
  } catch (error) {
    if (error instanceof AppError) {
      reply.status(error.statusCode).send({ error: error.message });
    } else {
      reply.status(500).send({ error: "Internal Server Error" });
    }
  }
}
