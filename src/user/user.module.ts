import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: 'asdf',
    }),
  ],
  controllers: [UserController],
  providers: [UserService, PrismaService],
  exports: [PrismaService, JwtModule,UserService],
})
export class UserModule {}
