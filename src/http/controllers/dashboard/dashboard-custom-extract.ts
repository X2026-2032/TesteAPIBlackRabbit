import { AppError } from "@/use-cases/errors/app-error";
import { makeDashboardCustomExtract } from "@/use-cases/factories/dashboard/make-dashboard-custom-extract";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function customExtract(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const schema = z.object({
      end_date: z.string(),
      start_date: z.string(),
    });
    const query = schema.parse(request.query);

    const factory = makeDashboardCustomExtract();
    const response = await factory.execute(query, request.user.sub);

    reply.status(200).send(response);
  } catch (error) {
    throw new AppError(error);
  }
}
