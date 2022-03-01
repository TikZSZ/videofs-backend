import { User } from "@prisma/client";
import {IsEmail, IsOptional, IsString,Length, MinLength} from "class-validator"
import {} from "class-transformer"

export class UserDTO implements Partial<User> {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  name: string;

  @IsString()
  @Length(8)
  password: string;

  @IsString()
  @Length(10,10)
  phoneNumber: string;

  @IsString()
  //@IsIn([])
  state:string;

  @IsString()
  //@IsIn([])
  city:string

}

export class LoginDTO {

  @IsString()
  @MinLength(10)
  phoneNumber: string;

  @IsString()
  password: string;
}