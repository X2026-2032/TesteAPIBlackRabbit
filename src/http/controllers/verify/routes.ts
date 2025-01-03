import { FastifyInstance } from "fastify";
import { CreateVerifyData } from "./create";
import { verifyJwt } from "@/http/middlewares/verify-jwt";
import { addDocumentsVerify } from "./add-documents";

export async function VerifyRoutes(app: FastifyInstance) {
  app.post("/create", CreateVerifyData);
  app.post(
    "/add-documents",
    /*  { onRequest: [verifyJwt] },  */ addDocumentsVerify,
  );
}
