import { api } from "@/lib/axios";
import { prisma } from "@/lib/prisma";
import { CronJob } from "cron";

const masterApiKey =
  "Ic0qN8fw7g5Yang0QlcAQqknmOGungc2dJlvDsjQ6UhNXjXPRueXr75KFSGR/mYwc1JAr+sSTBR0zMChjDaGkMZq+6Jiy5XWAV9MLsONtlE+PjQTMJ5XVtQJPnmDj/Eu";

export default async function observeBankslips() {
  const job = new CronJob(`0 */6 * * *`, observeBankslipsJob);
  job.start();
}

export async function observeBankslipsJob() {
  try {
    const slips = await prisma.bankSlip.findMany();

    for (const slip of slips) {
      const response = await api.get(`/v1/charges/${slip.correlationId}`, {
        headers: {
          "x-delbank-api-key": masterApiKey,
        },
      });

      const data = response.data;

      await prisma.bankSlip.update({
        where: { id: slip.id },
        data: { status: data.status, response: data },
      });
    }
  } catch (error) {
    console.log("Houve um erro ao processar Boletos...");
  }
}

const types = {
  INTERNAL_OUT: "DEBIT_TRANSFER_INTERNAL",
  INTERNAL_IN: "CREDIT_TRANSFER_INTERNAL",
  TED_OUT: "DEBIT_TRANSFER_EXTERNAL",
  TED_IN: "CREDIT_TRANSFER_EXTERNAL",
  PIX_OUT: "DEBIT_PIX",
  PIX_IN: "CREDIT_PIX",
};

type TED = {
  id: string;
  nsu: number;
  amount: number;
  notes: string;
  createdAt: string;
  type: {
    name: string;
    description: string;
    isCredit: boolean;
  };
  balance: {
    balancePrevious: number;
    currentBalance: number;
  };
  proof: {
    id: string;
    status: string;
    type: string;
    amount: number;
    description: string;
    payer: Array<any>;
    beneficiary: Array<any>;
  };
};
