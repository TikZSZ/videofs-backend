import { ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtModule } from '@nestjs/jwt';
import { LibLoginModule } from './LibLoginModule';

@Module({
  imports: [
    JwtModule.register({
      secret: 'asdf',
    }),
    LibLoginModule.registerAsync({
      useFactory: (configService: ConfigService) => {
        return {
          domainUrl: configService.get('URL'),
          mirrorNodeUrl: configService.get('MIRROR_NODE'),
          privateKey: configService.get('PRIV_KEY'),
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [UserController],
  providers: [UserService, PrismaService],
  exports: [PrismaService, JwtModule, UserService],
})
export class UserModule {}
