import { Address, Prisma, PrismaClient } from "@prisma/client";
import { AddressRepository } from "../addresses-repository";

const prisma = new PrismaClient();

export class PrismaAddressRepository implements AddressRepository {
  async create(data: Prisma.AddressCreateInput): Promise<Address> {
    return prisma.address.create({ data });
  }
}
