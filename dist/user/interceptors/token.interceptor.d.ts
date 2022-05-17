import { CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Observable } from "rxjs";
export declare class UserResponseInterceptor implements NestInterceptor {
    private jwtService;
    constructor(jwtService: JwtService);
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>>;
    getToken(user: any): Promise<string>;
}
export declare class AuthResponseInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>>;
}
