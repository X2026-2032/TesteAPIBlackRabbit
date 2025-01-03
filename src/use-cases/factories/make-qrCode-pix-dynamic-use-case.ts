import { PrismaUsersRepository } from "@/repositories/prisma/prisma-users-repository";
import { PixQrCodeDynamicUseCase } from "../pix/create-pix-qr-code-dynamic-use-case";

export function makeQrCodePixDynamicUseCase() {
  return new PixQrCodeDynamicUseCase(new PrismaUsersRepository());
}
