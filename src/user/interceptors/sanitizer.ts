import { User } from "@prisma/client";
import { Exclude } from "class-transformer";

export class UserEntity implements Partial<User> {
  id:number;
  name:string;
  email:string;
  createdAt: Date;
  
  @Exclude()
  password?:string;

  @Exclude()
  phoneNumber?:string;

  constructor(partial:Partial<UserEntity>){
    Object.assign(this,partial)
  }
}