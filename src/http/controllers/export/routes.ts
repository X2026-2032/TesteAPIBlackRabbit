import { FastifyInstance } from "fastify";
import { verifyJwt } from "@/http/middlewares/verify-jwt";
import { Export } from "../export";
import { ExportDelbank } from "./export-delbank";

const exportController = new Export();
const exportControllerDelbank = new ExportDelbank();

export async function ExtractRoutes(app: FastifyInstance) {
  app.post("/", { onRequest: [verifyJwt] }, exportController.execute);
  app.post(
    "/delbank",
    { onRequest: [verifyJwt] },
    exportControllerDelbank.execute,
  );
}
