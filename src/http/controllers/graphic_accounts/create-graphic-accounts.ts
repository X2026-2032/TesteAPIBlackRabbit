import { AppError } from "@/use-cases/errors/app-error";
import { makeCreateGrapicAccountUseCase } from "@/use-cases/factories/graphic_accounts/make-create-graphic_accounts-use-case";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function createGraphicAccounts(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    // Log dos dados de requisição
    console.log("Request received at createGraphicAccounts:");
    console.log("Request Headers:", request.headers);  // Cabeçalhos
    console.log("Request Body:", request.body);  // Corpo da requisição

    // Validação do schema
    const schema = z.object({
      name: z.string().optional(), // Campo pode ser nulo
      userName: z.string().optional(), // Opcional e único
      hardPassword: z.string().optional(), // Opcional
      password_hash: z.string().optional(), // Opcional
      status: z.string().optional().default("active"), // Opcional
      created_at: z.date().default(new Date()), // Data de criação com valor padrão
      access_token: z.string().optional(), // Opcional
      blocked: z.boolean().default(false), // Valor padrão
      counter: z.number().default(0), // Valor padrão
      role: z.enum(["MEMBER", "ADMIN", "USER"]).default("USER"), // Enum com valor padrão
    });

    const {
      name,
      userName,
      hardPassword,
      password_hash,
      status,
      created_at,
      access_token,
      blocked,
      counter,
      role,
    } = schema.parse(request.body);

    console.log("Parsed request body:", {
      name,
      userName,
      hardPassword,
      password_hash,
      status,
      created_at,
      access_token,
      blocked,
      counter,
      role,
    });

    // Criação do Use Case para criar a conta
    const createGrapicAccountUseCase = makeCreateGrapicAccountUseCase();
    console.log("Executing use case with the following data:", {
      name,
      userName,
      hardPassword,
      password_hash,
      status,
      created_at,
      access_token,
      blocked,
      counter,
      role,
    });

    const account = await createGrapicAccountUseCase.execute({
      name,
      userName,
      hardPassword,
      password_hash,
      status,
      created_at,
      access_token,
      blocked,
      counter,
      role,
    });

    console.log("Account created successfully:", account);
    return reply.status(200).send(account);

  } catch (error: any) {
    // Log completo de erro
    console.error("Error during account creation:", error);

    // Se for um erro customizado (AppError), retorna 400
    if (error instanceof AppError) {
      return reply.status(400).send({ message: error.message });
    }

    // Caso seja um erro não tratado ou desconhecido, retorna 500
    return reply.status(500).send({ message: "An unexpected error occurred", error: error.message });
  }
}
