import { PrismaClient, PhoneRecharge, DealerCode } from "@prisma/client";
import {
  PhoneRechargeRepository,
  PhoneRechargeData,
  FinishRechargeData,
} from "../phone-recharge-repository";

export class PrismaPhoneRechargeRepository implements PhoneRechargeRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async findById(id: string): Promise<PhoneRecharge | null> {
    try {
      const result = await this.prisma.phoneRecharge.findFirst({
        where: { id },
      });

      return result;
    } catch (error) {
      console.log(error);
      throw new Error("Falha ao atualizar o status da recarga!");
    }
  }

  async updateRechargeStatus(data: FinishRechargeData): Promise<PhoneRecharge> {
    try {
      const updatedRecharge = await this.prisma.phoneRecharge.update({
        where: { id: data.rechargeId },
        data,
      });

      return updatedRecharge;
    } catch (error) {
      console.log(error);
      throw new Error("Falha ao atualizar o status da recarga!");
    }
  }

  async createPhoneRecharge(data: PhoneRechargeData): Promise<PhoneRecharge> {
    try {
      const phoneRecharge = await this.prisma.phoneRecharge.create({
        data,
      });

      return phoneRecharge;
    } catch (error) {
      console.log(error);
      throw new Error("Falha ao criar a recarga do telefone!");
    }
  }
}
