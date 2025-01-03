import { PasswordReset, Prisma, PrismaClient } from "@prisma/client";
import { PasswordResetRepository } from "../password-reset-repository";

export class PrismaPasswordResetRepository implements PasswordResetRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }
  sendResetCode(email: string): unknown {
    throw new Error("Method not implemented.");
  }

  async create(data: Prisma.PasswordResetCreateInput): Promise<PasswordReset> {
    return await this.prisma.passwordReset.create({ data });
  }
}
