import { FastifyInstance } from "fastify";

import { verifyJwt } from "@/http/middlewares/verify-jwt";

import { verifyUserRole } from "@/http/middlewares/verify-user-role";
import { listUsers } from "./list-users";
import { listUsersAdmin } from "./list-users-admin";
import { createOperator } from "./operators/create-operator";
import { fetchOperators } from "./operators/fetch-operators";
import { deleteOperator } from "./operators/delete-operator";
import { updateOperator } from "./operators/update-operator";
import { fetchNotifications } from "./notifications/fetch-notiffications";
import { FindUserAdmin } from "./find-user";

export async function BackofficeRoutes(app: FastifyInstance) {
  app.addHook("onRequest", verifyJwt);
  app.addHook(
    "onRequest",
    verifyUserRole(["ADMIN", "MASTER", "ADMIN_BAG"]),
  );

 
 
  app.get("/users", listUsers);
  app.get("/users/admin", listUsersAdmin);
  app.get("/user/:document", FindUserAdmin);
 
 
  app.post("/operators", createOperator);
  app.get("/operators", fetchOperators);
  app.delete("/operators/:id", deleteOperator);
  app.put("/operators/:id", updateOperator);

  app.get("/notifications", fetchNotifications);

}
