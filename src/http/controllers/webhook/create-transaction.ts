import { IdezWebhook } from "@/service/idez/idex";
import { AppError } from "@/use-cases/errors/app-error";
import { FastifyReply, FastifyRequest } from "fastify";
import { WebhookHandler } from "./transaction-webhook-handler";
import { IdezPixReceivedBuild } from "@/service/idez/webhook/pix-received-build";
import { IdezBankTransferReceivedBuild } from "@/service/idez/webhook/bank-transfers-received-build";
import { CreateTransactionByWebHookUseCase } from "@/use-cases/create-transaction-by-webhook";

export async function webHook(request: FastifyRequest, reply: FastifyReply) {
  try {
    const ignoreEvents = ["pix.sent", "bank_transfer.sent"];

    const factory: Record<string, any> = {
      "pix.received": {
        build: IdezPixReceivedBuild.execute,
        execute: CreateTransactionByWebHookUseCase.pix,
      },
      "bank_transfer.received": {
        build: IdezBankTransferReceivedBuild.execute,
        execute: CreateTransactionByWebHookUseCase.ted,
      },
    };

    const { data, type } = <IdezWebhook>request.body;
    if (ignoreEvents.includes(type)) return reply.status(201).send("ok");

    if (factory[type]) {
      const build = factory[type]["build"](data);
      await factory[type]["execute"](build);

      // Chamar o WebhookHandler aqui para lidar com as transações
      await WebhookHandler.handleTransaction(data);
      //await WebhookHandler.handlePaymentAndTax(data);

      return reply.status(201).send("ok");
    }
    throw new Error(`Factory ${type} not found`);
  } catch (error: any) {
    throw new AppError(error);
  }
}
