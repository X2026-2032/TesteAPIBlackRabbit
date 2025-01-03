import { updateAccountBlockedPasswordStatusTransactionUseCase } from "@/use-cases/update-blocked-password-status-use-case";
import { FastifyReply, FastifyRequest } from "fastify";

interface Params {
  id: string;
}
const updateBlockedStatus = async (
  request: FastifyRequest<{ Params: Params }>,
  reply: FastifyReply,
) => {
  try {
    const accountId = request.params.id;
    const { blocked } = request.body as { blocked: boolean };

    if (!accountId || typeof blocked !== "boolean") {
      return reply
        .status(400)
        .send({ success: false, error: "Invalid request parameters" });
    }

    await updateAccountBlockedPasswordStatusTransactionUseCase({
      accountId,
      newStatusBlocked: blocked,
    });

    reply.status(200).send({ success: true });
  } catch (error: any) {
    console.error("Error updating account status:", error);
    reply.status(500).send({
      success: false,
      error: error.message || "Internal Server Error",
    });
  }
};

export { updateBlockedStatus };
