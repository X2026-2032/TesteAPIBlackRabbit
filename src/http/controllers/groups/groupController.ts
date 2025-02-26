import { prisma } from "@/lib/prisma";
import * as groupService from "./groupService";
import { FastifyReply, FastifyRequest } from "fastify";
import { io } from "@/app";

export async function createGroup(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { name, description, ownerUsername, groupKey } = request.body as {
    name: string;
    description: string;
    ownerUsername: string;
    groupKey: string;
  };

  try {
    // Criação do grupo
    const group = await groupService.createGroup(
      name,
      description,
      ownerUsername,
      groupKey,
    );

    // Buscar o grupo novamente para incluir todos os dados necessários
    const fullGroup = await prisma.group.findUnique({
      where: { id: group.group.id },
    });

    io.emit("group_created", fullGroup);

    reply.status(201).send(fullGroup);
  } catch (error) {
    reply.status(400).send({ error: (error as Error).message });
  }
}

export async function addUserToGroup(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { groupId, username } = request.body as {
    groupId: string;
    username: string;
  };
  try {
    const member = await groupService.addUserToGroup(groupId, username);
    reply.status(201).send(member);
  } catch (error) {
    reply.status(400).send({ error });
  }
}

export async function removeUserFromGroup(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { groupId, username } = request.body as {
    groupId: string;
    username: string;
  };
  try {
    await groupService.removeUserFromGroup(groupId, username);
    reply.status(200).send({ message: "User removed from group" });
  } catch (error) {
    reply.status(400).send({ error });
  }
}

export async function blockUserInGroup(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { groupId, username } = request.body as {
    groupId: string;
    username: string;
  };
  try {
    const blockedMember = await groupService.blockUserInGroup(
      groupId,
      username,
    );
    reply.status(200).send(blockedMember);
  } catch (error) {
    reply.status(400).send({ error });
  }
}

export async function sendInvite(request: FastifyRequest, reply: FastifyReply) {
  const { groupId, username } = request.body as {
    groupId: string;
    username: string;
  };
  console.log("Group ID:", groupId);
  console.log("Username:", username);
  try {
    const invite = await groupService.sendInvite(groupId, username);
    console.log("Group ID:", groupId);
    console.log("Username:", username);
    reply.status(200).send(invite);
  } catch (error) {
    reply.status(400).send({ error });
  }
}

// // Listar grupos no GraphicAccount
// export async function listGroupsInGraphicAccount(  req: FastifyRequest, reply: FastifyReply  ) {
//   const { graphicAccountId } = req.params as { graphicAccountId: string };
//   try {
//     const groups = await groupService.getGroupsInGraphicAccount(graphicAccountId);
//     reply.status(200).send(groups);
//   } catch (error) {
//     reply.status(400).send({ error: error });
//   }
// }

// Atualiza a função para pegar os grupos usando o serviço e acessar os parâmetros da requisição
export async function listGroupsInGraphicAccount(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  // Extrai o graphicAccountId dos parâmetros da URL
  const { graphicAccountId } = req.params as { graphicAccountId: string };

  try {
    // Chama o serviço para pegar os grupos
    const groups = await groupService.getGroupsInGraphicAccount(
      graphicAccountId,
    );

    // Responde com os grupos, já incluindo a contagem de membros
    reply.status(200).send(groups);
  } catch (error) {
    console.error("Erro ao listar grupos da GraphicAccount:", error);
    reply.status(400).send({ error: "Erro ao listar grupos." });
  }
}

export async function acceptInvite(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { groupId, username } = request.body as {
    groupId: string;
    username: string;
  };
  try {
    const result = await groupService.acceptInvite(groupId, username);
    reply.status(200).send(result);
  } catch (error) {
    reply.status(400).send({ error });
  }
}

export async function rejectInvite(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { groupId, username } = request.body as {
    groupId: string;
    username: string;
  };
  try {
    await groupService.rejectInvite(groupId, username);
    reply.status(200).send({ message: "Invite rejected" });
  } catch (error) {
    reply.status(400).send({ error });
  }
}

// Listar todos os Grupos
export async function listAllGroups(req: FastifyRequest, reply: FastifyReply) {
  try {
    const groups = await groupService.getAllGroups();
    reply.status(200).send(groups);
  } catch (error) {
    reply.status(400).send({ error });
  }
}

// Editar Grupo
export async function editGroupByName(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { groupName, newName, newDescription } = request.body as {
    groupName: string;
    newName?: string; // Torne os campos opcionais
    newDescription?: string;
  };

  try {
    // Verifica se o nome do grupo foi passado
    const group = await groupService.editGroupByName(
      groupName,
      newName,
      newDescription,
    );

    reply.status(200).send(group);
  } catch (error) {
    reply.status(400).send({ error: error || "Unable to edit group" });
  }
}

// 3. Listar Membros
export async function listGroupMembers(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { groupId } = request.params as { groupId: string };

  try {
    const members = await groupService.getGroupMembers(groupId);
    reply.status(200).send(members);
  } catch (error) {
    reply.status(400).send({ error });
  }
}

// Função Controladora
export async function listGroupInvitesController(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const { graphicAccountId } = req.params as { graphicAccountId: string }; // Extrai o ID da rota

  try {
    const groupInvites = await groupService.listGroupInvitesService(
      graphicAccountId,
    );

    return reply.status(200).send(groupInvites);
  } catch (error) {
    console.error("Erro ao listar convites de grupos:", error);
    return reply
      .status(500)
      .send({ error: "Erro ao listar convites de grupos" });
  }
}

export async function listUserGroups(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { username } = request.params as { username: string };

  try {
    // Chama o serviço para listar os grupos em que o usuário é dono ou membro
    const groups = await groupService.getUserGroupsWithMembership(username);

    // Retorna a resposta com os grupos
    reply.status(200).send(groups);
  } catch (error) {
    console.error("Erro ao listar grupos do usuário:", error);
    reply.status(400).send({ error: "Erro ao listar grupos." });
  }
}
