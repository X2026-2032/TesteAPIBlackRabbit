import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "@/lib/prisma";
import { Contact } from "@prisma/client";
import { MediaServices } from "@/use-cases/media";
import path from "path";
import fs from "fs";

const mediaServices = new MediaServices();

export async function getAllProfilePictures(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const contacts = await prisma.contact.findMany({
      include: { graphicAccount: true },
    });

    if (!contacts || contacts.length === 0) {
      return reply.status(404).send({ message: "No contacts found." });
    }

    // Remover IDs duplicados
    const uniqueContactIds = [
      ...new Set(contacts.map((contact: Contact) => contact.graphicAccountId)),
    ];

    // Criar um array para armazenar todas as imagens
    const imagesArray: { userId: string; image: string | null }[] = [];

    for (const userId of uniqueContactIds) {
      const result = await mediaServices.list({ userId });

      if (!result.current) {
        imagesArray.push({ userId, image: null });
        continue;
      }

      const imagePath = path.join(process.cwd(), "uploads", result.current); // Alterado para a raiz do projeto

      if (!fs.existsSync(imagePath)) {
        imagesArray.push({ userId, image: null });
        continue;
      }

      // Converte a imagem para Base64 para envio no JSON
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = `data:image/png;base64,${imageBuffer.toString(
        "base64",
      )}`;

      imagesArray.push({ userId, image: base64Image });
    }

    return reply.send({ images: imagesArray }); // Envia todas as imagens em um JSON
  } catch (error) {
    return reply.status(500).send({ message: "Internal server error." });
  }
}
