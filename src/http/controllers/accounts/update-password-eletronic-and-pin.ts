import { FastifyReply, FastifyRequest } from "fastify";
import { AccountsUseCase } from "@/use-cases/accounts/update-password-eletronic-and-pin-use-case";

const accountsUseCase = new AccountsUseCase();

export const updatePinAndSecurityEletronic = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const { accountId, newPin, newSecurityEletronic } = request.body as {
    accountId: string;
    newPin: string;
    newSecurityEletronic: string;
  };

  try {
    await accountsUseCase.execute(accountId, newPin, newSecurityEletronic);
    reply.send({ success: true, message: "Update successful" });
  } catch (error) {
    reply.status(400).send({ success: false, message: error.message });
  }
};
