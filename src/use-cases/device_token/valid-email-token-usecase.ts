import { AppError } from "../errors/app-error";
import { IDeviceTokenRepository } from "@/repositories/device-token-repository";

export class ValidEmailTokenUseCase {
  constructor(private deviceTokenRepository: IDeviceTokenRepository) {}
  async execute(token: string, user_id: string) {
    const emailToken = await this.deviceTokenRepository.findByUserId(user_id);

    if (!emailToken) {
      throw new AppError({
        message: "Token não encontrado",
      });
    }

    if (emailToken.attempts >= 3) {
      await this.deviceTokenRepository.delete(emailToken.id);
      throw new AppError({
        message: "Limite de tentativas atingido",
      });
    }

    if (emailToken.token !== token) {
      await this.deviceTokenRepository.updateAttempts(
        emailToken.id,
        emailToken.attempts + 1,
      );
      throw new AppError({
        message: "Token inválido",
      });
    }

    if (emailToken.token === token) {
      await this.deviceTokenRepository.updateValid(emailToken.id, true);
    }
  }
}
