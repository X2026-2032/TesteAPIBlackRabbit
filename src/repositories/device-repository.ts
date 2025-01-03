import { UserDevice } from "@prisma/client";

export type CreateDeviceParams = {
  user_id?: string;
  graphic_id?: string;
  device: string;
};

export interface IDeviceRepository {
  create(user_id: CreateDeviceParams): Promise<void>;
  findByUserId(id: string): Promise<UserDevice[] | undefined>;
  findById(id: string): Promise<UserDevice | null>;
  update(device_id: string, permission: boolean): Promise<UserDevice>;
  delete(device_id: string): Promise<void>;
}
