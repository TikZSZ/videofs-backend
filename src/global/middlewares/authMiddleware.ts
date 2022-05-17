import { Injectable, NestMiddleware } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { IJwtToken } from "../types/JwtToken";

@Injectable()
export class AuthMiddleWare<T extends object = IJwtToken > implements NestMiddleware {
  constructor( private jwtService: JwtService){}
  async use(req: Request, res: any, next: () => void) {
    const userJwt = req.session.user as string|undefined;
    if(userJwt){
      const user = this.jwtService.verify(userJwt) as T
      req["user"] = user as IJwtToken
    }
    next()
  }
}