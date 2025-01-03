import { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "@/use-cases/errors/app-error";
import { GetUsersAccountToken } from "@/use-cases/get-users-account-token";
import { IdezBankSlipsService } from "@/service/idez/bank-slips";

export async function getBankSlipPdfById(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { id } = request.params as any;

    const token = await GetUsersAccountToken.execute(request.user.sub);
    if (!token) throw new Error("Usuário inválido");

    const response = await new IdezBankSlipsService().getPdf(
      id,
      token.access_token,
    );
    reply.type("application/pdf");
    reply.send(response);
  } catch (error: any) {
    throw new AppError(error);
  }
}
