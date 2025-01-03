import { IdezErrors } from "@/service/idez/idez-errors";
import { AppError } from "./app-error";

import { describe, expect, it } from "vitest";
describe("Error payload Idez", () => {
  it("Construct new", () => {
    const payload = {
      code: "validation.invalid_data",
      error: "Illuminate\\Validation\\ValidationException",
      message: "Os dados enviados são inválidos.",
      data: { amount: ["Saldo insuficiente para realizar a transação."] },
    };

    try {
      throw new IdezErrors().message({
        response: {
          data: payload,
        },
      } as unknown);
    } catch (error) {
      expect(new AppError(error).data).toEqual(payload.data);
    }
  });
});
