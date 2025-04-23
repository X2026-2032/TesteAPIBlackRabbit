import { FastifyReply, FastifyRequest } from "fastify";
import { readData, writeData } from "./utils/fileHandler";

export const getSheets = async (req: FastifyRequest, reply: FastifyReply) => {
  const data = readData();
  return reply.send(data);
};

export const createSheet = async (req: FastifyRequest, reply: FastifyReply) => {
  const { title, rows } = req.body as any;

  if (!title || !rows) {
    return reply.status(400).send({ error: "Dados inválidos" });
  }

  const data = readData();
  const newSheet = { id: Date.now(), title, rows };
  data.push(newSheet);
  writeData(data);
  return reply.status(201).send(newSheet);
};

export const duplicateSheet = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  const id = Number((req.params as any).id);
  const data = readData();
  const originalSheet = data.find((sheet) => sheet.id === id);

  if (!originalSheet) {
    return reply.status(404).send({ error: "Sheet não encontrado" });
  }

  // Cria uma cópia profunda
  const duplicatedSheet = {
    id: Date.now(), // Novo ID
    title: `${originalSheet.title} (Cópia)`,
    rows: JSON.parse(JSON.stringify(originalSheet.rows)),
  };

  data.push(duplicatedSheet);
  writeData(data);
  return reply.status(201).send(duplicatedSheet);
};

export const updateSheet = async (req: FastifyRequest, reply: FastifyReply) => {
  const id = Number((req.params as any).id);
  const { title, rows } = req.body as any;

  const data = readData();
  const index = data.findIndex((sheet) => sheet.id === id);

  if (index === -1) {
    return reply.status(404).send({ error: "Sheet não encontrado" });
  }

  if (title) data[index].title = title;
  if (rows) data[index].rows = rows;

  writeData(data);
  return reply.send(data[index]);
};

export const deleteSheet = async (req: FastifyRequest, reply: FastifyReply) => {
  const id = Number((req.params as any).id);
  const data = readData();
  const index = data.findIndex((sheet) => sheet.id === id);

  if (index === -1) {
    return reply.status(404).send({ error: "Sheet não encontrado" });
  }

  const removed = data.splice(index, 1)[0];
  writeData(data);
  return reply.send(removed);
};

export const deleteAllSheets = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  writeData([]);
  return reply.send({
    message: "Todos os sheets foram removidos com sucesso.",
  });
};
