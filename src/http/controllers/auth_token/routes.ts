import { FastifyInstance } from "fastify";

import { verifyJwt } from "@/http/middlewares/verify-jwt";
import { CreateAuthToken } from "./create-token";
import { authenticateToken } from "./authenticate";

export async function AuthTokenRoutes(app: FastifyInstance) {
  app.post("/create/:id", { onRequest: [verifyJwt] } as any, CreateAuthToken);
  app.post("/login", authenticateToken);
}
