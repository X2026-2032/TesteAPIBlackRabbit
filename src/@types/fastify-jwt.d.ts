import "@fastify/jwt";

declare module "@fastify/jwt" {
  export interface FastifyJWT {
    user: {
      role: "ADMIN" | "MEMBER" | "WALLET" | "GRAPHIC";
      type: string;
      sub: string;
    };
  }
}
