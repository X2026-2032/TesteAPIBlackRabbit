import { PrismaClient } from "@prisma/client";
export class SeedUsersBackOffice {
  constructor(private readonly prisma: PrismaClient) {}
  public async execute() {
    //select * from accounts where user_id = 'd43ec45d-61ca-44d7-a749-50c7a19fac3c'
    //delete from accounts_users where account_id='4cad9556-0a12-4079-9c3d-200944a35728'
    //delete from accounts_token where account_id='4cad9556-0a12-4079-9c3d-200944a35728'
    //delete from accounts where id='4cad9556-0a12-4079-9c3d-200944a35728'
    //delete from users where id='d43ec45d-61ca-44d7-a749-50c7a19fac3c'
  }
}
