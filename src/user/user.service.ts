import { LibLoginService } from './LibLoginModule';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Auth, Channel, Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { randomBytes } from 'crypto';
import { PublicKey } from '@hashgraph/sdk';
import { IJwtToken } from 'src/global/types/JwtToken';
import {ServerUtil, SignedPayload} from "liblogin-serv"
type UserReturnType = Auth & User & Partial<Channel>;

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService, private libLoginService:LibLoginService) {}

  async getCurrentUser(token: IJwtToken): Promise<UserReturnType> {
    if (!token || !token.id) throw new BadRequestException();
    let { auth, ...rest } = await this.prisma.user.findUnique({
      where: {
        id: token.id,
      },
      include: {
        auth: true,
        channel: {
          select: {
            id: true,
            channelCid: true,
          },
        },
      },
    });
    if (!rest || !auth) throw new NotFoundException();
    return { ...auth, ...rest };
  }

  async createUser(
    data: { signedPayload: SignedPayload,signature:string, name:string },
    accountId:string
  ): Promise<UserReturnType> {
    // get saved token for user
    const auth = await this.prisma.auth.findUnique({
      where: { accountId: accountId },
    });
    if (!auth) throw new BadRequestException();

    // check if user signed
    // const isCorrect = PublicKey.fromString(auth.key).verify(
    //   Buffer.from(auth.token, 'base64'),
    //   Buffer.from(authInfo.signature, 'base64'),
    // );
    // if (!isCorrect) throw new UnauthorizedException();
    const hasUserSigend = this.libLoginService.verifyPayloadSig(auth.key,data.signedPayload,data.signature)
    if (!hasUserSigend) throw new UnauthorizedException();
    
    // // update auth record to house signature
    // await this.prisma.auth.update({
    //   where: { accountId: authInfo.accountId },
    //   data: { signature: authInfo.signature },
    // });

    // create user
    let createdAt = this.getCurrentTime();
    const { auth: a, ...rest } = await this.prisma.user.create({
      data: {
        name:data.name,
        createdAt,
        auth: {
          connect: {
            accountId: accountId,
          },
        },
      },
      include: {
        auth: true,
        channel: {
          select: {
            id: true,
            channelCid: true,
          },
        },
      },
    });
    return { ...a, ...rest };
  }

  async generateToken(
    accountId: string,
  ) {
    const {key} = await this.libLoginService.validateAccountId(accountId)
    const token = randomBytes(32).toString('base64');
    const auth = await this.prisma.auth.create({
      data: {
        token: token,
        accountId,
        key:key.key,
        keyType:key.keyType
      },
      select: { token: true, accountId: true },
    });
    return {token:this.libLoginService.getPayloadToSign(token),accountId}
  }

  async getSigToken(accountId: string) {
    let auth = await this.prisma.auth.findUnique({
      where: {
        accountId,
      },
      select: {
        token: true,
        accountId: true,
      },
    });
    if (!auth.token) throw new NotFoundException();
    const payLoadToSign = this.libLoginService.getPayloadToSign(auth.token)
    return {token:payLoadToSign,accountId};
  }

  async loginUser(
    data: { signedPayload: SignedPayload,signature:string },
    accountId: string,
  ): Promise<UserReturnType> {
    const { user, ...rest } = await this.prisma.auth.findUnique({
      where: {
        accountId: accountId,
      },
      include: {
        user: {
          include: {
            channel: {
              select: {
                id: true,
                channelCid: true,
              },
            },
          },
        },
      },
    });
    if (!user) throw new NotFoundException();
    const hasUserSigend = this.libLoginService.verifyPayloadSig(rest.key,data.signedPayload,data.signature)
    // const { signature } = rest;
    // if (!(signature === data.signature)) throw new UnauthorizedException();
    if(!hasUserSigend) throw new UnauthorizedException();
    return { ...user, ...rest };
  }

  async getUser(accountId: string): Promise<UserReturnType> {
    const auth = await this.prisma.auth.findUnique({
      where: {
        accountId,
      },
      include: {
        user: {
          include: {
            channel: {
              select: {
                id: true,
                channelCid: true,
              },
            },
          },
        },
      },
    });
    if(!auth) throw new NotFoundException()
    const {user,...rest} = auth
    return { ...user, ...rest };
  }

  async addDI(accountId: string, DICid: string) {
    const auth = await this.prisma.auth.findUnique({
      where: { accountId: accountId },
    });
    if (auth.diCid !== null)
      throw new BadRequestException('Cannot modify DICid Once it is set');
    return this.prisma.auth.update({
      where: { accountId: accountId },
      data: {
        diCid: DICid,
      },
    });
  }

  async updateUser(accountId: string, data: Prisma.UserUpdateInput) {
    const user = await this.prisma.user.findFirst({
      where: { authAccountId: accountId },
      include: { auth: true },
    });
    if (data.topicId && user.topicId)
      throw new BadRequestException(
        'Cannot modify user topic id Once it is set',
      );
    if ((data as any).diCid && user.auth.diCid === null)
      throw new BadRequestException('Cannot set user cid without DI');
    if (data.userCid && user.userCid !== null)
      throw new BadRequestException('Cannot modify UserCId Once it is set');
    return this.prisma.user.update({
      where: { authAccountId: accountId },
      data: {
        ...data,
      },
    });
  }

  private getCurrentTime() {
    return new Date().toUTCString();
  }
}
