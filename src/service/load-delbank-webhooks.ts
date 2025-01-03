import { api } from "@/lib/axios";

const ngrokBackendUrl = process.env.NGROK;
const prodBackendUrl = process.env.BACKEND_URL;

const urlApi = "/baas/api/v1/webhooks";
const node_env = process.env.NODE_ENV;

export default async function loadWebHooks(data: {
  userName?: string;
  api_key: string;
}) {
  const options = [
    {
      method: "POST",
      url: urlApi,
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "x-delbank-api-key": data.api_key,
      },
      data: {
        authorization:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiTUVNQkVSIiwidHlwZSI6Ik5BVFVSQUwiLCJzdWIiOiJjNDc4NTQwMS1iZGRhLTQwMzktOTI0ZC1hOTU0YzE0OWRmNDIiLCJpYXQiOjE3MDUzNzQ4NDIsImV4cCI6MTcwNzk2Njg0Mn0.P92JZgrg5YMBsb0PoE9EP4FfKHTJyOIQbn4p2dz2DRE",
        eventType: "PIX_RECEIVED",
        authorizationScheme: "BEARER",
        url:
          node_env == "dev"
            ? `${ngrokBackendUrl}/pix/webhook/chargePaid`
            : `${prodBackendUrl}/pix/webhook/chargePaid`,
      },
    },
    {
      method: "POST",
      url: urlApi,
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "x-delbank-api-key": data.api_key,
      },
      data: {
        authorization:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiTUVNQkVSIiwidHlwZSI6Ik5BVFVSQUwiLCJzdWIiOiJjNDc4NTQwMS1iZGRhLTQwMzktOTI0ZC1hOTU0YzE0OWRmNDIiLCJpYXQiOjE3MDUzNzQ4NDIsImV4cCI6MTcwNzk2Njg0Mn0.P92JZgrg5YMBsb0PoE9EP4FfKHTJyOIQbn4p2dz2DRE",
        eventType: "PIX_PAYMENT_UPDATED",
        authorizationScheme: "BEARER",
        url:
          node_env == "dev"
            ? `${ngrokBackendUrl}/pix/webhook/creditPix`
            : `${prodBackendUrl}/pix/webhook/creditPix`,
      },
    },
    {
      method: "POST",
      url: urlApi,
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "x-delbank-api-key": data.api_key,
      },
      data: {
        authorization:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiTUVNQkVSIiwidHlwZSI6Ik5BVFVSQUwiLCJzdWIiOiJjNDc4NTQwMS1iZGRhLTQwMzktOTI0ZC1hOTU0YzE0OWRmNDIiLCJpYXQiOjE3MDUzNzQ4NDIsImV4cCI6MTcwNzk2Njg0Mn0.P92JZgrg5YMBsb0PoE9EP4FfKHTJyOIQbn4p2dz2DRE",
        eventType: "TRANSACTION_CREATED",
        authorizationScheme: "BEARER",
        url:
          node_env == "dev"
            ? `${ngrokBackendUrl}/pix/webhook/creditPix`
            : `${prodBackendUrl}/pix/webhook/creditPix`,
      },
    },
  ];

  try {
    const response = await api.get(urlApi, {
      headers: {
        accept: "application/json",
        "x-delbank-api-key": data.api_key,
      },
    });
    const webhooks = response.data as any[];

    console.log(
      "\n",
      webhooks.length,
      webhooks.map((w) => w.eventType),
    );

    for (const opt of options) {
      const wbToUpdate = webhooks.find(
        (w) => w.eventType == opt.data.eventType,
      );

      if (wbToUpdate) {
        await api.patch(`${urlApi}/${wbToUpdate.id}`, opt.data, {
          headers: {
            accept: "application/json",
            "x-delbank-api-key": data.api_key,
          },
        });

        console.log(
          "\n\nWebhook atualizado: ",
          wbToUpdate.eventType,
          data.api_key,
          "\n\n",
        );
      }
    }
  } catch (error) {}

  options.map(async (opt) => {
    try {
      await api.request(opt);
      console.log("Criando webhook desaparecido:", opt.data.eventType);
    } catch (error) {
      console.log("Criacao::", error);

      console.log("webhook existente ignorado:", opt.data.eventType);
    }
  });
}
