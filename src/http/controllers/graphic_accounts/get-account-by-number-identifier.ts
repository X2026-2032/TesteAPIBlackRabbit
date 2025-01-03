import { AppError } from "@/use-cases/errors/app-error";
import { GetGraphicAccountByNumberIdentifierUseCase } from "@/use-cases/get-graphic-account-by-number-dentifier";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function getGraphicAccountByNumberIdentifier(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const querySchema = z.object({
      number_identifier: z.string(),
    });

    const { number_identifier } = querySchema.parse(request.query);

    const getGraphicAccountByNumberIdentifierUseCase = new GetGraphicAccountByNumberIdentifierUseCase(); // Instancie o use case
    
    const { user } = await getGraphicAccountByNumberIdentifierUseCase.execute({ number_identifier }); // Chame o método execute

    return reply.status(200).send({ user });
  } catch (error) {
    throw new AppError(error);
  }
}
