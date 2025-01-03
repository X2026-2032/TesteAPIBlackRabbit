import { FastifyInstance } from "fastify";

export async function createAndAuthenticateUser(
  app: FastifyInstance,
  isAdmin = false,
) {
  return {
    token: "token",
  };
}
