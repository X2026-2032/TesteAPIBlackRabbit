import { FastifyReply, FastifyRequest } from "fastify";
import path from "path";
import fs from "fs";
import { MediaGroupServices } from "@/use-cases/media/groups-service";
import { prisma } from "@/lib/prisma";

const mediaServices = new MediaGroupServices();

export async function getGroupProfilePicture(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { id } = request.params as { id: string };

    if (!id) {
      return reply.status(400).send({ message: "Group ID is required." });
    }

    const group = await prisma.group.findUnique({
      where: { id },
    });

    if (!group) {
      return reply.status(404).send({ message: "Group not found." });
    }

    return reply.send(group.groupAvatarLink);
  } catch (error) {
    return reply.status(500).send({ message: "Internal server error." });
  }
}
