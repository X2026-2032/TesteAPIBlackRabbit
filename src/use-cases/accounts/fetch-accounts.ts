import { prisma } from "@/lib/prisma";
import { AccountsRepository } from "@/repositories/accounts-repository";

export type FetchAccountsQueryParams = {
  page: string;
  per_page: string;
  role: string;
};

export class FetchAccountsUseCase {
  constructor(private repository: AccountsRepository) {}

  async execute(params: FetchAccountsQueryParams) {
    const { role, page, per_page } = params;

    const skip = (parseInt(page) - 1) * parseInt(per_page);
    const take = parseInt(per_page);

    if (role == "ALL") {
      const accounts = await prisma.account.findMany({
        where: {
          user: {
            OR: [
              { role: "MEMBER" },
              { role: "ADMIN" },
              { role: "MASTER" },
              { role: "ADMIN_BAG" },
            ],
          },
        },
        include: {
          user: true,
        },
        orderBy: {
          created_at: "desc",
        },
        skip: skip == 0 ? undefined : skip,
        take,
      });

      const all = await prisma.account.findMany({
        where: {
          user: {
            OR: [
              { role: "MEMBER" },
              { role: "ADMIN" },
              { role: "MASTER" },
              { role: "ADMIN_BAG" },
            ],
          },
        },
      });

      return {
        accounts: {
          total: all.length,
          data: accounts,
          page: +params.page!,
          current_page: per_page,
        },
      };
    }
    if (role == "MEMBER") {
      const accounts = await prisma.account.findMany({
        where: {
          user: {
            role: "MEMBER",
          },
        },
        include: {
          user: true,
        },
        orderBy: {
          created_at: "desc",
        },
        skip: skip == 0 ? undefined : skip,
        take,
      });

      const all = await prisma.account.findMany({
        where: {
          user: {
            role: "MEMBER",
          },
        },
      });

      return {
        accounts: {
          total: all.length,
          data: accounts,
          page: +params.page!,
          current_page: per_page,
        },
      };
    }
    if (role == "ADMIN") {
      const accounts = await prisma.account.findMany({
        where: {
          user: {
            role: "ADMIN",
          },
        },
        include: {
          user: true,
        },
        orderBy: {
          created_at: "desc",
        },
        skip: skip == 0 ? undefined : skip,
        take,
      });

      const all = await prisma.account.findMany({
        where: {
          user: {
            role: "ADMIN",
          },
        },
      });

      return {
        accounts: {
          total: all.length,
          data: accounts,
          page: +params.page!,
          current_page: per_page,
        },
      };
    }
    if (role == "MASTER") {
      const accounts = await prisma.account.findMany({
        where: {
          user: {
            role: "MASTER",
          },
        },
        include: {
          user: true,
        },
        orderBy: {
          created_at: "desc",
        },
        skip: skip == 0 ? undefined : skip,
        take,
      });

      const all = await prisma.account.findMany({
        where: {
          user: {
            role: "MASTER",
          },
        },
      });

      return {
        accounts: {
          total: all.length,
          data: accounts,
          page: +params.page!,
          current_page: per_page,
        },
      };
    }
    if (role == "GRAPHIC") {
      const accounts = await prisma.graphicAccount.findMany({
        where: {
          role: "GRAPHIC",
        },
        include: {
          user: true,
        },
        orderBy: {
          created_at: "desc",
        },
        skip: skip == 0 ? undefined : skip,
        take,
      });
      const all = await prisma.graphicAccount.findMany({
        where: {
          role: "GRAPHIC",
        },
      });

      return {
        accounts: {
          total: all.length,
          data: accounts,
          page: +params.page!,
          current_page: per_page,
        },
      };
    }
    if (role == "WALLET") {
      const accounts = await prisma.graphicAccount.findMany({
        where: {
          role: "WALLET",
        },
        include: {
          user: true,
        },
        orderBy: {
          created_at: "desc",
        },
        skip: skip == 0 ? undefined : skip,
        take,
      });

      const all = await prisma.graphicAccount.findMany({
        where: {
          role: "WALLET",
        },
      });

      return {
        accounts: {
          total: all.length,
          data: accounts,
          page: +params.page!,
          current_page: per_page,
        },
      };
    }
  }
}

// export class FetchAccountsQuery {
//   public static execute(params: Partial<FetchAccountsQueryParams>) {
//     const page = TransactionsQueryParams.paginate(params.page!, params.per_page!);

//     let where: Record<string, any> = {};

//     if (params.search) {
//       where.user = {
//         OR: [
//           { email: { contains: params.search, mode: "insensitive" } },
//           { document: { contains: params.search, mode: "insensitive" } },
//           {
//             name: {
//               contains: params.search,
//               mode: "insensitive",
//             },
//           },
//         ],
//       };
//     }
//     return {
//       page,
//       where,
//       per_page: +params.per_page!,
//     };
//   }
// }
