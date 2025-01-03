import { getIdUser } from "@/http/middlewares/verify-device";
import { DeviceTokenRepository } from "@/repositories/prisma/prisma-device-token-repository";
import { SendEmailTokenUseCase } from "@/use-cases/device_token/send-email-token-usecase";
import { AppError } from "@/use-cases/errors/app-error";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

const UAParser = require("ua-parser-js");

export async function sendEmail(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userAgent = request.headers["user-agent"];

    const parser = new UAParser(userAgent);
    const resultParse = parser.getResult();

    const device = {
      browser: resultParse.browser.name.toLowerCase(),
      os: resultParse.os.name.toLowerCase(),
    };

    const paramSchema = z.object({
      email: z.string().email(),
    });

    const data = paramSchema.parse(request.body);

    const user_id = await getIdUser(request);

    const sendEmailUseCase = new SendEmailTokenUseCase(
      new DeviceTokenRepository(),
    );

    await sendEmailUseCase.execute(data.email, user_id, device);

    reply.code(204);
  } catch (error: any) {
    throw new AppError(error);
  }
}
