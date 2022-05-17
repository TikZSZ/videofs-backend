import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseInterceptors,
  NotFoundException,
  UseGuards,
  Put,
} from '@nestjs/common';
import { UserEntity } from './interceptors/sanitizer';
import { UserService } from './user.service';
import { IJwtToken } from 'src/global/types/JwtToken';
import { GetJwtToken } from 'src/global/decorators/jwt.decorator';
import { Auth, Prisma, User } from '@prisma/client';
import {
  AuthResponseInterceptor,
  UserResponseInterceptor,
} from './interceptors/token.interceptor';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from 'src/global/guards/auth.guard';

@Controller('/users')
@UseInterceptors(AuthResponseInterceptor)
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/:accountid/token')
  async getSigToken(@Param('accountid') accountId: string) {
    return await this.userService.getSigToken(accountId);
  }

  @Post('/:accountid/token')
  async createToken(
    @Param('accountid') accountId: string,
  ) {
    return this.userService.generateToken(accountId);
  }

  @Post('/:accountid/signup')
  @UseInterceptors(UserResponseInterceptor, ClassSerializerInterceptor)
  async createUser(
    @Body('data') data: {name:string,signedPayload:any,signature:string},
    @Param('accountid') accountId: string,
    @Req() req: Request,
  ) {
    const createdUser = await this.userService.createUser({
     ...data
    },accountId);
    return new UserEntity(createdUser);
  }

  @Post('/:accountid/login')
  @UseInterceptors(UserResponseInterceptor, ClassSerializerInterceptor)
  async loginUser(
    @Body('data') data: any,
    @Param('accountid') accountId: string,
  ) {
    const user = await this.userService.loginUser(data, accountId);
    return new UserEntity(user);
  }

  @Get('/user')
  @UseInterceptors(ClassSerializerInterceptor)
  async getCurrentUser(@GetJwtToken() token: IJwtToken) {
    const user = await this.userService.getCurrentUser(token);
    return new UserEntity(user);
  }

  @Get('/:accountid')
  @UseInterceptors(ClassSerializerInterceptor)
  async getUser(@Param('accountid') accountId: string) {
    const user = await this.userService.getUser(accountId);
    const resp: {
      hasToken?: boolean;
      isRegistered?: true;
    } = {};
    if (!user) return null;
    user.accountId ? (resp['hasToken'] = true) : false;
    user && user.id ? (resp['isRegistered'] = true) : false;
    return { ...user, ...resp };
  }

  @Post('/:accountid/di')
  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async addDI(
    @Param('accountid') accountId: string,
    @Body('data') data: { diCid: string },
  ) {
    const auth = await this.userService.addDI(accountId, data.diCid);
    return { diCid: auth.diCid };
  }

  @Put('/:accountid')
  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async addUserCID(
    @Param('accountid') accountId: string,
    @Body('data') data: Prisma.UserUpdateInput,
  ) {
    const user = await this.userService.updateUser(accountId, data);
    return { ...user};
  }

  @Post('/logout')
  logOut(@Req() req: Request) {
    req.session['user'] = null;
    return;
  }
}
