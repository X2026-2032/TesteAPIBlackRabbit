import { io } from "@/app";
import { prisma } from "@/lib/prisma";

// Criar Grupo
export async function createGroup(
  name: string,
  description: string,
  ownerUsername: string,
  groupKey: string,
) {
  // Busca o dono do grupo com as relações de grupos
  const owner = await prisma.graphicAccount.findUnique({
    where: { userName: ownerUsername },
    include: {
      ownedGroups: { include: { members: true } }, // Grupos que o usuário é dono
      groupMembers: { include: { group: { include: { members: true } } } }, // Grupos que ele participa
    },
  });

  if (!owner) throw new Error("Owner not found");

  // Cria o grupo
  const group = await prisma.group.create({
    data: {
      name,
      description,
      ownerId: owner.id,
      ownerUserName: owner.userName,
      publicKey: groupKey,
    },
  });

  // Cria um registro de GroupMember para o dono do grupo
  await prisma.groupMember.create({
    data: {
      groupId: group.id,
      graphicAccountId: owner.id,
      isOwner: true, // Marca o usuário como dono do grupo
      inviteStatus: "ACCEPTED", // O dono do grupo tem o convite aceito automaticamente
    },
  });

  // Retorna o grupo criado junto com as informações do dono e os grupos associados
  return {
    group,
    ownedGroups: owner.ownedGroups, // Retorna os grupos que o usuário é dono
    groupMembers: owner.groupMembers, // Retorna os grupos que o usuário é membro
  };
}

// Adicionar Usuário ao Grupo
export async function addUserToGroup(groupId: string, username: string) {
  const user = await prisma.graphicAccount.findUnique({
    where: { userName: username },
  });
  if (!user) throw new Error("User not found");

  return prisma.groupMember.create({
    data: {
      groupId,
      graphicAccountId: user.id,
    },
  });
}

// Remover Usuário do Grupo
export async function removeUserFromGroup(groupId: string, username: string) {
  const user = await prisma.graphicAccount.findUnique({
    where: { userName: username },
  });
  if (!user) throw new Error("User not found");

  return prisma.groupMember.deleteMany({
    where: {
      groupId,
      graphicAccountId: user.id,
    },
  });
}

// Bloquear Usuário no Grupo
export async function blockUserInGroup(groupId: string, username: string) {
  const user = await prisma.graphicAccount.findUnique({
    where: { userName: username },
  });
  if (!user) throw new Error("User not found");

  return prisma.groupMember.updateMany({
    where: {
      groupId,
      graphicAccountId: user.id,
    },
    data: { isBlocked: true },
  });
}

// Listar Grupos do Usuário
export async function getUserGroups(username: string) {
  const user = await prisma.graphicAccount.findUnique({
    where: { userName: username },
  });
  if (!user) throw new Error("User not found");

  return prisma.group.findMany({
    where: { ownerId: user.id },
  });
}

// Listar Grupos dentro do GraphicAccount
// groupService.ts
export async function getGroupsInGraphicAccount(graphicAccountId: string) {
  try {
    // Obter os grupos da GraphicAccount com membros
    const groups = await prisma.group.findMany({
      where: {
        ownerId: graphicAccountId,
      },
      include: {
        members: true, // Inclui os membros para contagem
      },
    });

    // Mapear os grupos e adicionar o número de membros
    return groups.map(
      (group: {
        id: any;
        name: any;
        description: any;
        members: string | any[];
      }) => ({
        id: group.id,
        name: group.name,
        description: group.description || null,
        memberCount: group.members ? group.members.length : 0, // Contagem de membros
      }),
    );
  } catch (error) {
    console.error("Erro ao obter grupos:", error);
    throw new Error("Erro ao obter grupos");
  }
}

