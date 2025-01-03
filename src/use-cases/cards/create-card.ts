import { UsersRepository } from "@/repositories/users-respository";
import { AppError } from "../errors/app-error";
import { AccountsRepository } from "@/repositories/accounts-repository";
import { api, requestError } from "@/lib/axios";
import { CardsRepository } from "@/repositories/cards-repository";
import { CardType, Prisma } from "@prisma/client";

interface CreateCardUseCaseRequest {
  userId: string;
  data: {
    type: "virtual" | "physical";
    "#allow_ecommerce": boolean;
    "#allow_withdrawal": boolean;
    "#allow_intl_purchase": boolean;
    "#allow_mcc_control": boolean;
    "#allow_contactless": boolean;
    "#contactless_limit": number;
  };
}

export class CreateCardUseCase {
  constructor(
    private repository: CardsRepository,
    private usersRepository: UsersRepository,
    private accountsRepository: AccountsRepository,
  ) {}

  async execute({ userId, data }: CreateCardUseCaseRequest) {
    try {
      const user = await this.usersRepository.findById(userId);
      const account = await this.accountsRepository.findByUserId(
        user?.id || "",
      );
      if (!user || !account) {
        throw new AppError({
          status: 400,
          code: "account.notfound",
          message: "Conta não encontrada.",
        });
      }

      const token = user?.access_token;
      const { data: createCardIdez } = await api.post(`/cards`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const cardToPayload = this.makeCardToPersist({
        ...createCardIdez,
        account_id: account.id,
      });
      return this.repository.create(cardToPayload);
    } catch (error: any) {
      if (error?.response?.data) {
        throw new AppError(requestError(error?.response.data));
      }
      throw new Error("Falha ao tentar bloquear o cartão.");
    }
  }

  private makeCardToPersist(data: any): Prisma.CardCreateInput {
    return {
      account: { connect: { id: data.account_id } },
      reference_id: data.account_id,
      tracking_code: data.tracking_code,
      type: getCardTypeFor(data.type),
      status: data.status,
      holder: data.holder,
      issuer: data.issuer,
      number: data.number,
      is_noname: data.is_noname,
      sub_status: data.sub_status,
      expiration_date: data.expiration_date,
      estimated_delivery_date: data.estimated_delivery_date,
      issued_at: data.issued_at,
      printed_at: data.printed_at,
      expedited_at: data.expedited_at,
      delivered_at: data.delivered_at,
      limit_amount: data.limit_amount,
      limit_expires_at: data.limit_expires_at,
      limit_balance: data.limit_balance,
      bucket_id: data.bucket_id,
      tracking_url: data.tracking_url,
    };

    function getCardTypeFor(aType: "virtual" | "physical") {
      const types = {
        virtual: CardType.VIRTUAL,
        physical: CardType.PHYSICAL,
      };

      return types[aType];
    }
  }
}
