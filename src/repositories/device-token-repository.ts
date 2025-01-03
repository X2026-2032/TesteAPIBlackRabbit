import { DeviceToken } from "@prisma/client";

export type CreateDeviceTokenParams = {
  graphic_id?: string;
  user_id?: string;
  token: string;
  device: string;
  valid: boolean;
};

export interface IDeviceTokenRepository {
  create(params: CreateDeviceTokenParams): Promise<void>;
  findByUserId(id: string): Promise<DeviceToken | null>;
  fingByUserIdAndDevice(
    user_id: string,
    device: string,
  ): Promise<DeviceToken | null>;
  updateValid(id: string, valid: boolean): Promise<void>;
  updateAttempts(id: string, attempts: number): Promise<void>;
  delete(id: string): Promise<void>;
}
