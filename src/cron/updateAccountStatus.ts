import { api } from "@/lib/axios";
import { prisma } from "@/lib/prisma";
import cron from "node-cron";

export const UpdateAccountStatusCron = async () => {
  const users = await prisma.user.findMany({
    where: {
      NOT: {
        OR: [{ status: "ACTIVE" }, { status: "DOCUMENTATION_DENIED" }],
      },
    },
  });

  for (const user of users) {
    try {
      const response_user = await api.get(
        `https://api.delbank.com.br/baas/api/v1/customers/${user.document}`,
        {
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            "x-delbank-api-key": process.env.MASTER_API_KEY,
          },
        },
      );

      const status_user = response_user.data.status;

      const status_update_user =
        status_user === "APPROVED" ? "ACTIVE" : status_user;

      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          status: status_update_user,
        },
      });
      if (response_user.data.documents.length > 0) {
        const response_account = await api.get(
          `https://api.delbank.com.br/baas/api/v1/customers/${user.document}/bank-accounts`,
          {
            headers: {
              accept: "application/json",
              "content-type": "application/json",
              "x-delbank-api-key": process.env.MASTER_API_KEY,
            },
          },
        );

        if (
          response_account.status !== 200 ||
          response_account.data.length === 0
        ) {
          throw new Error("Erro ao buscar informações com a Delbank");
        }

        const status_account = response_account.data[0].status;

        const status_update_account =
          status_account === "APPROVED" ? "ACTIVE" : status_account;

        const accountNumberPrefix = response_account.data[0].number.slice(0, 4);
        const accountNumberLastDigit =
          response_account.data[0].number.slice(-1);

        const raw = {
          account_number: accountNumberPrefix,
          account_digit: accountNumberLastDigit,
          branch_number: response_account.data[0].branch,
          alias_status: status_update_account,
          api_key: response_account.data[0].apiKey,
          code_bank: response_account.data[0].bank.code,
          status: status_update_account,
        };

        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            api_key: response_account.data[0].apiKey,
          },
        });

        await prisma.account.updateMany({
          where: {
            user_id: user.id,
          },
          data: {
            ...raw,
          },
        });
      }
    } catch (err) {
      console.log(err);
    }
  }
};

cron.schedule("0 */6 * * *", UpdateAccountStatusCron);
