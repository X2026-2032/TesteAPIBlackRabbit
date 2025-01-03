import { updateAccount } from "@/use-cases/update-account-use-case";
import { FastifyRequest, FastifyReply } from "fastify";

// Defina um tipo para os parâmetros da requisição
interface UpdateAccountParams {
  userId: string;
}

async function updateAccountController(
  request: FastifyRequest<{ Params: UpdateAccountParams }>,
  reply: FastifyReply,
): Promise<void> {
  try {
    const userId = request.params.userId;
    const accountData = request.body;

    // Chame a função updateAccount passando os parâmetros necessários
    const updatedAccount = await updateAccount(userId, accountData);

    // Responda com os dados atualizados da conta
    reply.send(updatedAccount);
  } catch (error) {
    // Trate os erros e envie uma resposta de erro adequada
    reply.status(500).send({ error: "Internal Server Error" });
  }
}

export { updateAccountController };
