import { MediaServices } from "@/use-cases/media";
import { FastifyReply, FastifyRequest } from "fastify";
import path from "path";
import fs from "fs";

const mediaServices = new MediaServices();

export async function getProfilePicture(
  request: FastifyRequest,
  reply: FastifyReply
) {
  console.log("[Controller] Iniciando o método `listProfilePictures`");

  try {
    const { id } = request.params as { id: string };

    if (!id) {
      console.error("[Controller] ID não fornecido nos parâmetros");
      return reply.status(400).send({ message: "User ID is required." });
    }

    console.log(`[Controller] Chamando MediaServices.list para ID: ${id}`);
    const result = await mediaServices.list({ userId: id });

    if (!result.current) {
      console.log(`[Controller] Nenhuma imagem encontrada para o usuário: ${id}`);
      return reply.status(404).send({ message: "Profile picture not found." });
    }

    const imagePath = path.join(__dirname, "../../uploads", result.current); // Caminho corrigido
    
    if (!fs.existsSync(imagePath)) {
      console.log(`[Controller] Arquivo não encontrado: ${imagePath}`);
      return reply.status(404).send({ message: "File not found." });
    }

    const contentType = result.current.endsWith(".png") ? "image/png" :
                        result.current.endsWith(".jpg") || result.current.endsWith(".jpeg") ? "image/jpeg" :
                        result.current.endsWith(".webp") ? "image/webp" : "application/octet-stream";

    reply.header("Content-Type", contentType);
    
    return reply.send(fs.createReadStream(imagePath));

  } catch (error) {
    console.error("[Controller] Erro capturado:", error);
    return reply.status(500).send({ message: "Internal server error." });
  }
}