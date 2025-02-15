import { MediaServices } from "@/use-cases/media";
import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "@/lib/prisma";

const mediaServices = new MediaServices();

export async function getProfilePicture(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { id } = request.params as { id: string };

    if (!id) {
      console.error("[Controller] ID não fornecido nos parâmetros");
      return reply.status(400).send({ message: "User ID is required." });
    }

    const result = await prisma.graphicAccount.findUnique({
      where: { id },
    });

    return reply.send(result?.avatarLink);
  } catch (error) {
    return reply.status(500).send({ message: "Internal server error." });
  }
}
