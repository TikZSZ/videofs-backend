import { User, Auth } from '@prisma/client';
export declare class UserEntity implements Partial<User & Auth> {
    id: number;
    name: string;
    createdAt: string;
    userCid: string;
    authAccountId: string;
    signature: string;
    accountId: string;
    token: string;
    constructor(partial: Partial<User & Auth | any>);
}
