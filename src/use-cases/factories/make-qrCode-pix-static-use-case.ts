import { PrismaUsersRepository } from "@/repositories/prisma/prisma-users-repository";
import { PixQrCodeStaticUseCase } from "../pix/create-pix-qr-code-statics-use-case";

export function makeQrCodePixStaticUseCase() {
  return new PixQrCodeStaticUseCase(new PrismaUsersRepository());
}
