import { UserEntity } from './interceptors/sanitizer';
import { UserService } from './user.service';
import { IJwtToken } from 'src/global/types/JwtToken';
import { Prisma } from '@prisma/client';
import { Request } from 'express';
export declare class UserController {
    private userService;
    constructor(userService: UserService);
    getSigToken(accountId: string): Promise<{
        token: {
            payload: {
                url: string;
                data: string;
            };
            serverSig: string;
        };
        accountId: string;
    }>;
    createToken(accountId: string): Promise<{
        token: {
            payload: {
                url: string;
                data: string;
            };
            serverSig: string;
        };
        accountId: string;
    }>;
    createUser(data: {
        name: string;
        signedPayload: any;
        signature: string;
    }, accountId: string, req: Request): Promise<UserEntity>;
    loginUser(data: any, accountId: string): Promise<UserEntity>;
    getCurrentUser(token: IJwtToken): Promise<UserEntity>;
    getUser(accountId: string): Promise<{
        hasToken?: boolean;
        isRegistered?: true;
        accountId: string;
        token: string;
        signature: string;
        keyType: string;
        key: string;
        diCid: string;
        id: number;
        name: string;
        createdAt: string;
        userCid: string;
        authAccountId: string;
        topicId: string;
        description?: string;
        socials?: string;
        channelCid?: string;
        userId?: number;
    }>;
    addDI(accountId: string, data: {
        diCid: string;
    }): Promise<{
        diCid: string;
    }>;
    addUserCID(accountId: string, data: Prisma.UserUpdateInput): Promise<{
        id: number;
        name: string;
        createdAt: string;
        userCid: string;
        authAccountId: string;
        topicId: string;
    }>;
    logOut(req: Request): void;
}
