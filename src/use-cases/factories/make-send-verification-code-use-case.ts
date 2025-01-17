import { PrismaUsersRepository } from "@/repositories/prisma/prisma-users-messenger-repository";
import { SendVerificationCodeUseCase } from "../send-verification-code";

export function makeSendVerificationCodeUseCase() {
  const usersRepository = new PrismaUsersRepository();

  const sendVerificationCodeUseCase = new SendVerificationCodeUseCase(
    usersRepository,
  );

  return sendVerificationCodeUseCase;
}
