import { FastifyReply, FastifyRequest } from "fastify";

type Roles =
  | "ADMIN"
  | "MEMBER"
  | "GRAPHIC"
  | "WALLET"
  | "MASTER"
  | "ADMIN_BAG"
  | "OPERATOR";

export function verifyUserRole(rolesToVerify: Roles[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const { role } = request.user;

    const verified = !!rolesToVerify.find((r) => r == role);

    if (!verified) {
      return reply.status(401).send({ message: "Unauthorized." });
    }
  };
}
