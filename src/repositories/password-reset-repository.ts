import { PasswordReset, Prisma } from "@prisma/client";

export interface PasswordResetRepository {
  sendResetCode(email: string): unknown;
  create(data: Prisma.PasswordResetCreateInput): Promise<PasswordReset>;
}

export interface ResetPasswordRequest {
  email: string;
  type: "MEMBER" | "GRAPHIC";
}
