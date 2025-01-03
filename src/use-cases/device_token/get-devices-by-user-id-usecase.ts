import { IDeviceTokenRepository } from "@/repositories/device-token-repository";

export class GetDevicesByUserIdUseCase {
  constructor(private deviceTokenRepository: IDeviceTokenRepository) {}

  async execute(user_id: string, device: string) {
    const devices = await this.deviceTokenRepository.fingByUserIdAndDevice(
      user_id,
      device,
    );

    if (!devices) {
      return null;
    }

    return devices;
  }
}
