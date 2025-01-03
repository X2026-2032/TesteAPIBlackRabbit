import { api } from "@/lib/axios";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/use-cases/errors/app-error";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function createAccountDocument(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const schema = z.object({
      userId: z.string(),
      documentBase64: z.string(),
      documentType: z.string(),
    });

    const data = schema.parse(request.body);

    const user = await prisma.user.findUnique({ where: { id: data.userId } });

    if (!user) throw new AppError({ message: "User not found", status: 404 });

    const response = await api.post(
      `/baas/api/v1/customers/${user.document}/documents`,
      {
        base64: data.documentBase64,
        documentType: data.documentType,
      },
      {
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          "x-delbank-api-key": process.env.MASTER_API_KEY,
        },
      },
    );

    return reply.status(200).send();
  } catch (error: any) {
    console.log(error);

    throw new AppError(error);
  }
}
