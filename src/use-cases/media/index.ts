import { prisma } from "@/lib/prisma";
import path from "path";
import fs from "fs";

export class MediaServices {
  // Método para listar imagens de perfil de um usuário
  async list({ userId }: { userId: string }) {
    const directoryPath = path.join(process.cwd(), "uploads"); // Alterado para a raiz do projeto

    try {
      const files = fs.readdirSync(directoryPath);

      const userImage = files.find((file) => file.startsWith(userId));

      if (!userImage) {
        return { current: null };
      }

      return { current: userImage };
    } catch (error) {
      return { current: null };
    }
  }

  // Método para atualizar a imagem de perfil do usuário
  async update({ userId, url }: { userId: string; url: string }) {
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

      return { message: "Imagem de perfil atualizada com sucesso." };
    } catch (error) {
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

      const imagePath = path.join(process.cwd(), "uploads", result.current); // Alterado para a raiz do projeto
      if (!fs.existsSync(imagePath)) {
        return null;
      }

      return `/uploads/${result.current}`; // Retorna a URL da imagem de perfil
    } catch (error) {
      return null;
    }
  }

  // Método para obter as imagens de perfil de todos os contatos de um usuário
  async getAllProfilePictures(contactIds: string[]) {
    console.log("[MediaServices] Iniciando método `getAllProfilePictures`");

    // Diretório onde as imagens estão armazenadas
    const directoryPath = path.join(process.cwd(), "uploads"); // Alterado para a raiz do projeto

    try {
      // Listar arquivos na pasta
      const files = fs.readdirSync(directoryPath);

      // Criar lista de imagens associadas aos usuários
      const profilePictures = contactIds.map((userId) => {
        const foundImage = files.find((file) => file.startsWith(userId));
        return {
          userId,
          profilePictureUrl: foundImage ? `/uploads/${foundImage}` : null,
        };
      });

      return profilePictures;
    } catch (error) {
      throw new Error("Erro ao buscar imagens de perfil");
    }
  }
}
