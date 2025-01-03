import { AppError } from "../errors/app-error";
import { requestError } from "@/lib/axios";
import { prisma } from "@/lib/prisma";

interface FetchByIdUseCaseRequest {
  document: string;
}

export class FetchByDocument {
  async execute(params: FetchByIdUseCaseRequest) {
    try {
      let user = [] as any;
      let account = [] as any;

      user = await prisma.graphicAccount.findUnique({
        where: {
          document: params.document,
        },
        include: {
          account: true,
        },
      });
      account = user?.account;

      if (!user) {
        user = await prisma.user.findUnique({
          where: {
            document: params.document,
          },
          include: {
            Account: true,
          },
        });
        account = user?.Account;
      }

      const raw = {
        id: user.id,
        name: user.name,
        document: user.document,
        account: account || null,
      };

      return { user: raw };
    } catch (err) {
      throw new AppError(requestError(err));
    }
  }
}
