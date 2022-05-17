import { User } from "@prisma/client";
export declare class PhoneNumberDTO {
    phoneNumber: string;
}
export declare class UserDTO extends PhoneNumberDTO implements Partial<User> {
    email?: string;
    name: string;
    password: string;
    state: string;
    city: string;
}
export declare class LoginDTO extends PhoneNumberDTO {
    password: string;
}
export declare class VerifyPhoneNumDto extends PhoneNumberDTO {
    otp: string;
}
