
import { Prisma, User, Auth } from '@prisma/client';
import { Exclude, Type } from 'class-transformer';


export class UserEntity implements Partial<User & Auth> {
  id: number;
  name: string;
  createdAt: string;
  userCid: string;
  authAccountId: string;
  @Exclude()
  signature: string;
  @Exclude()
  accountId: string;
  @Exclude()
  token: string;
  constructor(partial: Partial<User & Auth | any>) {
    Object.assign(this, partial);
  }
}
