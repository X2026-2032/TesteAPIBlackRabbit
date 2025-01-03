import { prisma } from "@/lib/prisma";
import { FastifyReply, FastifyRequest } from "fastify";

export async function logout(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = request.user.sub;

    await prisma.user.update({
      where: { id: userId },
      data: { access_token: null },
    });

    reply.clearCookie("refreshToken", { path: "/" });

    return reply.status(200).send({ message: "Logout successful" });
  } catch (error: any) {
    return reply.status(500).send({ message: error.message });
  }
}
