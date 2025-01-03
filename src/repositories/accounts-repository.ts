import { Account, Address, GraphicAccount, Prisma } from "@prisma/client";
import { IParams } from "./dtos/params-dto";

export interface AccountsRepository {
  create(data: Prisma.AccountUncheckedCreateInput): Promise<Account>;
  save(data: Account): Promise<Account>;
  findAll(params?: IParams): any;
  findByUserId(userId: string): Promise<Account | null>;
  findById(
    id: string,
    role?: string,
  ): Promise<Account | (GraphicAccount & { address: Address | null }) | null>;
  findByRefId(refId: string): Promise<Account | null>;
  update(
    id: string,
    data: Partial<Prisma.AccountUpdateInput>,
  ): Promise<Account>;
}
