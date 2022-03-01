import { LoginDTO, UserDTO } from './dtos/user.dto';
import { UserEntity } from './interceptors/user.interceptor';
import { UserService } from './user.service';
import { JwtService } from "@nestjs/jwt";
import { IJwtToken } from 'src/global/types/JwtToken';
import { Request as Req } from 'express';
export declare class UserController {
    private userService;
    private jwtService;
    constructor(userService: UserService, jwtService: JwtService);
    user(): string;
    signUp(userPayload: UserDTO, req: Req): Promise<UserEntity>;
    signIn(userPayload: LoginDTO, req: Req): Promise<UserEntity>;
    auth(jwtToken: IJwtToken): Promise<UserEntity>;
    private getToken;
}
