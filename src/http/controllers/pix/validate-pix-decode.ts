import { AppError } from "@/use-cases/errors/app-error";
import { makeValidatePixDecodeUseCase } from "@/use-cases/factories/make-validate-pix-decode-use-case";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function validatePixDecode(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const schema = z.object({
      content: z.string().min(40),
    });

    const { content } = schema.parse(request.body);

    const validatePixDecodeUseCase = makeValidatePixDecodeUseCase();

    const pix = await validatePixDecodeUseCase.execute({
      content,
    });

    return reply.status(200).send(pix);
  } catch (error: any) {
    console.log(error);
    if (error instanceof z.ZodError) {
      return reply.status(400).send({ message: "Copia e cola inválido" });
    }

    throw new AppError(error);
  }
}
