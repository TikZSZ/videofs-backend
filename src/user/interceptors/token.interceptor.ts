import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { User } from "@prisma/client";
import { Response, Request } from "express";
import { map, Observable, tap } from "rxjs";
import { IJwtToken } from "src/global/types/JwtToken";
import { UserEntity } from "./sanitizer";


@Injectable()
export class UserResponseInterceptor implements NestInterceptor {
  constructor(private jwtService: JwtService) { }

  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(map(async (data: UserEntity) => {
      const httpHandler = context.switchToHttp()
      const res = httpHandler.getResponse() as Response
      const token = await this.getToken({
        authAccountId:data.authAccountId,
        id:data.id,
        accountId:data.accountId,
      });
      const req = httpHandler.getRequest() as Request
      req.session['user'] = token;
      return data
    }))
  }

  async getToken(user: any) {
    let token = await this.jwtService.signAsync(JSON.stringify(user))
    return token
  }
}

@Injectable()
export class AuthResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(map(async (data: any) => {
      if(!(data === null) && data){
        delete data.signature
      }
      return data
    }))
  }
}