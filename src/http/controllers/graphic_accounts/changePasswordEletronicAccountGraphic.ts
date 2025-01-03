import { AppError } from "@/use-cases/errors/app-error";
import { FastifyReply, FastifyRequest } from "fastify";
import { changePasswordEletronic } from "@/use-cases/graphic_accounts/fetch-graphic_accounts";

export async function changeUserPasswordEletronic(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  try {
    const userId = request.params.id;

    const { newPasswordEletronic } = request.body as {
      newPasswordEletronic: string;
    };
    const result = await changePasswordEletronic(userId, newPasswordEletronic);
    return reply.status(200).send(result);
  } catch (error) {
    if (error instanceof AppError) {
      reply.status(error.statusCode).send({ error: error.message });
    } else {
      reply.status(500).send({ error: "Internal Server Error" });
    }
  }
}
