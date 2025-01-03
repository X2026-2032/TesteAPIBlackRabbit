import { prisma } from "@/lib/prisma";
import { GetUsersAccountToken } from "../get-users-account-token";
import { IdezAccounts } from "@/service/idez/accounts";
import { AppError } from "../errors/app-error";

export type IndividualsDocumentsRequest = {
  documentType: string;
  base64: string;
  id_master_user: string;
  activeMasterUser?: boolean;
};
export class RegisterIndividualsDocumentsUseCase {
  constructor() {
    //
  }

  async execute(data: IndividualsDocumentsRequest, userId: string) {
    const token = await GetUsersAccountToken.execute(userId);
    if (!token) throw new Error("Usuário inválido");

    const wallet = await prisma.graphicAccount.findFirst({
      where: { id_master_user: data.id_master_user },
    });
    const user = await prisma.user.findFirst({
      where: { OR: [{ id: userId }, { id: wallet?.id_master_user || "" }] },
    });

    if (!user) throw new AppError({ message: "Usuario não encontrado" });

    await new IdezAccounts().documents(
      {
        base64: data.base64,
        documentType: data.documentType,
      },
      user.document,
    );

    if (wallet && data.activeMasterUser) {
      await prisma.graphicAccount.update({
        where: { id: wallet.id },
        data: { status_master_user: true },
      });
      await prisma.user.update({
        where: { id: user.id },
        data: { status: "PENDING_ANALYSIS" },
      });
    }

    return user;
  }
}
