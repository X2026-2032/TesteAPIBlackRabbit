import { prisma } from "@/lib/prisma";
import { api } from "@/lib/axios";

const baseUrl = process.env.IDEZ_API_URL || null;
const urlApi = "/webhooks";

const base64Credentials = Buffer.from(
  `${process.env.AUTH_USERNAME}:${process.env.AUTH_PASSWORD}`,
).toString("base64");

export default async function createWebhooks() {
  const users = await prisma.user.findMany();

  const usersWithApiKey = users.filter((u) => !!u.api_key);

  for (const u of usersWithApiKey) {
    const company_id = u.api_key;
    if (company_id) {
      await loadWebHooks(company_id);
    }
  }
}

async function loadWebHooks(company_id: string) {
  const options = [
    {
      method: "POST",
      url: urlApi,
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        Authorization: `Basic ${base64Credentials}`,
      },
      data: {
        authorizationScheme: "basic",
        notification_secret: process.env.WEBHOOK_SECRET,
        notification_url:
          "https://vilapay-api-9qe5d.ondigitalocean.app/pix/webhook",
        url: `${baseUrl}/webhooks?company_id=${company_id}`,
      },
    },
  ];

  try {
    const response = await api.get(`${urlApi}?company_id=${company_id}`, {
      headers: {
        accept: "application/json",
        Authorization: `Basic ${base64Credentials}`,
      },
    });

    const webhook = response.data;

    if (
      !webhook?.data ||
      !Array.isArray(webhook.data) ||
      webhook.data.length === 0
    ) {
      for (const opt of options) {
        await api.request(opt);
      }
      return;
    }

    const existingWebhook = webhook.data[0];

    for (const opt of options) {
      if (existingWebhook.company_id === process.env.COMPANY_ID) {
        const webhook_id = existingWebhook.id;

        await api.patch(
          `${baseUrl}/${urlApi}/${webhook_id}?company_id=${company_id}`,
          opt.data,
          {
            headers: {
              authorizationScheme: "basic",
              accept: "application/json",
              Authorization: `Basic ${base64Credentials}`,
            },
          },
        );
      } else {
        console.log("Criando novo webhook.");
        await api.request(opt);
      }
    }
  } catch (error) {
    console.error("Erro ao carregar webhooks:", error);
  }
}
