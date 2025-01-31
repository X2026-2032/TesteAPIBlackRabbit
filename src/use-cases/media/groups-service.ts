import { prisma } from "@/lib/prisma";
import path from "path";
import fs from "fs";

export class MediaGroupServices {
  // Método para listar imagens de perfil de um usuário
  async list({ groupId }: { groupId: string }) {
    console.log("[MediaServices] Iniciando método `list`");
    console.log(`[MediaServices] Buscando usuário com ID: ${groupId}`);

    const directoryPath = path.join(process.cwd(), "uploads-groups"); // Alterado para a raiz do projeto
    console.log(`[MediaServices] Diretório de busca: ${directoryPath}`);

    try {
      const files = fs.readdirSync(directoryPath);
      console.log(`[MediaServices] Arquivos encontrados:`, files);

      const groupImage = files.find((file) => file.startsWith(groupId));

      if (!groupImage) {
        console.warn("[MediaServices] Nenhuma imagem encontrada para o usuário.");
        return { current: null };
      }

      console.log(`[MediaServices] Imagem atual do usuário: ${groupImage}`);
      return { current: groupImage };
    } catch (error) {
      console.error("[MediaServices] Erro ao listar imagens:", error);
      return { current: null };
    }
  }

  // Método para atualizar a imagem de perfil do usuário
  async update({ groupId, url }: { groupId: string; url: string }) {
    console.log("[MediaServices] Iniciando método `update`");

    try {
      const group = await prisma.group.findUnique({
        where: { id: groupId },
      });

      if (!group) {
        throw new Error("Usuário não encontrado.");
      }

      // Atualiza a imagem do perfil no banco
      await prisma.pictures.update({
        where: { id: groupId },
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
      console.error("[MediaServices] Erro ao obter a imagem de perfil:", error);
      return null;
    }
  }

  // Método para obter as imagens de perfil de todos os contatos de um usuário
  async getAllProfilePictures(groupsIds: string[]) {
    console.log("[MediaServices] Iniciando método `getAllProfilePictures`");

    // Diretório onde as imagens estão armazenadas
    const directoryPath = path.join(process.cwd(), "uploads-groups"); // Alterado para a raiz do projeto
    console.log(`[MediaServices] Diretório de busca: ${directoryPath}`);

    try {
      // Listar arquivos na pasta
      const files = fs.readdirSync(directoryPath);
      console.log(`[MediaServices] Arquivos encontrados:`, files);

      // Criar lista de imagens associadas aos usuários
      const profilePictures = groupsIds.map((groupId) => {
        const foundImage = files.find((file) => file.startsWith(groupId));
        return {
          groupId,
          profilePictureUrl: foundImage ? `/uploads-groups/${foundImage}` : null,
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
