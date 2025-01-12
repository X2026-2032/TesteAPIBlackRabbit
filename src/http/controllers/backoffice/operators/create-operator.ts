import { PrismaClient } from "@prisma/client";
import { AppError } from "@/use-cases/errors/app-error";
import { FastifyReply, FastifyRequest } from "fastify";
import { hash } from "bcryptjs";
import { z } from "zod";

const prisma = new PrismaClient();

export async function createOperator(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const bodySchema = z.object({
      name: z.string(),
      birthDate: z.string(),
      document: z.string(),
      email: z.string().email(),
      gender: z.string(),
      phone: z.object({
        ddd: z.string(),
        number: z.string(),
        type: z.enum(["mobile", "landline"]),
      }),
      role: z.enum(["OPERATOR"]),
      status: z.enum(["active", "inactive"]),
      access_token: z.string().optional(),
      password: z.string().min(6).optional(),
    });

    const data = bodySchema.parse(request.body);
    data.status = "active";

    if (data.password) {
      data.password = await hash(data.password, 6);
    }

    if (!data.phone) {
      throw new AppError({
        status: 400,
        message: "Phone is required",
      });
    }

    // Ajuste o tipo do campo 'phone' conforme necessário
    const phone = {
      ddd: data.phone.ddd,
      number: data.phone.number,
      type: data.phone.type,
    };

    const createdOperator = await prisma.operatos.create({
      data: {
        ...data,
      },
    });

    return reply.status(201).send(createdOperator);
  } catch (error: any) {
    throw new AppError(error);
  }
}
