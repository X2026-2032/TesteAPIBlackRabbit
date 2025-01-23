import { FastifyReply, FastifyRequest } from "fastify";

export async function verifyJwt(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
    console.log("Usuário autenticado:", request.user); // Verifique o conteúdo de request.user
  } catch (err) {
    return reply.status(401).send({ message: "Unauthorized." });
  }
}
