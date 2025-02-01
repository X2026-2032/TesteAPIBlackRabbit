import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "@/lib/prisma";
import { Contact } from "@prisma/client";
import path from "path";
import fs from "fs";
import { MediaGroupServices } from "@/use-cases/media/groups-service";

const mediaServices = new MediaGroupServices();

export async function getAllGroupsProfilePictures(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    console.log("[Controller] Iniciando `getAllProfilePictures`");

    const groups = await prisma.group.findMany({
      include: { owner: true },
    });

    if (!groups || groups.length === 0) {
      console.log("[Controller] Nenhum grupo encontrado.");
      return reply.status(404).send({ message: "No groups found." });
    }

    // Remover IDs duplicados
    const uniqueGroupIds = [
      ...new Set(groups.map(( groups: { id: any; } ) => groups.id)),
    ];

    // Criar um array para armazenar todas as imagens
    const imagesArray: { groupId : string; image: string | null }[] = [];

    for (const groupId of uniqueGroupIds) { // Iterar sobre todos os IDs de grupo unicostIds) {
      const result = await mediaServices.list({ groupId });

      if (!result.current) {
        console.log(`[Controller] Nenhuma imagem encontrada para o grupo: ${groupId}`);
        imagesArray.push({ groupId , image: null });
        continue;
      }

      const imagePath = path.join(process.cwd(), "uploads-groups", result.current); // Alterado para a raiz do projeto

      if (!fs.existsSync(imagePath)) {
        console.log(`[Controller] Arquivo não encontrado: ${imagePath}`);
        imagesArray.push({ groupId, image: null });
        continue;
      }

      // Converte a imagem para Base64 para envio no JSON
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = `data:image/png;base64,${imageBuffer.toString("base64")}`;

      imagesArray.push({ groupId, image: base64Image });
    }

    return reply.send({ images: imagesArray }); // Envia todas as imagens em um JSON

  } catch (error) {
    console.error("[Controller] Erro capturado:", error);
    return reply.status(500).send({ message: "Internal server error." });
  }
}
