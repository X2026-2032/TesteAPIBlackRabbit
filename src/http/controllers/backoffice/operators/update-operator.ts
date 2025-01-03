import { PrismaClient } from "@prisma/client";
import { AppError } from "@/use-cases/errors/app-error";
import { FastifyReply, FastifyRequest } from "fastify";
import { hash } from "bcryptjs";
import { z } from "zod";

const prisma = new PrismaClient();

interface RequestParams {
  id: string;
}

export async function updateOperator(
  request: FastifyRequest<{ Params: RequestParams }>,
  reply: FastifyReply,
) {
  try {
    const bodySchema = z.object({
      name: z.string(),
      document: z.string(),
      email: z.string().email(),
      password: z.string().min(6).optional(),
      phone: z.object({
        ddd: z.string(),
        number: z.string(),
        type: z.enum(["mobile", "landline"]),
      }),
      role: z.enum(["OPERATOR"]),
      status: z.enum(["active", "inactive"]),
      access_token: z.string().optional(),
    });

    const requestData = bodySchema.parse(request.body);
    const operatorId = request.params.id;

    if (requestData.password) {
      requestData.password = await hash(requestData.password, 6);
    }

    if (!requestData.phone) {
      throw new AppError({
        status: 400,
        message: "Phone is required",
      });
    }

    // Ajuste o tipo do campo 'phone' conforme necessário
    const phone = {
      ddd: requestData.phone.ddd,
      number: requestData.phone.number,
      type: requestData.phone.type,
    };

    if (!requestData.password) {
      delete requestData.password;
    }

    const updatedOperator = await prisma.operatos.update({
      where: { id: operatorId },
      data: {
        ...requestData,
        phone,
      },
    });

    return reply.status(200).send(updatedOperator);
  } catch (error: any) {
    throw new AppError(error);
  }
}
