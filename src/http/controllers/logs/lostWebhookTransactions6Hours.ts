import { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "@/use-cases/errors/app-error";
import jsonfile from "jsonfile";

export async function LostWebhookTransactions6Hour(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const jsonData = await jsonfile.readFile(
      "src/logs/lostWebhookTransactions6Hours.json",
    );

    return reply.status(200).send(jsonData);
  } catch (error: any) {
    throw new AppError(error);
  }
}
