import { getIdUser } from "@/http/middlewares/verify-device";
import { DeviceRepository } from "@/repositories/prisma/prisma-device-repository";
import { UpdateDeviceUseCase } from "@/use-cases/device/update-device-usecase";
import { AppError } from "@/use-cases/errors/app-error";
import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";

export async function UpdateDeviceController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const querySchema = z.object({
      device_id: z.string(),
      allowed: z.boolean(),
    });

    const { device_id, allowed } = querySchema.parse(request.body);

    const user_id = await getIdUser(request);

    const updateDeviceUseCase = new UpdateDeviceUseCase(new DeviceRepository());

    await updateDeviceUseCase.execute({
      user_id,
      device_id,
      allowed,
    });

    reply.status(204);
  } catch (error: any) {
    throw new AppError(error);
  }
}
