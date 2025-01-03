// app/factories/password-reset-use-case-factory.ts

import { PasswordResetRepository } from "@/repositories/password-reset-repository";
import { PrismaPasswordResetRepository } from "@/repositories/prisma/prisma-password-reset-repository";
import { ResetPasswordCodeUseCase } from "@/use-cases/reset-password-code";

export function createPasswordResetUseCase(): ResetPasswordCodeUseCase {
  const repository: PasswordResetRepository =
    new PrismaPasswordResetRepository();
  return new ResetPasswordCodeUseCase(repository);
}
