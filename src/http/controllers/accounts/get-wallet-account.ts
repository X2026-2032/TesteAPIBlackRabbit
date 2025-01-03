import { FetchByDocument } from "@/use-cases/accounts/fetch-by-document";
import { AppError } from "@/use-cases/errors/app-error";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function getWalletAccount(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const querySchema = z.object({
      document: z.string(),
    });

    const { document } = querySchema.parse(request.query);

    const fetchByDocument = new FetchByDocument();

    const response = await fetchByDocument.execute({ document });

    return reply.status(200).send(response);
  } catch (error) {
    throw new AppError(error);
  }
}
