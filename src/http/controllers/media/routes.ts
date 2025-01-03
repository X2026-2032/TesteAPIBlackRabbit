import { FastifyInstance } from "fastify";

import { verifyJwt } from "@/http/middlewares/verify-jwt";
import { updateProfilePicture } from "./update-profile-picture";
import { getProfilePicture } from "./get-profile-picture";

export async function MediaRoutes(app: FastifyInstance) {
  app.addHook("onRequest", verifyJwt);
  app.get("/get-profile-picture/:id", getProfilePicture);
  app.put("/update-profile-picture/:id", updateProfilePicture);
}
