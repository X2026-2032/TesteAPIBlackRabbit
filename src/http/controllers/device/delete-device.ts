import { getIdUser } from "@/http/middlewares/verify-device";
import { DeviceRepository } from "@/repositories/prisma/prisma-device-repository";
import { DeleteDeviceUseCase } from "@/use-cases/device/delete-device-usecase";
import { AppError } from "@/use-cases/errors/app-error";
import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";

export async function DeleteDeviceController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const querySchema = z.object({
      id: z.string(),
      pin: z.string(),
    });

    const { id, pin } = querySchema.parse(request.body);

    const user_id = await getIdUser(request);

    const deleteDeviceUseCase = new DeleteDeviceUseCase(new DeviceRepository());

    await deleteDeviceUseCase.execute({
      user_id,
      id,
      pin,
    });

    reply.status(204);
  } catch (error: any) {
    throw new AppError(error);
  }
}
