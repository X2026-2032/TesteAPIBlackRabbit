import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "@/lib/prisma";

interface UserPayload {
  role: "ADMIN" | "MEMBER";
  type: string;
  sub: string;
}

export async function getUserConfigKeyPix(
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
        .send("Usuário não autorizado para acessar esta configuração");
      return;
    }

    const userRecord = await prisma.user.findUnique({
      where: { id: userId },
      select: { config_key_pix: true },
    });

    if (!userRecord) {
      reply.status(404).send("Usuário não encontrado");
    } else {
      reply.send(userRecord.config_key_pix);
    }
  } catch (error) {
    reply
      .status(500)
      .send("Erro ao obter a configuração da chave PIX do usuário");
  }
}
