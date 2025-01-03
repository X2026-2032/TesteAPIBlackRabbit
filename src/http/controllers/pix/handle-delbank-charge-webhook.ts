import { AppError } from "@/use-cases/errors/app-error";
import PixPayInUseCase from "@/use-cases/webhook/DelbankWebhookUseCase";
import { FastifyReply, FastifyRequest } from "fastify";

export type PayInRequest = {
  ref_id: string;
  category: string;
  type: string;
  data: {
    amount: {
      amount: number;
      currency: string;
    };
    bank_account_id: string;
    company_id: string;
    counterparty: {
      company_id: string;
      external_id: string;
      id: string;
      inserted_at: string;
      ledger_type: string;
      legal_name: string | null;
      maximum_amount: number | null;
      maximum_transactions: number | null;
      name: string;
      tax_number: string;
      updated_at: string;
    };
    counterparty_bank_account: {
      account_digit: string;
      account_number: string;
      account_type: string;
      bank_ispb: string;
      bank_number: string;
      branch: string;
      id: string;
      inserted_at: string;
      updated_at: string;
    };
    counterparty_bank_account_id: string;
    counterparty_id: string;
    description: string;
    end_to_end_id: string;
    entity_id: string;
    external_id: string;
    id: string;
    marked_for_automatic_refund: boolean;
    origin_id: string | null;
    origin_type: string;
    receipt_url: string;
    reconciliation_id: string;
    ref_id: string;
    ref_type: string;
    status: string;
    transaction_date: string;
    type: string;
    virtual_account_id: string;
  };
  timestamp: string;
  company_id: string;
};

export async function redirectWebhook(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const req = request.body as PayInRequest;

  switch (req.category) {
    case "collecting_document":
      if (req.type === "created") {
        reply.send("ok");
      } else if (
        req.type === "settled" &&
        (req.data.ref_type === "pix_static_qrcode" ||
          req.data.ref_type === "pix_qrcode")
      ) {
        await chargePaid(request, reply);
      } else if (req.type === "settled" && req.data.ref_type === "none") {
        await pixCashout(request, reply);
      } else if (req.type === "settled" && req.data.type === "virtual") {
        await pixInternalReceiver(request, reply);
      }

    case "payment_document":
      if (req.type === "settled" && req.data.type === "virtual") {
        await pixInternalPayer(request, reply);
      } else if (req.type === "settled") {
        await updateEndToEndId(request, reply);
      }

    default:
      reply.send("ok");
  }
}

export async function pixCashout(request: FastifyRequest, reply: FastifyReply) {
  try {
    const data = request.body as PayInRequest;

    if (data.type === "settled") {
      await PixPayInUseCase.pixCashout(data);
    } else {
      return reply.status(400).send({
        message: "Evento desconhecido",
      });
    }
  } catch (error: any) {
    throw new AppError(error);
  }
}

export async function pixInternalPayer(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const data = request.body as PayInRequest;

    if (data.type === "settled") {
      await PixPayInUseCase.pixInternalPayer(data);

      return reply.status(200).send();
    }

    return reply.status(400).send({
      message: "Evento desconhecido",
    });
  } catch (error: any) {
    throw new AppError(error);
  }
}

export async function pixInternalReceiver(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const data = request.body as PayInRequest;

    if (data.type === "settled") {
      await PixPayInUseCase.pixInternalReceiver(data);

      return reply.status(200).send();
    }

    return reply.status(400).send({
      message: "Evento desconhecido",
    });
  } catch (error: any) {
    throw new AppError(error);
  }
}

export async function chargePaid(request: FastifyRequest, reply: FastifyReply) {
  try {
    const data = request.body as PayInRequest;

    await PixPayInUseCase.chargePaid(data);

    return reply.status(200).send();
  } catch (error: any) {
    throw new AppError(error);
  }
}

export async function updateEndToEndId(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const data = request.body as PayInRequest;

    await PixPayInUseCase.updateTransactionEndToEnd(data);

    return reply.status(200).send();
  } catch (error: any) {
    throw new AppError(error);
  }
}
