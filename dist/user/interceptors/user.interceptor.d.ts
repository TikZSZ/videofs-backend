import { User } from "@prisma/client";
export declare class UserEntity implements Partial<User> {
    id: number;
    name: string;
    email: string;
    createdAt: Date;
    password: string;
    phoneNumber: string;
    constructor(partial: Partial<UserEntity>);
}
