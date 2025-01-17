import { api } from "@/lib/axios";
import { UsersRepository } from "@/repositories/users-messenger-respository";
import { AppError } from "./errors/app-error";
import { env } from "@/env";

interface ValidatePixDecodeUseCaseRequest {
  content: string;
}

export class ValidatePixDecodeUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({ content }: ValidatePixDecodeUseCaseRequest) {
    const qrCode = await api.post(
      "/banking/cashout/pix/brcodes/check",
      {
        entity_id: process.env.ENTITY_ID as string,
        hash: content,
      },
      {
        auth: {
          username: process.env.AUTH_USERNAME || "",
          password: process.env.AUTH_PASSWORD || "",
        },
      },
    );

    if (
      qrCode.data.data.counterparty.company_id === env.COMPANY_ID &&
      env.NODE_ENV !== "dev"
    ) {
      throw new AppError({ message: "Pagamento inválido" });
    }

    const bankInfo = await api.get(`/banking/institutions`, {
      params: {
        ispb: qrCode.data.data.counterparty.bank_account.bank_ispb,
      },
      auth: {
        username: process.env.AUTH_USERNAME || "",
        password: process.env.AUTH_PASSWORD || "",
      },
    });

    return { qrCode: qrCode.data, bank: bankInfo.data };
  }
}
