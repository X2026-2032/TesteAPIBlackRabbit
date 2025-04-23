import { FastifyInstance } from "fastify";
import {
  getSheets,
  createSheet,
  updateSheet,
  deleteSheet,
  deleteAllSheets,
  duplicateSheet,
} from "./sheetsController";

export async function sheetsRoutes(fastify: FastifyInstance) {
  fastify.get("/sheets/all", getSheets);
  fastify.post("/sheets", createSheet);
  fastify.post("/sheets/:id/duplicate", duplicateSheet);
  fastify.patch("/sheets/:id", updateSheet);
  fastify.delete("/sheets/:id", deleteSheet);
  fastify.delete("/sheets/all", deleteAllSheets);
}
