// updateUserConfigKeyPix.ts
import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "@/lib/prisma";

interface UserPayload {
  role: "ADMIN" | "MEMBER";
  type: string;
  sub: string;
}

export async function updateUserConfigKeyPix(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { userId } = request.params as { userId: string }; // Defina o tipo do parâmetro userId como string

    // Verifique se o usuário está autenticado (via middleware verifyJwt)
    const user = request.user as UserPayload; // Defina o tipo do payload do usuário

    if (userId !== user.sub) {
      reply
        .status(403)
        .send("Usuário não autorizado para atualizar esta configuração");
      return;
    }

    const { config_key_pix } = request.body as { config_key_pix: string }; // Extraia o valor da config_key_pix do corpo da solicitação

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        config_key_pix, // Substitua pelo valor desejado
      },
    });
    reply.send(updatedUser);
  } catch (error) {
    reply.status(500).send("Erro ao atualizar config_key_pix");
  }
}
