import { FastifyInstance } from "fastify";
import { verifyJwt } from "@/http/middlewares/verify-jwt";
import { fetchTransactionById } from "./fetch-transations-by-id";
import { fetchTransactions } from "./fetch-transations";
import { findExtractById } from "./find-extract-by-id";
import fetchBalanceEndNightHandler from "./get-balance-end-night";
import dailyFinalBalanceController from "./dailyFinalBalanceController";
import { getTransactionsDelbank } from "./getTransactionsDelbank";
import { getAllTransactionsDelbank } from "./getAllTransactionsDelbank";

export async function TransactionsRoutes(app: FastifyInstance) {
  app.get("/", { onRequest: verifyJwt }, fetchTransactions);
  app.get("/delbank", getTransactionsDelbank);
  app.get("/all/delbank", getAllTransactionsDelbank);
  app.get("/:id", { onRequest: verifyJwt }, fetchTransactionById);
  app.get("/extract/:id", findExtractById);
  app.get(
    "/balances-end-night",
    { onRequest: verifyJwt },
    fetchBalanceEndNightHandler,
  );
  app.get(
    "/daily-final-balances",
    { onRequest: verifyJwt },
    dailyFinalBalanceController,
  );
}
