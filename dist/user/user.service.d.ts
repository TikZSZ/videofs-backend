import { LibLoginService } from './LibLoginModule';
import { Auth, Channel, Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { IJwtToken } from 'src/global/types/JwtToken';
import { SignedPayload } from "liblogin-serv";
declare type UserReturnType = Auth & User & Partial<Channel>;
export declare class UserService {
    private prisma;
    private libLoginService;
    constructor(prisma: PrismaService, libLoginService: LibLoginService);
    getCurrentUser(token: IJwtToken): Promise<UserReturnType>;
    createUser(data: {
        signedPayload: SignedPayload;
        signature: string;
        name: string;
    }, accountId: string): Promise<UserReturnType>;
    generateToken(accountId: string): Promise<{
        token: {
            payload: {
                url: string;
                data: string;
            };
            serverSig: string;
        };
        accountId: string;
    }>;
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
    loginUser(data: {
        signedPayload: SignedPayload;
        signature: string;
    }, accountId: string): Promise<UserReturnType>;
    getUser(accountId: string): Promise<UserReturnType>;
    addDI(accountId: string, DICid: string): Promise<Auth>;
    updateUser(accountId: string, data: Prisma.UserUpdateInput): Promise<User>;
    private getCurrentTime;
}
export {};
