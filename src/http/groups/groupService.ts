import { prisma } from "@/lib/prisma";



// Criar Grupo
export async function createGroup(
  name: string,
  description: string,
  ownerUsername: string
) {
  const owner = await prisma.graphicAccount.findUnique({
    where: { userName: ownerUsername },
  });
  if (!owner) throw new Error("Owner not found");

  return prisma.group.create({
    data: {
      name,
      description,
      ownerId: owner.id,
      ownerUserName: owner.userName,
    },
  });
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
    return groups.map((group: { id: any; name: any; description: any; members: string | any[]; }) => ({
      id: group.id,
      name: group.name,
      description: group.description || null,
      memberCount: group.members ? group.members.length : 0, // Contagem de membros
    }));
  } catch (error) {
    console.error("Erro ao obter grupos:", error);
    throw new Error("Erro ao obter grupos");
  }
}

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
      if (existingInvite.inviteStatus === 'ACCEPTED') {
          throw new Error("User already a member of the group");
      }
      throw new Error("Invite already sent or rejected");
  }

  return prisma.groupMember.create({
      data: {
          groupId,
          graphicAccountId: user.id,
          inviteStatus: 'PENDING',
      },
  });
}


    // Aceitar Convite
export async function acceptInvite(groupId: string, username: string) {
    const user = await prisma.graphicAccount.findUnique({
      where: { userName: username },
    });
    if (!user) throw new Error("User not found");
  
    const invite = await prisma.groupMember.findFirst({
      where: { groupId, graphicAccountId: user.id, inviteStatus: 'PENDING' },
    });
  
    if (!invite) throw new Error("No pending invite found");
  
    return prisma.groupMember.update({
      where: { id: invite.id },
      data: { inviteStatus: 'ACCEPTED' },
    });
  }
  
  // Recusar Convite
  export async function rejectInvite(groupId: string, username: string) {
    const user = await prisma.graphicAccount.findUnique({
      where: { userName: username },
    });
    if (!user) throw new Error("User not found");
  
    const invite = await prisma.groupMember.findFirst({
      where: { groupId, graphicAccountId: user.id, inviteStatus: 'PENDING' },
    });
  
    if (!invite) throw new Error("No pending invite found");
  
    return prisma.groupMember.update({
      where: { id: invite.id },
      data: { inviteStatus: 'REJECTED' },
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
export async function editGroupByName(groupName: string, newName?: string, newDescription?: string) {
  try {
    const group = await prisma.group.findFirst({ where: { name: groupName } });
    if (!group) throw new Error("Group not found");

    // Preparando os dados para a atualização
    const updateData: any = {};

    if (newName) updateData.name = newName;  // Atualiza o nome se for passado
    if (newDescription) updateData.description = newDescription;  // Atualiza a descrição se for passado

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

    return groupInvites.map(invite => ({
      id: invite.id,
      groupId: invite.groupId,
      groupName: invite.group.name,
      sender: invite.group.ownerUserName || null,
      receiverId: invite.graphicAccountId,
      status: invite.inviteStatus,
      created_at: invite.created_at,
    }));
  } catch (error) {
    console.error('Erro ao listar convites de grupos:', error);
    throw new Error('Erro ao listar convites de grupos');
  }
}