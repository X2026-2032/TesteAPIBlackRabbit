import { FastifyReply, FastifyRequest } from "fastify";
import { readData, writeData } from "./utils/fileHandler";

export const getSheets = async (req: FastifyRequest, reply: FastifyReply) => {
  const data = readData();
  return reply.send(JSON.stringify(data)); // <-- aqui transforma o array em string
};

export const createSheet = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { title, rows, columns, columnWidths, updatedAt, createdAt } =
      req.body as any;

    if (!title || !rows) {
      return reply.status(400).send({ error: "Dados inválidos" });
    }

    const data = readData();

    const newSheet = {
      id: Date.now(),
      title,
      rows,
      columns,
      columnWidths,
      updatedAt,
      createdAt,
      rowsCount: rows.length,
    };

    data.push(newSheet);
    writeData(data);

    return reply.status(201).send(newSheet);
  } catch (error) {
    return reply.status(500).send({ error: "Erro interno ao criar planilha" });
  }
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

  // Cria uma cópia profunda completa
  const now = new Date().toISOString();
  const duplicatedSheet = {
    ...JSON.parse(JSON.stringify(originalSheet)),
    id: Date.now(),
    title: `${originalSheet.title} (Cópia)`,
    createdAt: now,
    updatedAt: now,
  };

  data.push(duplicatedSheet);
  writeData(data);
  return reply.status(201).send(duplicatedSheet);
};

export const updateSheet = async (req: FastifyRequest, reply: FastifyReply) => {
  const id = Number((req.params as any).id);
  const { title, rows, columns, columnWidths, updatedAt } = req.body as any;

  const data = readData();
  const index = data.findIndex((sheet) => sheet.id === id);

  if (index === -1) {
    return reply.status(404).send({ error: "Sheet não encontrado" });
  }

  if (title) data[index].title = title;
  if (rows) data[index].rows = rows;
  if (columns) data[index].columns = columns;
  if (columnWidths) data[index].columnWidths = columnWidths;
  if (updatedAt) data[index].updatedAt = updatedAt;

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
