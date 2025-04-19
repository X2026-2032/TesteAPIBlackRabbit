import { FastifyInstance } from "fastify";
import {
  createGroup,
  addUserToGroup,
  removeUserFromGroup,
  blockUserInGroup,
  sendInvite,
  listGroupsInGraphicAccount,
  acceptInvite,
  rejectInvite,
  listAllGroups,
  editGroupByName,
  listGroupMembers,
  listGroupInvitesController,
  listUserGroups,
} from "./groupController";
import { deleteGroupByName } from "./deleteGroup";
import { listGroupInvitesService } from "./groupService";

export async function GroupRoutes(app: FastifyInstance) {
  app.post("/", createGroup);
  app.post("/add-user", addUserToGroup);
  app.post("/remove-user", removeUserFromGroup);
  app.post("/block-user", blockUserInGroup);
  app.post("/invite", sendInvite);
  app.post("/accept-invite", acceptInvite); // Nova rota
  app.post("/reject-invite", rejectInvite); // Nova rota
  app.get("/list-groups/:graphicAccountId", listGroupsInGraphicAccount);
  app.get("/list-groups-invites/:graphicAccountId", listGroupInvitesController);
  app.get("/list-all", listAllGroups);
  app.delete("/delete", deleteGroupByName);
  // Rota para Editar Grupo
  app.patch("/edit", editGroupByName); // Usando PATCH para edição parcial

  // Rota para Listar Membros
  app.get("/members/:groupId", listGroupMembers); // Usando GET para listar membros
  // Rota para listar convites de grupos
  app.get("/list-invites/:graphicAccountId", listGroupInvitesController);

  // Adiciona a rota para listar os grupos do usuário
  app.get("/list/:username/all-groups", listUserGroups);
}
