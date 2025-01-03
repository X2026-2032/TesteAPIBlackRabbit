import { AppError } from "@/use-cases/errors/app-error";
import { changeUserPasswordEletronic } from "@/use-cases/users/change-user-password-eletronic";
import { FastifyReply, FastifyRequest } from "fastify";

export async function changeUserPasswordEletronicController(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  try {
    const userId = request.params.id;
    const { newPasswordEletronic } = request.body as {
      newPasswordEletronic: string;
    };
    const result = await changeUserPasswordEletronic(
      userId,
      newPasswordEletronic,
    );

    return reply.status(200).send(result);
  } catch (error) {
    if (error instanceof AppError) {
      reply.status(error.statusCode).send({ error: error.message });
    } else {
      reply.status(500).send({ error: "Internal Server Error" });
    }
  }
}
