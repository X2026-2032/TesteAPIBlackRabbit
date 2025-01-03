import { AppError } from "@/use-cases/errors/app-error";
import { MediaServices } from "@/use-cases/media";
import { FastifyReply, FastifyRequest } from "fastify";

interface RequestParams {
  id: string;
}

export async function getProfilePicture(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const mediaServices = new MediaServices();

    const response = await mediaServices.list({
      userId: (request.params as RequestParams).id,
    });

    return reply.status(201).send(response);
  } catch (error: any) {
    throw new AppError(error);
  }
}
