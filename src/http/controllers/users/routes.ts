import { FastifyInstance } from "fastify";
import { authenticate, completeUserVeriff } from "./authenticate";
import { profile } from "./profile";
import {
  registerIndividuals,
  registerIndividualsOccupations,
} from "./register-individuals";
import { verifyJwt } from "@/http/middlewares/verify-jwt";
import { registerCompanies } from "./register-companies";
import { registerDocuments } from "./register-documents";
import { up } from "./up";
import { passwordResetController } from "../accounts/password-reset";
import { updatePasswordController } from "../accounts/update-password";
import { updateUserConfigKeyPix } from "./key-config-user-controller";
import { getUserConfigKeyPix } from "./get-config-key-user";
import { updateGestorStatus } from "./update-gestor-graphic-controller";
import { updateUserStatusController } from "./update-user-controller";
import { authenticateWallet } from "./authenticate-wallet";
import { authenticateIndividualByWallet } from "./authenticate-individual-by-wallet";
import { updateBlockedStatus } from "./update-blocked-password-controller";
import { chromium } from "playwright";
import * as cheerio from "cheerio";
import { changeUserPasswordController } from "./change-user-password";
import { changeUserPasswordEletronicController } from "./change-user-password-eletronic";
import { getInOut } from "./get-in-out";
import { getUserAddressById } from "./get-user-address";
import { balanceteController } from "./balancete";

export async function UsersRoutes(app: FastifyInstance) {
  app.get("/balancete", { onRequest: [verifyJwt] }, balanceteController);
  app.post("/accounts/reset-password", passwordResetController);
  app.patch("/accounts/reset-password", updatePasswordController);

  app.patch(
    "/change-password/:id",
    { onRequest: [verifyJwt] } as any,
    changeUserPasswordController,
  );

  app.patch(
    "/change-password-eletronic/:id",
    { onRequest: [verifyJwt] } as any,
    changeUserPasswordEletronicController,
  );

  app.post("/users/companies", { onRequest: [verifyJwt] }, registerCompanies);
  app.post(
    "/users/individuals",
    { onRequest: [verifyJwt] },
    registerIndividuals,
  );
  app.get("/users/individuals/occupations", registerIndividualsOccupations);
  app.get(
    "/users/address/:userId",
    { onRequest: [verifyJwt] },
    getUserAddressById,
  );

  app.post("/up", up);
  app.post("/sessions", authenticate);
  app.post("/sessions/wallet", { onRequest: [verifyJwt] }, authenticateWallet);
  app.post(
    "/sessions/individuals",
    { onRequest: [verifyJwt] },
    authenticateIndividualByWallet,
  );

  // Authenticated
  app.get("/me", { onRequest: [verifyJwt] }, profile);

  app.post("/users/documents", { onRequest: [verifyJwt] }, registerDocuments);
  // app.post("/users/individuals/documents", { onRequest: [verifyJwt] }, registerIndividualsDocuments);

  app.patch(
    "/update-config-key-pix/:userId",
    { onRequest: [verifyJwt] },
    updateUserConfigKeyPix,
  );
  app.get(
    "/users/:userId/config-key-pix",
    { onRequest: [verifyJwt] },
    getUserConfigKeyPix,
  );
  app.patch(
    "/users/:userId/status",
    { onRequest: [verifyJwt] },
    updateUserStatusController,
  );

  app.post("/users/veriff", completeUserVeriff);

  app.patch("/update-config-gestor-status/:id", updateGestorStatus);
  app.patch("/update-config-blocked-password-status/:id", updateBlockedStatus);
  app.get("/in-out", { onRequest: [verifyJwt] }, getInOut);

  app.get("/scrape/ispb", async (req, res) => {
    const browser = await chromium.launch({
      headless: false,
    });

    const page = await browser.newPage({
      viewport: { width: 720, height: 1024 },
    });

    await page.goto(`https://www.cora.com.br/blog/codigos-bancos/`);

    await page.mouse.wheel(0, -2000);

    await page.waitForSelector("tbody");

    const html = await page.content();

    const $ = cheerio.load(html);

    type Bank = { name: string; code: string; ispb: string };

    const data: Bank[] = [];

    $("tbody").each((i, el) => {
      $("tr", el).each((_, tr) => {
        const bank: Bank = { code: "", ispb: "", name: "" };

        $("td", tr).each((index, td) => {
          if (index == 2) {
            bank.name = $(td).text().trim();
          }
          if (index == 1) {
            bank.code = $(td).text().trim();
          }
          if (index == 0) {
            bank.ispb = $(td).text().trim();
          }
        });

        if (bank) {
          data.push(bank);
        }
      });
    });

    browser.close();
    return res.send(data);
  });
}
