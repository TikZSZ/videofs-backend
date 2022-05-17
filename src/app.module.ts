import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
  ValidationPipe,
} from '@nestjs/common';
import { AuthMiddleWare } from './global/middlewares/authMiddleware';
import { AppController } from './app.controller';
import { UserModule } from './user/user.module';
import { APP_PIPE } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ChannelModule } from './channel/channel.module';
import session from 'cookie-session';
import {BullModule} from "@nestjs/bull" 
import { EventEmitterModule } from '@nestjs/event-emitter';

const ENV = process.env.NODE_ENV;
const isProd = ENV === 'production';

const CookieProdConfig = {
  secure: true,
  httpOnly: true,
  sameSite: 'none',
  signed: false,
  maxAge: 10000000,
};

const CookieDevConfig = {
  secureProxy: true,
  httpOnly: false,
  signed: false,
  sameSite: 'none',
};

const redisOptions = {
  host:"localhost",
  port:6379
}

@Module({
  imports: [
    UserModule,
    ConfigModule.forRoot({
      envFilePath: `.env.${ENV ? ENV : 'dev'}`,
      isGlobal: true,
    }),
    ChannelModule,
    BullModule.forRoot({
      redis:redisOptions
    }),
    EventEmitterModule.forRoot({})
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        session( isProd ? CookieProdConfig : CookieDevConfig as any),
      )
      .forRoutes("*")
      .apply(AuthMiddleWare)
      .forRoutes({ method: RequestMethod.ALL, path: '*' });
  }
}
