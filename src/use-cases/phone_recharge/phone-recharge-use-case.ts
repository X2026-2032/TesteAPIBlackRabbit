import {
  PhoneRechargeData,
  PhoneRechargeRepository,
} from "@/repositories/phone-recharge-repository";
import { UsersRepository } from "@/repositories/users-messenger-respository";
import { prisma } from "@/lib/prisma";
import { GetUsersAccountToken } from "../get-users-account-token";
import { IdezPhoneRechargesService } from "@/service/idez/phone-recharges";

interface PhoneRechargeUseCaseRequest {
  data: PhoneRechargeData;
  userId: string;
}

export class PhoneRechargeUseCase {
  constructor(
    private repository: PhoneRechargeRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute({ data, userId }: PhoneRechargeUseCaseRequest) {
    const token = await GetUsersAccountToken.execute(userId);
    if (!token) throw new Error("Usuário inválido");

    try {
      const { id: idezId, ...response } =
        await new IdezPhoneRechargesService().validate(
          data,
          token.access_token,
        );

      const build = {
        reference_id: idezId,
        status: response.status,
        area_code: data.area_code,
        account_id: token.account_id,
        phone_number: data.phone_number,
        dealer_code: response.dealer_code,
      };

      const { id } = await prisma.phoneRecharge.create({
        data: build,
      });

      return {
        id,
        ...build,
        ...response,
      };
    } catch (error) {
      throw error;
    }
  }
}
