import { updateAccountGraphicStatusTransactionUseCase } from "@/use-cases/graphic_accounts/update-status-graphic-transaction";
import { FastifyReply, FastifyRequest } from "fastify";

const updateAccountStatus = async (
  request: FastifyRequest<{
    Params: { id: string };
    Body: { status_pin_eletronic: boolean };
  }>,
  reply: FastifyReply,
) => {
  const accountId = request.params.id;
  const { status_pin_eletronic } = request.body;

  try {
    await updateAccountGraphicStatusTransactionUseCase({
      accountId,
      newStatus: status_pin_eletronic,
    });

    reply.status(200).send({ success: true });
  } catch (error) {
    reply.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

export { updateAccountStatus };
