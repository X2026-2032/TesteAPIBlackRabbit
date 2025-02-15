import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { verifyJwt } from "@/http/middlewares/verify-jwt";
import { getProfilePicture } from "./get-profile-picture";
import { getAllProfilePictures } from "./get-all-profile-picture-controller";
import { getAllGroupsProfilePictures } from "./get-all-group-profile-picture-controller";
import { getGroupProfilePicture } from "./get-group-profile-picture";
import { uploadGroup, uploadUser } from "@/utils/multer/multer-config";
import { prisma } from "@/lib/prisma";

export async function MediaRoutes(app: FastifyInstance) {
  // app.addHook("onRequest", verifyJwt);

  //////////// user routes ////////////
  // Rota para buscar todas as imagens de perfil dos contatos
  app.get("/get-all-profile-pictures/:id", getAllProfilePictures);
  // Rota para buscar a imagem de perfil de um contato
  app.get("/get-profile-picture/:id", getProfilePicture);
  // Rota para atualizar a imagem do perfil do usuário

  app.post(
    "/update-profile-picture",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { userId, avatarLink } = request.body as {
          userId: string;
          avatarLink: string;
        };

        if (!userId) {
          return reply
            .status(400)
            .send({ message: "ID do usuário não informado." });
        }

        const userExists = await prisma.graphicAccount.findUnique({
          where: { id: userId },
        });

        if (!userExists) {
          return reply
            .status(404)
            .send({ message: "ID do usuário não encontrado." });
        }

        if (!avatarLink) {
          return reply
            .status(400)
            .send({ message: "Link da imagem de perfil obrigatório." });
        }

        await prisma.graphicAccount.update({
          where: { id: userId },
          data: { avatarLink },
        });

        return reply.status(204).send();
      } catch (error) {
        console.error("Erro ao atualizar avatar:", error);
        return reply
          .status(500)
          .send({ message: "Erro interno ao processar a imagem." });
      }
    },
  );

  //////////// group routes ////////////

  // Rota para buscar todas as imagens de perfil dos grupos
  app.get("/get-all-group-profile-pictures/:id", getAllGroupsProfilePictures);
  // Rota para buscar a imagem de perfil de um grupo
  app.get("/get-group-profile-picture/:id", getGroupProfilePicture);
  // Rota para atualizar a imagem do perfil do grupo
  app.post(
    "/update-group-profile-picture/:id",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { groupId, avatarLink } = request.body as {
          groupId: string;
          avatarLink: string;
        };

        if (!groupId) {
          return reply
            .status(400)
            .send({ message: "ID do usuário não informado." });
        }

        if (!avatarLink) {
          return reply
            .status(400)
            .send({ message: "Link da imagem de perfil obrigatório." });
        }

        await prisma.group.update({
          where: { id: groupId },
          data: { groupAvatarLink: avatarLink },
        });

        return reply.status(204).send();
      } catch (error) {
        console.error("Erro ao atualizar avatar do grupo:", error);
        return reply
          .status(500)
          .send({ message: "Erro interno ao processar a imagem do grupo." });
      }
    },
  );
}
