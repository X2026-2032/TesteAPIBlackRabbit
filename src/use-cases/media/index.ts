import { prisma } from "@/lib/prisma";
import path from "path";
import fs from "fs";

export class MediaServices {
  async list({ userId }: { userId: string }) {
    console.log("[MediaServices] Iniciando método `list`");
    console.log(`[MediaServices] Buscando usuário com ID: ${userId}`);

    // Diretório onde as imagens estão armazenadas
    const directoryPath = path.join(__dirname, "../../http/uploads");
    console.log(`[MediaServices] Diretório de busca: aqyui ${directoryPath}`);

    try {
      const files = fs.readdirSync(directoryPath);
      console.log(`[MediaServices] Arquivos encontrados:`, files);

      // Procurar um arquivo que tenha o userId como nome
      const userImage = files.find(file => file.startsWith(userId));

      if (!userImage) {
        console.error("[MediaServices] Nenhuma imagem encontrada para o usuário.");
        return { current: null };
      }

      console.log(`[MediaServices] Imagem atual do usuário: ${userImage}`);
      return { current: userImage };
    } catch (error) {
      console.error("[MediaServices] Erro ao listar imagens:", error);
      return { current: null };
    } 
  }
  async update({ userId, url }: { userId: string, url: string }) {
    console.log("[MediaServices] Iniciando método `update`");
    try {
      const user = await prisma.graphicAccount.findUnique({
        where: {
          id: userId,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Atualizando a imagem do perfil
      await prisma.pictures.update({
        where: { id: userId },
        data: { url },
      });

      return { message: "Profile picture updated successfully" };
    } catch (error) {
      console.error("[MediaServices] Erro no método `update`:", error);
      throw error;
    }
  }
}
