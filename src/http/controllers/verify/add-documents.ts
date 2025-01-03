import { prisma } from "@/lib/prisma";
import { FastifyReply, FastifyRequest } from "fastify";

export const addDocumentsVerify = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { data } = request.body as any;

    const documents = await prisma.verifyAuth.findUnique({
      where: {
        rg_cnh: data.rg_cnh,
      },
      select: {
        data: true,
        id: true,
      },
    });
    if (!documents) {
      throw new Error("Documento não encontrado");
    }
    const content = JSON.parse(JSON.stringify(documents?.data));

    const values = data.data;

    const newData = { ...content, ...values };

    const document = await prisma.verifyAuth.update({
      where: {
        id: documents.id,
      },
      data: {
        data: newData,
      },
    });
    reply.send(document);
  } catch (err: any) {
    throw new Error(err);
  }
};
