import { DeviceToken } from "@prisma/client";
import {
  CreateDeviceTokenParams,
  IDeviceTokenRepository,
} from "../device-token-repository";
import { prisma } from "@/lib/prisma";

export class DeviceTokenRepository implements IDeviceTokenRepository {
  async create(data: CreateDeviceTokenParams): Promise<void> {
    await prisma.deviceToken.create({
      data,
    });
  }

  async findByUserId(id: string): Promise<DeviceToken | null> {
    return await prisma.deviceToken.findFirst({
      where: {
        OR: [
          {
            user_id: id,
          },
          {
            graphic_id: id,
          },
        ],
      },
    });
  }

  async fingByUserIdAndDevice(
    user_id: string,
    device: string,
  ): Promise<DeviceToken | null> {
    return await prisma.deviceToken.findFirst({
      where: {
        OR: [
          {
            user_id: user_id,
          },
          {
            graphic_id: user_id,
          },
        ],
        device,
      },
    });
  }

  async updateValid(id: string, valid: boolean): Promise<void> {
    await prisma.deviceToken.update({
      where: {
        id,
      },
      data: {
        valid,
      },
    });
  }

  async updateAttempts(id: string, attempts: number): Promise<void> {
    await prisma.deviceToken.update({
      where: {
        id,
      },
      data: {
        attempts,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.deviceToken.delete({
      where: {
        id,
      },
    });
  }
}
