import { v4 as uuidv4 } from "uuid";

export default function generateIdempotencyKey(): string {
  const idempotencyKey = uuidv4();
  return idempotencyKey;
}
