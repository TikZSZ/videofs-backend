import { NestMiddleware } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { IJwtToken } from "../types/JwtToken";
export declare class AuthMiddleWare<T extends object = IJwtToken> implements NestMiddleware {
    private jwtService;
    constructor(jwtService: JwtService);
    use(req: Request, res: any, next: () => void): Promise<void>;
}
