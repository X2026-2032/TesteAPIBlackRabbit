import "@fastify/jwt";

declare module "@fastify/jwt" {
  export interface FastifyJWT {
    user: {
      name: any;
      userName: any;
      id: any;
      role: "ADMIN" | "MEMBER" | "WALLET" | "GRAPHIC";
      type: string;
      sub: string;
    };
  }
}