// Enviar Convite
// Enviar Convite
export async function sendInvite(groupId: string, username: string) {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
  });
  if (!group) throw new Error("Group not found");

  const user = await prisma.graphicAccount.findUnique({
    where: { userName: username },
  });
  if (!user) throw new Error("User not found");

  // Verificar se o usuário já foi convidado ou já está no grupo
  const existingInvite = await prisma.groupMember.findFirst({
    where: { groupId, graphicAccountId: user.id },
  });
  if (existingInvite) {
    if (existingInvite.inviteStatus === "ACCEPTED") {
      throw new Error("User already a member of the group");
    }
    throw new Error("Invite already sent or rejected");
  }

  // Recuperar a chave pública do owner
  const owner = await prisma.graphicAccount.findUnique({
    where: { userName: group.ownerUserName! },
  });
  if (!owner) throw new Error("Owner not found");

  const ownerPublicKey = owner.publicKey; // Supondo que você tem o campo `publicKey` no modelo `graphicAccount`

  io.to(user.id).emit("new_notification", {
    title: "Você foi convidado para uma nova conversa em grupo",
    message:
      "Você acaba de receber um convite para uma nova conversa em grupo.",
    type: "success",
    isRead: false,
  });

  // Criação do convite, incluindo a chave pública do owner
  return prisma.groupMember.create({
    data: {
      groupId,
      graphicAccountId: user.id,
      inviteStatus: "PENDING",
      ownerPublicKey: ownerPublicKey, // Incluindo a chave pública no convite
    },
  });
}

// Aceitar Convite
// Aceitar Convite
export async function acceptInvite(groupId: string, username: string) {
  const user = await prisma.graphicAccount.findUnique({
    where: { userName: username },
  });
  if (!user) throw new Error("User not found");

  const invite = await prisma.groupMember.findFirst({
    where: { groupId, graphicAccountId: user.id, inviteStatus: "PENDING" },
  });

  if (!invite) throw new Error("No pending invite found");

  // Atualiza o status do convite para aceito
  await prisma.groupMember.update({
    where: { id: invite.id },
    data: { inviteStatus: "ACCEPTED" },
  });

  // Retorna a chave pública do criador do grupo
  const groupOwner = await prisma.groupMember.findFirst({
    where: { groupId, isOwner: true }, // Considerando que você tem um campo 'isOwner' para identificar o dono
  });

  if (!groupOwner) throw new Error("Group owner not found");

  const ownerAccount = await prisma.graphicAccount.findUnique({
    where: { id: groupOwner.graphicAccountId },
  });

  if (!ownerAccount || !ownerAccount.publicKey) {
    throw new Error("Public key of the group owner not found");
  }

  const group = await prisma.group.findUnique({
    where: { id: groupId },
  });

  if (!group) throw new Error("Group not found");
  // Agora você pode retornar a chave pública para o usuário que aceitou
  return {
    message: "Convite aceito com sucesso",
    publicKey: group?.publicKey, // Chave pública do dono do grupo
  };
}

// Recusar Convite
export async function rejectInvite(groupId: string, username: string) {
  const user = await prisma.graphicAccount.findUnique({
    where: { userName: username },
  });
  if (!user) throw new Error("User not found");

  const invite = await prisma.groupMember.findFirst({
    where: { groupId, graphicAccountId: user.id, inviteStatus: "PENDING" },
  });

  if (!invite) throw new Error("No pending invite found");

  return prisma.groupMember.update({
    where: { id: invite.id },
    data: { inviteStatus: "REJECTED" },
  });
}

// Listar todos os grupos com os membros relacionados
export async function getAllGroups() {
  return prisma.group.findMany({
    include: {
      members: {
        include: {
          groupMembers: true, // Inclui informações dos membros do grupo
        },
      },
    },
  });
}

// 2. Serviço de Editar Grupo
// Serviço de Editar Grupo
export async function editGroupByName(
  groupName: string,
  newName?: string,
  newDescription?: string,
) {
  try {
    const group = await prisma.group.findFirst({ where: { name: groupName } });
    if (!group) throw new Error("Group not found");

    // Preparando os dados para a atualização
    const updateData: any = {};

    if (newName) updateData.name = newName; // Atualiza o nome se for passado
    if (newDescription) updateData.description = newDescription; // Atualiza a descrição se for passado

    // Atualiza o grupo com os dados fornecidos
    return await prisma.group.update({
      where: { id: group.id },
      data: updateData,
    });
  } catch (error) {
    console.error("Error editing group:", error);
    throw new Error("Unable to edit group");
  }
}

