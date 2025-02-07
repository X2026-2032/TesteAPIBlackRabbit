import { MediaServices } from "@/use-cases/media";
import { FastifyReply, FastifyRequest } from "fastify";
import path from "path";
import fs from "fs";

const mediaServices = new MediaServices();

export async function getProfilePicture(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { id } = request.params as { id: string };

    if (!id) {
      console.error("[Controller] ID não fornecido nos parâmetros");
      return reply.status(400).send({ message: "User ID is required." });
    }

    const result = await mediaServices.list({ userId: id });

    if (!result.current) {
      return reply.status(404).send({ message: "Profile picture not found." });
    }

    const imagePath = path.join(process.cwd(), "uploads", result.current); // Caminho corrigido

    if (!fs.existsSync(imagePath)) {
      return reply.status(404).send({ message: "File not found." });
    }

    const contentType = result.current.endsWith(".png")
      ? "image/png"
      : result.current.endsWith(".jpg") || result.current.endsWith(".jpeg")
      ? "image/jpeg"
      : result.current.endsWith(".webp")
      ? "image/webp"
      : "application/octet-stream";

    reply.header("Content-Type", contentType);

    return reply.send(fs.createReadStream(imagePath));
  } catch (error) {
    return reply.status(500).send({ message: "Internal server error." });
  }
}
