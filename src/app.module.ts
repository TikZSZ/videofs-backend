import { MiddlewareConsumer, Module, NestModule, RequestMethod, ValidationPipe } from '@nestjs/common';
import { Init } from './global/constants/location';
import { AuthMiddleWare } from './global/middlewares/authMiddleware';
import { AppController } from './app.controller';
import { UserController } from './user/user.controller';
import { UserModule } from './user/user.module';
import { APP_PIPE } from '@nestjs/core';



@Module({
  imports:[UserModule],
  controllers:[AppController],
  providers: [Init, {
    provide: APP_PIPE,
    useClass: ValidationPipe,
  },]
})
export class AppModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleWare)
      .forRoutes({method:RequestMethod.ALL,path:"*"})
  }
}
