import { User } from "@prisma/client";
export declare class UserDTO implements Partial<User> {
    email?: string;
    name: string;
    password: string;
    phoneNumber: string;
    state: string;
    city: string;
}
export declare class LoginDTO {
    phoneNumber: string;
    password: string;
}
