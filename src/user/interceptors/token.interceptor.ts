import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { User } from "@prisma/client";
import { Response } from "express";
import { map, Observable, tap } from "rxjs";
import { IJwtToken } from "src/global/types/JwtToken";
import { UserEntity } from "./sanitizer";

@Injectable()
export class AuthResponseInterceptor implements NestInterceptor{
  constructor( private jwtService: JwtService){}

  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(map( async (data:UserEntity)=>{
      const httpHandler = context.switchToHttp()
      const res = httpHandler.getResponse() as Response
      const token = await this.getToken(data)
      res.setHeader('authorization',token)
      res.send(data)
    }))
  }
  async getToken(user:UserEntity){
    const tokenData:IJwtToken = {
      id:user.id,
      name:user.name,
      phoneNumber:user.phoneNumber
    }
    const token = await this.jwtService.signAsync(JSON.stringify(tokenData))
    return `Bearer ${token}`
  }
}