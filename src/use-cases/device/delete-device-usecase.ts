import { prisma } from "@/lib/prisma";
import { AppError } from "../errors/app-error";
import { IDeviceRepository } from "@/repositories/device-repository";

export interface DeleteDeviceUseCaseRequest {
  id: string;
  user_id: string;
  pin: string;
}

export class DeleteDeviceUseCase {
  constructor(private deviceRepository: IDeviceRepository) {}

  async execute(params: DeleteDeviceUseCaseRequest) {
    const devices = await this.deviceRepository.findByUserId(params.user_id);

    if (!devices) {
      throw new AppError({
        message: "Nenhum dispositivo cadastrado para esse usuário",
      });
    }

    const searchDevice = devices.find((device) => device.id === params.id);

    if (!searchDevice) {
      throw new AppError({
        message: "Dispositivo não encontrado",
      });
    }

    if (searchDevice.user_id && searchDevice.user_id !== params.user_id) {
      throw new AppError({
        message: "Device pertence a outro usuário",
      });
    }

    if (searchDevice.graphic_id && searchDevice.graphic_id !== params.user_id) {
      throw new AppError({
        message: "Device pertence a outro hete",
      });
    }

    const account = await prisma.graphicAccount.findFirst({
      where: {
        id: params.user_id,
      },
    });

    if (account?.pin !== params.pin) {
      throw new AppError({
        message: "Pin incorreto",
      });
    }

    await this.deviceRepository.delete(params.id);
  }
}
