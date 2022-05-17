import { User } from "@prisma/client";
import {IsEmail, IsOptional, IsPhoneNumber, IsString,Length, MaxLength, MinLength} from "class-validator"
import {} from "class-transformer"

export class PhoneNumberDTO{
  @IsString()
  @MinLength(10)
  @IsPhoneNumber("IN")
  phoneNumber: string;
}

export class UserDTO extends PhoneNumberDTO implements Partial<User> {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  name: string;

  @IsString()
  @Length(8)
  password: string;

  @IsString()
  //@IsIn([])
  state:string;

  @IsString()
  //@IsIn([])
  city:string

}

export class LoginDTO extends PhoneNumberDTO {
  @IsString()
  password: string;
}


export class VerifyPhoneNumDto extends PhoneNumberDTO {
  @MinLength(4)
  @MaxLength(4)
  @IsString()
  otp:string
}
