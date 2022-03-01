import { Injectable, NestMiddleware } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { IJwtToken } from "../types/JwtToken";

@Injectable()
export class AuthMiddleWare implements NestMiddleware{
  constructor( private jwtService: JwtService){}

  async use(req: Request, res: any, next: () => void) {
    const token = req.headers.authorization

    if(!token) return next()
    
    const t = token.split(" ")
    let error:boolean = false
    
    if(!(t.length === 2) ) error = true
    if(t[0] !== "Bearer") error = true
    if(t[1].length < 1) error = true
    
    let jwtData:IJwtToken = await this.jwtService.verifyAsync(t[1])
      .catch(err => error = true )
 
    if(!error) req.user = jwtData
    next()
  }
}