import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";
import { FastifyReply, FastifyRequest } from "fastify";

export const CreateTokenQrCode = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 3 * 60 * 1000);

    await prisma.qrToken.create({
      data: {
        token,
        status: "PENDING",
        expiresAt,
      },
    });

    reply.send({
      token,
      expiresAt,
      status: "PENDING",
    });
  } catch (err: any) {
    throw new Error(err);
  }
};
