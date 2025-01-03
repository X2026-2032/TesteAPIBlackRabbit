import { prisma } from "@/lib/prisma";
import { FastifyReply, FastifyRequest } from "fastify";

async function verifyEmail(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { email, cpf } = request.params as Record<string, string>;

    const user = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });

    const walletEmail = await prisma.graphicAccount.findFirst({
      where: {
        email: email,
      },
    });

    const walletDocument = await prisma.graphicAccount.findFirst({
      where: {
        document: cpf,
      },
    });

    if (walletDocument || walletEmail || user) {
      return reply.status(401).send("E-mail já esta sendo usado ou Cpf");
    }

    return reply.status(200).send("ok");
  } catch (error: any) {
    throw new Error(error);
  }
}

export { verifyEmail };
