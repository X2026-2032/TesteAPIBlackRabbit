import { AppError } from "@/use-cases/errors/app-error";
import { FastifyReply, FastifyRequest } from "fastify";

const UAParser = require("ua-parser-js");

export async function GetCurrentDevice(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const userAgent = request.headers["user-agent"];

    const parser = new UAParser(userAgent);
    const resultParse = parser.getResult();

    const device = {
      browser: resultParse.browser.name.toLowerCase(),
      os: resultParse.os.name.toLowerCase(),
    };

    reply.status(200).send(device);
  } catch (error: any) {
    throw new AppError(error);
  }
}
