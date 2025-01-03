import { Prisma, BankTransfer } from "@prisma/client";
import { IParams } from "./dtos/params-dto";

export interface BankTransfersRepository {
  create(data: Prisma.BankTransferUncheckedCreateInput): Promise<BankTransfer>;
  findAll(params?: IParams): any;
  findById(id: string): Promise<BankTransfer | null>;
  getByAccountId(id: string): Promise<BankTransfer[]>;
}
