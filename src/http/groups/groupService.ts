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
export async function getGroupsInGraphicAccount(graphicAccountId: string) {
  return prisma.groupMember.findMany({
    where: { graphicAccountId },
    include: { group: true },
  });
}

// Enviar Convite
export async function sendInvite(groupId: string, username: string) {
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