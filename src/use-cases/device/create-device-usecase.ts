import { AppError } from "../errors/app-error";
import { IDeviceRepository } from "@/repositories/device-repository";
import { GetDevicesByUserIdUseCase } from "../device_token/get-devices-by-user-id-usecase";
import { DeviceTokenRepository } from "@/repositories/prisma/prisma-device-token-repository";
import CryptoJS from "crypto-js";
import { prisma } from "@/lib/prisma";

export type Device = {
  os: string;
  browser: string;
};

export interface CreateDeviceUseCaseRequest {
  userId: string;
  device: Device;
  pin: string;
}

export class CreateDeviceUseCase {
  constructor(private deviceRepository: IDeviceRepository) {}

  async execute(params: CreateDeviceUseCaseRequest) {
    const [graphicAccount, account] = await Promise.all([
      prisma.graphicAccount.findFirst({
        where: {
          id: params.userId,
        },
      }),
      prisma.account.findFirst({
        where: {
          id: params.userId,
        },
      }),
    ]);

    const devices = await this.deviceRepository.findByUserId(params.userId);

    const devicesValid = devices?.filter(
      (device) => device.isDeleted === false,
    );

    if (devicesValid && devicesValid?.length >= 3) {
      throw new AppError({
        message: "Limite de dispositivos atingido",
      });
    }

    const key = CryptoJS.enc.Utf8.parse(process.env.JWT_SECRET as string);
    const iv = CryptoJS.enc.Utf8.parse(process.env.IV_KEY as string);

    const deviceHash = CryptoJS.AES.encrypt(
      JSON.stringify(params.device),
      key,
      {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      },
    );

    const deviceExists = devices?.find(
      (device) => device.device === deviceHash.toString(),
    );

    if (deviceExists) {
      throw new AppError({
        message: "Dispositivo ja cadastrado",
      });
    }

    const getDeviceByUserId = new GetDevicesByUserIdUseCase(
      new DeviceTokenRepository(),
    );

    const deviceAllowed = await getDeviceByUserId.execute(
      params.userId,
      deviceHash.toString(),
    );

    if (!deviceAllowed) {
      throw new AppError({
        message: "Dispositivo não permitido",
      });
    }

    if (
      deviceAllowed.device !== deviceHash.toString() ||
      deviceAllowed.valid === false
    ) {
      throw new AppError({
        message: "Dispositivo invalido",
      });
    }

    if (account) {
      if (account?.pin !== params.pin) {
        throw new AppError({
          message: "Pin incorreto",
        });
      }

      await this.deviceRepository.create({
        user_id: params.userId,
        device: deviceHash.toString(),
      });

      return;
    }

    if (graphicAccount) {
      console.log("chegou aqui");
      if (graphicAccount?.pin !== params.pin) {
        throw new AppError({
          message: "Pin incorreto",
        });
      }

      await this.deviceRepository.create({
        graphic_id: params.userId,
        device: deviceHash.toString(),
      });

      return;
    }
  }
}
