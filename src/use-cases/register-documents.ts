import { UsersRepository } from "@/repositories/users-messenger-respository";
import fs from "node:fs/promises";
import { createReadStream } from "fs";
import { MultipartFile } from "@fastify/multipart";
import { randomUUID } from "crypto";
import FormData from "form-data";
import { AccountsRepository } from "@/repositories/accounts-repository";
import { prisma } from "@/lib/prisma";
import { GetUsersAccountToken } from "./get-users-account-token";
import { IdezDocumentsService } from "@/service/idez/documents";

interface CreateBankTransferUseCaseRequest {
  userId: string;
  file: MultipartFile;
  type: string;
}

export class RegisterDocumentsUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private accountsRepository: AccountsRepository,
  ) {}

  async execute({ userId, file, type }: CreateBankTransferUseCaseRequest) {
    if (!file) throw new Error("Arquivo não encontrado");

    const path = `./uploads/${randomUUID()}-${file.filename}`;

    await fs.writeFile(path, file.file);

    try {
      const token = await GetUsersAccountToken.execute(userId);
      if (!token) throw new Error("Token de acesso não encontrado");

      const user = await this.usersRepository.findById(userId);
      if (!user) throw new Error("Usuário não encontrado");

      const fileStream = createReadStream(path);

      const form = new FormData();
      form.append("file", fileStream);
      form.append("type", type);

      if (user?.type === "COMPANIE") {
        const partner = await prisma.partner.findFirst({
          where: {
            user_id: user.id,
          },
          select: {
            partnerId: true,
          },
        });

        if (partner) {
          form.append("meta[partner_id]", partner.partnerId);
        }
      }

      const response = await new IdezDocumentsService().execute(
        form,
        user.api_key as string,
      );

      await prisma.account.update({
        where: {
          id: token.account_id,
        },
        data: {
          status: response.status,
        },
      });

      await fs.unlink(path);

      return {
        ...response,
        id: user?.id,
        name: user?.name,
        email: user?.email,
        password: undefined,
      };
    } catch (err) {
      console.error("Ocorreu um erro durante a execução do caso de uso:", err);
      await fs.unlink(path);
      throw err;
    }
  }
}