// Serviço de Listar Membros
export async function getGroupMembers(groupId: string) {
  try {
    return await prisma.groupMember.findMany({
      where: { groupId }, // Filtro correto usando o 'groupId'
      include: {
        groupMembers: true, // Inclui informações dos membros do grupo
      },
    });
  } catch (error) {
    console.error("Error fetching group members:", error);
    throw new Error("Unable to fetch group members");
  }
}

export async function listGroupInvitesService(graphicAccountId: string) {
  try {
    const groupInvites = await prisma.groupMember.findMany({
      where: {
        graphicAccountId, // Apenas filtra pelo usuário específico
      },
      include: {
        group: true, // Inclui os dados do grupo associado
      },
    });

    return groupInvites.map((invite) => ({
      id: invite.id,
      groupId: invite.groupId,
      groupName: invite.group.name,
      sender: invite.group.ownerUserName || null,
      receiverId: invite.graphicAccountId,
      status: invite.inviteStatus,
      created_at: invite.created_at,
    }));
  } catch (error) {
    console.error("Erro ao listar convites de grupos:", error);
    throw new Error("Erro ao listar convites de grupos");
  }
}

// // Serviço para listar todos os grupos em que o usuário é dono ou membro
// export async function getUserGroupsWithMembership(username: string) {
//   const user = await prisma.graphicAccount.findUnique({
//     where: { userName: username },
//   });
//   if (!user) throw new Error("User not found");

//   // Buscar os grupos onde o usuário é o dono
//   const ownerGroups = await prisma.group.findMany({
//     where: { ownerId: user.id },
//     include: {
//       members: true, // Inclui os membros para contagem
//     },
//   });

//   // Buscar os grupos onde o usuário é membro
//   const memberGroups = await prisma.groupMember.findMany({
//     where: { graphicAccountId: user.id },
//     include: {
//       group: {
//         include: {
//           members: true,
//         },
//       },
//     },
//   });

//   // Combina os dois tipos de grupos (dono e membro)
//   const allGroups = [
//     ...ownerGroups.map(group => ({
//       ...group,
//       role: 'owner',
//     })),
//     ...memberGroups.map(groupMember => ({
//       ...groupMember.group,
//       role: 'member',
//     })),
//   ];

//   return allGroups.map(group => ({
//     id: group.id,
//     name: group.name,
//     description: group.description || null,
//     memberCount: group.members ? group.members.length : 0,
//     role: group.role,
//   }));
// }

// Serviço para listar todos os grupos em que o usuário é dono ou membro
export async function getUserGroupsWithMembership(username: string) {
  // Encontrar o usuário pelo nome de usuário
  const user = await prisma.graphicAccount.findUnique({
    where: { userName: username },
  });
  if (!user) throw new Error("User not found");

  // Buscar os grupos onde o usuário é o dono
  const ownerGroups = await prisma.group.findMany({
    where: { ownerId: user.id },
    include: {
      members: {
        include: {
          groupMembers: true, // Inclui detalhes sobre cada membro
        },
      },
      messages: true, // Inclui mensagens do grupo
    },
  });

  // Buscar os grupos onde o usuário é membro
  const memberGroups = await prisma.groupMember.findMany({
    where: { graphicAccountId: user.id, inviteStatus: "ACCEPTED" },
    include: {
      group: {
        include: {
          members: {
            include: {
              groupMembers: true, // Detalhes dos membros
            },
          },
          messages: true, // Mensagens do grupo
        },
      },
    },
  });

  // Combinar os dois tipos de grupos (dono e membro)
  const allGroups = [
    ...ownerGroups.map((group) => ({
      ...group,
      role: "owner", // Define o papel do usuário como dono
    })),
    ...memberGroups.map((groupMember) => ({
      ...groupMember.group,
      role: "member", // Define o papel do usuário como membro
    })),
  ];

  // Mapear os dados para o formato necessário
  return allGroups.map((group) => ({
    id: group.id,
    name: group.name,
    description: group.description || null,
    memberCount: group.members.length, // Contagem de membros
    role: group.role,
    ownerId: group.ownerId,
    ownerUserName: group.ownerUserName || null,
    createdAt: group.created_at,
    updatedAt: group.updated_at,
    messages: group.messages, // Mensagens associadas ao grupo
  }));
}
