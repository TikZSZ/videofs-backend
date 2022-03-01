import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { IJwtToken } from 'src/global/types/JwtToken';
export declare class UserService {
    private prisma;
    constructor(prisma: PrismaService);
    signUp(userPayload: Prisma.UserCreateWithoutCityInput & {
        state: string;
        city: string;
    }): Promise<import(".prisma/client").User>;
    auth(userId: IJwtToken['id']): Promise<import(".prisma/client").User>;
    signIn(payload: {
        phoneNumber: string;
        password: string;
    }): Promise<import(".prisma/client").User>;
    compare(pswd: string, hashPswd: string): Promise<boolean>;
    hashPass(pswd: string): Promise<string>;
}
