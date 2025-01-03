import { FastifyInstance } from "fastify";
import { createTicketController } from "./create-ticket";
import { listAllTicketController } from "./list-all-tickets";
import { deleteTicketController } from "./delete-ticket";
import { FindByIdTicketController } from "./find-by-id.ticket";
import { createMessageController } from "./messages/create-message";
import { verifyJwt } from "@/http/middlewares/verify-jwt";
import { listMessagesController } from "./messages/list-message";
import { readMessageController } from "./messages/read-message";
import { updateTicket } from "./update-ticket";

export async function TicketRoutes(app: FastifyInstance) {
  app.post("/", createTicketController);
  app.delete("/delete", deleteTicketController);
  app.get("/:id", FindByIdTicketController);

  app.get("/", { onRequest: [verifyJwt] }, listAllTicketController);
  app.put("/update", { onRequest: [verifyJwt] }, updateTicket);
  app.post(
    "/:number/message",
    { onRequest: [verifyJwt] },
    createMessageController,
  );

  app.get("/:number/messages", listMessagesController);
  app.get("/messages/:id", readMessageController);
}
