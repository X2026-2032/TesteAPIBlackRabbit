import { getIdUser } from "@/http/middlewares/verify-device";
import { DeviceRepository } from "@/repositories/prisma/prisma-device-repository";
import { CreateDeviceUseCase } from "@/use-cases/device/create-device-usecase";
import { AppError } from "@/use-cases/errors/app-error";
import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";

const UAParser = require("ua-parser-js");

export async function CreateDeviceController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const bodySchema = z.object({
      pin: z.string(),
    });

    const { pin } = bodySchema.parse(request.body);

    const userAgent = request.headers["user-agent"];

    const parser = new UAParser(userAgent);
    const resultParse = parser.getResult();

    const device = {
      browser: resultParse.browser.name.toLowerCase(),
      os: resultParse.os.name.toLowerCase(),
    };

    const userId = await getIdUser(request);

    const deviceUseCase = new CreateDeviceUseCase(new DeviceRepository());

    await deviceUseCase.execute({
      userId,
      device,
      pin,
    });

    reply.status(201).send({ message: "Dispositivo cadastrado com sucesso" });
  } catch (error: any) {
    throw new AppError(error);
  }
}
