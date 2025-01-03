import { DealerCode, PhoneRecharge } from "@prisma/client";

export interface PhoneRechargeData {
  account_id?: string;
  dealer_code: DealerCode | string;
  area_code: string;
  phone_number: string;
  id?: string;
}

export interface FinishRechargeData {
  amount: number;
  pin?: string;
  rechargeId: string;
  status: string;
}

export interface PhoneRechargeRepository {
  createPhoneRecharge(data: PhoneRechargeData): Promise<PhoneRecharge>;
  updateRechargeStatus(data: FinishRechargeData): Promise<PhoneRecharge>;
  findById(id: string): Promise<PhoneRecharge | null>;
}
