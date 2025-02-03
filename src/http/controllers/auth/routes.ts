import { FastifyInstance } from "fastify";
import { backofficeAuthenticate } from "./backoffice-authenticate";
import { verifyJwt } from "@/http/middlewares/verify-jwt";
import { profile } from "./profile";
import { logout } from "./logout";

export async function AuthRoutes(app: FastifyInstance) {
  app.get("/logout", { onRequest: [verifyJwt] }, logout);
  app.post("/backoffice", backofficeAuthenticate);
  app.get("/me/backoffice", { onRequest: [verifyJwt] }, profile);
}
