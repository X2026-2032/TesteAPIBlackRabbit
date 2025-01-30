import { prisma } from "@/lib/prisma";
import path from "path";
import fs from "fs";

export class MediaServices {
  // Método para listar imagens de perfil de um usuário
  async list({ userId }: { userId: string }) {
    console.log("[MediaServices] Iniciando método `list`");
    console.log(`[MediaServices] Buscando usuário com ID: ${userId}`);

    const directoryPath = path.join(__dirname, "../../http/uploads");
    console.log(`[MediaServices] Diretório de busca: ${directoryPath}`);

    try {
      const files = fs.readdirSync(directoryPath);
      console.log(`[MediaServices] Arquivos encontrados:`, files);

      const userImage = files.find((file) => file.startsWith(userId));

      if (!userImage) {
        console.warn("[MediaServices] Nenhuma imagem encontrada para o usuário.");
        return { current: null };
      }

      console.log(`[MediaServices] Imagem atual do usuário: ${userImage}`);
      return { current: userImage };
    } catch (error) {
      console.error("[MediaServices] Erro ao listar imagens:", error);
      return { current: null };
    }
  }

  // Método para atualizar a imagem de perfil do usuário
  async update({ userId, url }: { userId: string; url: string }) {
    console.log("[MediaServices] Iniciando método `update`");

    try {
      const user = await prisma.graphicAccount.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error("Usuário não encontrado.");
      }

      // Atualiza a imagem do perfil no banco
      await prisma.pictures.update({
        where: { id: userId },
        data: { url },
      });

      console.log("[MediaServices] Imagem de perfil atualizada com sucesso.");
      return { message: "Imagem de perfil atualizada com sucesso." };
    } catch (error) {
      console.error("[MediaServices] Erro no método `update`:", error);
      throw error;
    }
  }

  // Método para obter a URL da imagem de perfil de um usuário
  async getProfilePictureByUserId(userId: string): Promise<string | null> {
    try {
      const result = await this.list({ userId });

      if (!result.current) {
        return null;
      }

      const imagePath = path.join(__dirname, "../../http/uploads", result.current);
      if (!fs.existsSync(imagePath)) {
        return null;
      }

      return `/uploads/${result.current}`; // Retorna a URL da imagem de perfil
    } catch (error) {
      console.error("[MediaServices] Erro ao obter a imagem de perfil:", error);
      return null;
    }
  }

  // Método para obter as imagens de perfil de todos os contatos de um usuário
  async getAllProfilePictures(contactIds: string[]) {
    console.log("[MediaServices] Iniciando método `getAllProfilePictures`");

    // Diretório onde as imagens estão armazenadas
    const directoryPath = path.join(__dirname, "../../http/uploads");
    console.log(`[MediaServices] Diretório de busca: ${directoryPath}`);

    try {
      // Listar arquivos na pasta
      const files = fs.readdirSync(directoryPath);
      console.log(`[MediaServices] Arquivos encontrados:`, files);

      // Criar lista de imagens associadas aos usuários
      const profilePictures = contactIds.map((userId) => {
        const foundImage = files.find((file) => file.startsWith(userId));
        return {
          userId,
          profilePictureUrl: foundImage ? `/uploads/${foundImage}` : null,
        };
      });

      console.log("[MediaServices] Retornando imagens:", profilePictures);
      return profilePictures;
    } catch (error) {
      console.error("[MediaServices] Erro ao buscar imagens de perfil:", error);
      throw new Error("Erro ao buscar imagens de perfil");
    }
  }
}
