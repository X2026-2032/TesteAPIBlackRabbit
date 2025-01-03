import { FastifyInstance } from "fastify";
import { verifyJwt } from "@/http/middlewares/verify-jwt";
import { listPaymentsPagBankGraphic } from "./listPaymentsPagBankGraphic";
import { listPaymentsPagBank } from "./listPaymentsPagBank";
import { listGraphicAccountWithMachines } from "./graphic_account/listGraphicAccountWithMachines";
import { getGraphicAccountPosDetail } from "./graphic_account/getGraphicAccountPosDetail";
import { webHookPagBank } from "./webHookPagBank";
import { verifyUserRole } from "@/http/middlewares/verify-user-role";
import { aproovePayment } from "./aproovePayment";

export async function PagBankRoutes(app: FastifyInstance) {
  app.get(
    "/:startDate/:endDate/:graphic_account_id",
    { onRequest: [verifyJwt] },
    listPaymentsPagBankGraphic,
  );
  app.get(
    "/:startDate/:endDate",
    { onRequest: [verifyJwt] },
    listPaymentsPagBank,
  );
  app.get(
    "/wallet-machines",
    {
      onRequest: [verifyJwt, verifyUserRole(["ADMIN", "ADMIN_BAG", "MASTER"])],
    },
    listGraphicAccountWithMachines,
  );

  app.post("/recebimento-de-notificacao", webHookPagBank);
  app.get(
    "/graphic-pos-details",
    { onRequest: [verifyJwt] },
    getGraphicAccountPosDetail,
  );
  app.post(
    "/aproove-payments",
    {
      onRequest: [verifyJwt, verifyUserRole(["ADMIN_BAG", "ADMIN", "MASTER"])],
    },
    aproovePayment,
  );
}
