import { Prisma, Address } from "@prisma/client";

export interface AddressRepository {
  create(data: Prisma.AddressCreateInput): Promise<Address>;
}
