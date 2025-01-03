import { FastifyInstance } from "fastify";

import { verifyJwt } from "@/http/middlewares/verify-jwt";
import { createCard } from "./create-card";
import { lockCard } from "./lock-card";

export async function CardsRoutes(app: FastifyInstance) {
  app.addHook("onRequest", verifyJwt);

  app.post("/", createCard);
  app.patch("/:id/lock", lockCard);
}
