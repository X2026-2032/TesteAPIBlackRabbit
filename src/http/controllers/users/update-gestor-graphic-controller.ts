import { updateAccountGestorStatusTransactionUseCase } from "@/use-cases/update-gestor-graphic-status-use-case";
import { FastifyRequest, FastifyReply } from "fastify";

interface Params {
  id: string;
}
const updateGestorStatus = async (
  request: FastifyRequest<{ Params: Params }>,
  reply: FastifyReply,
) => {
  try {
    const accountId = request.params.id;
    const { gestor_graphic } = request.body as { gestor_graphic: boolean };

    if (!accountId || typeof gestor_graphic !== "boolean") {
      return reply
        .status(400)
        .send({ success: false, error: "Invalid request parameters" });
    }

    console.log(
      `Received request to update account status for account ID: ${accountId} to new status: ${gestor_graphic}`,
    );

    await updateAccountGestorStatusTransactionUseCase({
      accountId,
      newStatus: gestor_graphic,
    });

    console.log("Account status updated successfully");
    reply.status(200).send({ success: true });
  } catch (error: any) {
    console.error("Error updating account status:", error);
    reply.status(500).send({
      success: false,
      error: error.message || "Internal Server Error",
    });
  }
};

export { updateGestorStatus };
