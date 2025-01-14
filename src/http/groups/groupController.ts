import * as groupService from "./groupService";
import { FastifyReply, FastifyRequest } from "fastify";


export async function createGroup( request: FastifyRequest, reply: FastifyReply) {
  const { name, description, ownerUsername } = request.body as { name: string; description: string; ownerUsername: string };
  try {
    const group = await groupService.createGroup(name, description, ownerUsername);
    reply.status(201).send(group);
  } catch (error) {
    reply.status(400).send({ error });
  }
}

export async function addUserToGroup( request: FastifyRequest, reply: FastifyReply) {
  const { groupId, username } = request.body as { groupId: string; username: string };
  try {
    const member = await groupService.addUserToGroup(groupId, username);
    reply.status(201).send(member);
  } catch (error) {
    reply.status(400).send({ error });
  }
}

export async function removeUserFromGroup(  request: FastifyRequest, reply: FastifyReply ) {
  const { groupId, username } = request.body as { groupId: string; username: string };
  try {
    await groupService.removeUserFromGroup(groupId, username);
    reply.status(200).send({ message: "User removed from group" });
  } catch (error) {
    reply.status(400).send({ error });
  }
}

export async function blockUserInGroup( request: FastifyRequest, reply: FastifyReply) {
  const { groupId, username } = request.body as { groupId: string; username: string };
  try {
    const blockedMember = await groupService.blockUserInGroup(groupId, username);
    reply.status(200).send(blockedMember);
  } catch (error) {
    reply.status(400).send({ error });
  }
}

export async function sendInvite(  request: FastifyRequest, reply: FastifyReply  ) {
  const { groupId, username } = request.body as { groupId: string; username: string };
  try {
    const invite = await groupService.sendInvite(groupId, username);
    reply.status(200).send(invite);
  } catch (error) {
    reply.status(400).send({ error });
  }
}


  
  // Listar grupos no GraphicAccount
  export async function listGroupsInGraphicAccount(  req: FastifyRequest, reply: FastifyReply  ) {
    const { graphicAccountId } = req.params as { graphicAccountId: string };
    try {
      const groups = await groupService.getGroupsInGraphicAccount(graphicAccountId);
      reply.status(200).send(groups);
    } catch (error) {
      reply.status(400).send({ error: error });
    }
  }

 

  export async function acceptInvite( request: FastifyRequest, reply: FastifyReply ) {
    const { groupId, username } = request.body as { groupId: string; username: string };
    try {
      await groupService.acceptInvite(groupId, username);
      reply.status(200).send({ message: "Invite accepted" });
    } catch (error) {
      reply.status(400).send({ error });
    }
  }
  
  export async function rejectInvite( request: FastifyRequest, reply: FastifyReply ) {
    const { groupId, username } = request.body as { groupId: string; username: string };
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