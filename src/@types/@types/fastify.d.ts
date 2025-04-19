import { Server } from "socket.io";

// Extender a tipagem do FastifyRequest
declare module "fastify" {
  interface FastifyRequest {
    app: {
      io: Server;
    };
  }
}
