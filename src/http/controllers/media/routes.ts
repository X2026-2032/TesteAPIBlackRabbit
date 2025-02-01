import { FastifyInstance } from "fastify";
import { verifyJwt } from "@/http/middlewares/verify-jwt";
import { getProfilePicture } from "./get-profile-picture";
import { getAllProfilePictures } from "./get-all-profile-picture-controller";
import { getAllGroupsProfilePictures } from "./get-all-group-profile-picture-controller";
import { getGroupProfilePicture } from "./get-group-profile-picture";
import { uploadGroup, uploadUser } from "@/utils/multer/multer-config";

export async function MediaRoutes(app: FastifyInstance) {
  app.addHook("onRequest", verifyJwt);

  //////////// user routes ////////////
  // Rota para buscar todas as imagens de perfil dos contatos
  app.get("/get-all-profile-pictures/:id", getAllProfilePictures);
  // Rota para buscar a imagem de perfil de um contato
  app.get("/get-profile-picture/:id", getProfilePicture);
  // Rota para atualizar a imagem do perfil do usuário
  app.post("/update-profile-picture/:id", { preHandler: uploadUser.single("file") }, async (request, reply) => {
    const userId = request.params;
  
    if (!userId) {
      return reply.status(400).send({ message: "ID do usuário não encontrado." });
    }
  
    console.log(`📌 Enviando atualização de avatar para o usuário: ${userId}`);
  
    if (!request.file) {
      return reply.status(400).send({ message: "Nenhum arquivo enviado." });
    }
  
    const filePath = `/uploads/${request.file.filename}`;
  
    console.log(`✅ Imagem de perfil do usuário ${userId} atualizada para ${filePath}`);
  
    return reply.send({
      message: "Imagem de perfil atualizada com sucesso!",
      filePath,
    });
  });
  

  //////////// group routes ////////////

  // Rota para buscar todas as imagens de perfil dos grupos
  app.get("/get-all-group-profile-pictures/:id", getAllGroupsProfilePictures);
  // Rota para buscar a imagem de perfil de um grupo
  app.get("/get-group-profile-picture/:id", getGroupProfilePicture);
  // Rota para atualizar a imagem do perfil do grupo
  app.post("/update-group-profile-picture/:id", { preHandler: uploadGroup.single("file") }, async (request, reply) => {
    if (!request.file) {
      return reply.status(400).send({ message: "Nenhum arquivo enviado." });
    }
    return reply.send({
      message: "Imagem de perfil do grupo atualizada com sucesso!",
      filePath: `/uploads-groups/${request.file.filename}`,
    });
  });
}
