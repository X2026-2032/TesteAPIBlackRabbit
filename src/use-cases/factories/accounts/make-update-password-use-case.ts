// app/factories/password-reset-use-case-factory.ts
import { UpdatePasswordUseCase } from "@/use-cases/update-password";

export function makeUpdatePasswordUseCase() {
  return new UpdatePasswordUseCase();
}
