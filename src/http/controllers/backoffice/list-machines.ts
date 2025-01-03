import { prisma } from "@/lib/prisma";
import { UserCreditCardMachineCode } from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";

export async function listMachines(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  async function getUserCreditCardMachineCodesByUserId(
    userId: string,
  ): Promise<UserCreditCardMachineCode[]> {
    const machines = prisma.userCreditCardMachineCode.findMany();
    return reply.status(200).send(machines);
  }
}
