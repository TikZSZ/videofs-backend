import { NestMiddleware } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
export declare class AuthMiddleWare implements NestMiddleware {
    private jwtService;
    constructor(jwtService: JwtService);
    use(req: Request, res: any, next: () => void): Promise<void>;
}
