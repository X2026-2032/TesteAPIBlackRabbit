import { prisma } from "@/lib/prisma";
import { FastifyRequest, FastifyReply } from "fastify";
const UAParser = require("ua-parser-js");
import CryptoJS from "crypto-js";

interface JwtPaylod {
  sub: string;
}

export async function verifyDevice(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const userAgent = request.headers["user-agent"];

  const parser = new UAParser(userAgent);
  const resultParse = parser.getResult();

  const browser = resultParse.browser.name.toLowerCase();

  const os = resultParse.os.name.toLowerCase();

  const data = {
    browser,
    os,
  };

  const key = CryptoJS.enc.Utf8.parse(process.env.JWT_SECRET as string);
  const iv = CryptoJS.enc.Utf8.parse(process.env.IV_KEY as string);

  const deviceHash = CryptoJS.AES.encrypt(JSON.stringify(data), key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  const user_id = await getIdUser(request);

  const userDevice = await prisma.userDevice.findMany({
    where: {
      user_id,
    },
  });

  if (userDevice.length <= 0) {
    reply.status(401).send({ message: "Nenhum dispositivo cadastrado" });
  }

  userDevice.forEach((device) => {
    if (device.device !== deviceHash.toString() || device.allowed !== true) {
      reply.status(401).send({ message: "Dispositivo não autorizado" });
      return;
    }
  });
}

export async function getIdUser(request: FastifyRequest): Promise<string> {
  const decoded = await request.jwtDecode<JwtPaylod>();

  return decoded.sub;
}
