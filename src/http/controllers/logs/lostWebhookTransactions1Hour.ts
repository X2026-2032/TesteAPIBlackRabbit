import { AppError } from "@/use-cases/errors/app-error";
import { FastifyReply, FastifyRequest } from "fastify";
import jsonfile from "jsonfile";

export async function LostWebhookTransactions1Hour(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const jsonData = await jsonfile.readFile(
      "src/logs/lostWebhookTransactions1Hour.json",
    );

    return reply.status(200).send(jsonData);
  } catch (error: any) {
    throw new AppError(error);
  }
}
