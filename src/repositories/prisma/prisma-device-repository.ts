import { prisma } from "@/lib/prisma";
import { IDeviceRepository, CreateDeviceParams } from "../device-repository";
import { UserDevice } from "@prisma/client";

export class DeviceRepository implements IDeviceRepository {
  async create(data: CreateDeviceParams): Promise<void> {
    await prisma.userDevice.create({
      data: {
        ...data,
        allowed: true,
      },
    });
  }

  async findByUserId(id: string): Promise<UserDevice[] | undefined> {
    return await prisma.userDevice.findMany({
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

  async findById(id: string): Promise<UserDevice | null> {
    return await prisma.userDevice.findUnique({
      where: {
        id,
      },
    });
  }

  async update(device_id: string, permission: boolean): Promise<UserDevice> {
    return await prisma.userDevice.update({
      where: {
        id: device_id,
      },
      data: {
        allowed: permission,
      },
    });
  }

  async delete(device_id: string): Promise<void> {
    await prisma.userDevice.update({
      where: {
        id: device_id,
      },
      data: {
        isDeleted: true,
      },
    });
  }
}
