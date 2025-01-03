import { IDeviceRepository } from "@/repositories/device-repository";
import CryptoJS from "crypto-js";

export class ListDevicesUseCase {
  constructor(private deviceRepository: IDeviceRepository) {}

  async execute(user_id: string) {
    const devices = await this.deviceRepository.findByUserId(user_id);

    const device = devices
      ?.filter((device) => !device.isDeleted)
      .map((device) => {
        const key = CryptoJS.enc.Utf8.parse(process.env.JWT_SECRET as string);
        const iv = CryptoJS.enc.Utf8.parse(process.env.IV_KEY as string);

        const deviceHash = CryptoJS.AES.decrypt(device.device, key, {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7,
        });

        device.device = JSON.parse(deviceHash.toString(CryptoJS.enc.Utf8));

        return device;
      });

    if (!device) {
      return [];
    }

    return device;
  }
}
