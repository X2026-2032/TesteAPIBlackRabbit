import { IDeviceRepository } from "@/repositories/device-repository";
import { AppError } from "../errors/app-error";

export interface UpdateDeviceUseCaseRequest {
  device_id: string;
  user_id: string;
  allowed: boolean;
}

export class UpdateDeviceUseCase {
  constructor(private deviceRepository: IDeviceRepository) {}
  async execute(input: UpdateDeviceUseCaseRequest) {
    const device = await this.deviceRepository.findById(input.device_id);

    if (!device) {
      throw new AppError({
        message: "Dispositivo não encontrado",
      });
    }

    if (
      device.user_id !== input.user_id &&
      device.graphic_id !== input.user_id
    ) {
      throw new AppError({
        message: "Device pertence a outro usuário",
      });
    }

    await this.deviceRepository.update(input.device_id, input.allowed);
  }
}
