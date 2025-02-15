import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "@/lib/prisma";
import { Contact } from "@prisma/client";
import path from "path";
import fs from "fs";
import { MediaGroupServices } from "@/use-cases/media/groups-service";

const mediaServices = new MediaGroupServices();

export async function getAllGroupsProfilePictures(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { id } = request.params as { id: string };

    const groups = await prisma.group.findMany({
      where: { ownerId: id },
      include: { owner: true },
    });

    if (!groups || groups.length === 0) {
      return reply.status(404).send({ message: "No groups found." });
    }

    const groupAvatarLinks = groups.map((group) => group.groupAvatarLink);

    return reply.send(groupAvatarLinks).status(200);
  } catch (error) {
    return reply.status(500).send({ message: "Internal server error." });
  }
}
