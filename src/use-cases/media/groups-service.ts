import { prisma } from "@/lib/prisma";
import path from "path";
import fs from "fs";

export class MediaGroupServices {
  // Método para listar imagens de perfil de um usuário
  async list({ groupId }: { groupId: string }) {
    const directoryPath = path.join(process.cwd(), "uploads-groups"); // Alterado para a raiz do projeto

    try {
      const files = fs.readdirSync(directoryPath);

      const groupImage = files.find((file) => file.startsWith(groupId));

      if (!groupImage) {
        return { current: null };
      }

      return { current: groupImage };
    } catch (error) {
      return { current: null };
    }
  }

  // Método para atualizar a imagem de perfil do usuário
  async update({ groupId, url }: { groupId: string; url: string }) {
    try {
      const group = await prisma.group.findUnique({
        where: { id: groupId },
      });

      if (!group) {
        throw new Error("Grupo não encontrado.");
      }

      // Atualiza a imagem do perfil no banco
      await prisma.pictures.update({
        where: { id: groupId },
        data: { url },
      });

      return { message: "Imagem de perfil atualizada com sucesso." };
    } catch (error) {
      throw error;
    }
  }

  // Método para obter a URL da imagem de perfil de um usuário
  async getProfilePictureByGroupId(groupId: string): Promise<string | null> {
    try {
      const result = await this.list({ groupId });

      if (!result.current) {
        return null;
      }

      const imagePath = path.join(__dirname, "uploads-groups", result.current);
      if (!fs.existsSync(imagePath)) {
        return null;
      }

      return `/uploads-groups/${result.current}`; // Retorna a URL da imagem de perfil
    } catch (error) {
      return null;
    }
  }

  // Método para obter as imagens de perfil de todos os contatos de um usuário
  async getAllProfilePictures(groupsIds: string[]) {
    // Diretório onde as imagens estão armazenadas
    const directoryPath = path.join(process.cwd(), "uploads-groups"); // Alterado para a raiz do projeto

    try {
      // Listar arquivos na pasta
      const files = fs.readdirSync(directoryPath);

      // Criar lista de imagens associadas aos usuários
      const profilePictures = groupsIds.map((groupId) => {
        const foundImage = files.find((file) => file.startsWith(groupId));
        return {
          groupId,
          profilePictureUrl: foundImage
            ? `/uploads-groups/${foundImage}`
            : null,
        };
      });

      return profilePictures;
    } catch (error) {
      throw new Error("Erro ao buscar imagens de perfil");
    }
  }
}
