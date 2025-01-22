import "@fastify/jwt";

declare module "@fastify/jwt" {
  export interface FastifyJWT {
    user: {
      id: any;
      role: "ADMIN" | "MEMBER" | "WALLET" | "GRAPHIC";
      type: string;
      sub: string;
    };
  }
}
