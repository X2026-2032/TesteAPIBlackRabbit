import { api, requestError } from "@/lib/axios";
import { BankSlipRepository } from "@/repositories/bank-slip-repository";
import { AppError } from "../errors/app-error";
import { UsersRepository } from "@/repositories/users-respository";
import fs from "fs/promises";
import { prisma } from "@/lib/prisma";
import { createWriteStream } from "node:fs";

interface GetBankSlipPdfByIdUseCaseRequest {
  id: string;
  userId: string;
}

export class GetBankSlipPdfByIdUseCase {
  constructor(
    private bankSlipRepository: BankSlipRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute(props: GetBankSlipPdfByIdUseCaseRequest): Promise<any> {
    try {
      const user = await this.usersRepository.findById(props.userId);
      let token = user?.access_token;

      const graphic = await prisma.graphicAccount.findUnique({
        where: {
          id: props.userId,
        },
        include: {
          user: true,
        },
      });
      if (graphic) {
        token = graphic.user.access_token;
      }
      return token;
    } catch (error: any) {
      console.log(error);
      if (error?.response.data) {
        throw new AppError(requestError(error?.response.data));
      }
      throw new Error("Falha ao buscar o pdf do boleto pelo id!");
    }
  }
}
