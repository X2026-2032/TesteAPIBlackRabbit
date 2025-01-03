import { verifyJwt } from "@/http/middlewares/verify-jwt";
import { FastifyInstance } from "fastify";
import { CreateDeviceController } from "./create-device";
import { ListDevicesController } from "./list-devices";
import { UpdateDeviceController } from "./update-device";
import { DeleteDeviceController } from "./delete-device";
import { GetCurrentDevice } from "./get-device";

export async function DeviceRoutes(app: FastifyInstance) {
  app.post("/device", { onRequest: [verifyJwt] }, CreateDeviceController);
  app.get("/devices", { onRequest: [verifyJwt] }, ListDevicesController);
  app.get("/current-device", { onRequest: [verifyJwt] }, GetCurrentDevice);
  app.patch("/device", { onRequest: [verifyJwt] }, UpdateDeviceController);
  app.delete("/device", { onRequest: [verifyJwt] }, DeleteDeviceController);
}
