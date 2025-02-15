import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "@/lib/prisma";
import { Contact } from "@prisma/client";
import { MediaServices } from "@/use-cases/media";
import path from "path";
import fs from "fs";

const mediaServices = new MediaServices();

export async function getAllProfilePictures(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { id } = request.params as { id: string };

    if (!id) {
      return reply.status(400).send({ message: "User ID is required." });
    }

    const contacts = await prisma.contact.findMany({
      where: { graphicAccountId: id },
      include: { graphicAccount: true },
    });

    const avatarLinks = contacts.map(
      (contact) => contact.graphicAccount.avatarLink,
    );

    return reply.send(avatarLinks);
  } catch (error) {
    return reply.status(500).send({ message: "Internal server error." });
  }
}
