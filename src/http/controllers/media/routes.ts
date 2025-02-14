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
    "/update-profile-picture/:id",
    { preHandler: uploadUser.single("file") },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { id } = request.params as { id: string };

        if (!id) {
          return reply
            .status(400)
            .send({ message: "ID do usuário não informado." });
        }

        const userExists = await prisma.graphicAccount.findUnique({
          where: {
            id: id as string,
          },
        });

        if (!userExists) {
          return reply
            .status(400)
            .send({ message: "ID do usuário não encontrado." });
        }

        console.log("Request file", request.file);

        console.log(
          `📌 Enviando atualização de avatar para o usuário: ${userExists.id}`,
        );

        if (!request.file) {
          return reply.status(400).send({ message: "Nenhum arquivo enviado." });
        }

        const filePath = `/uploads/${request.file.filename}`;

        console.log("File Path", filePath);

        console.log(
          `✅ Imagem de perfil do usuário ${userExists.id} atualizada para ${filePath}`,
        );

        return reply.send({
          message: "Imagem de perfil atualizada com sucesso!",
          filePath,
        });
      } catch (error) {
        console.log("Erro ao atualizar avatar", error);
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
    { preHandler: uploadGroup.single("file") },
    async (request, reply) => {
      if (!request.file) {
        return reply.status(400).send({ message: "Nenhum arquivo enviado." });
      }
      return reply.send({
        message: "Imagem de perfil do grupo atualizada com sucesso!",
        filePath: `/uploads-groups/${request.file.filename}`,
      });
    },
  );
}
