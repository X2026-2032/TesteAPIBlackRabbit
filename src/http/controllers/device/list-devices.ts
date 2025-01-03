import { getIdUser } from "@/http/middlewares/verify-device";
import { DeviceRepository } from "@/repositories/prisma/prisma-device-repository";
import { ListDevicesUseCase } from "@/use-cases/device/list-devices-usecase";
import { AppError } from "@/use-cases/errors/app-error";
import { FastifyRequest, FastifyReply } from "fastify";

export async function ListDevicesController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const user_id = await getIdUser(request);

    const listDevicesUseCase = new ListDevicesUseCase(new DeviceRepository());

    const devices = await listDevicesUseCase.execute(user_id);

    reply.status(200).send(devices);
  } catch (error: any) {
    throw new AppError(error);
  }
}
