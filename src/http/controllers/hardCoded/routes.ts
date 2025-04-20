import { FastifyInstance } from "fastify";
import { findHardCoded } from "./hardCodedController";

export async function hardCodedRoutes(app: FastifyInstance) {
  app.get("/hardcoded", async (request, reply) => {
    const { content } = request.query as { content?: string };

    console.log("content", content);

    if (!content) {
      reply.status(400).send({ error: "Parâmetro 'content' é obrigatório." });
      return;
    }

    try {
      const result = await findHardCoded(content);
      return result;
    } catch (error: any) {
      reply.status(500).send({ error: error.message });
    }
  });
}
