"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const user_dto_1 = require("./dtos/user.dto");
const user_interceptor_1 = require("./interceptors/user.interceptor");
const user_service_1 = require("./user.service");
const jwt_1 = require("@nestjs/jwt");
const token_param_1 = require("../global/decorators/token.param");
let UserController = class UserController {
    constructor(userService, jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }
    user() {
        return "Hello world";
    }
    async signUp(userPayload, req) {
        console.log("helllo");
        const user = await this.userService.signUp(userPayload);
        const token = await this.getToken(user);
        req.headers.authorization = `Bearer ${token}`;
        return new user_interceptor_1.UserEntity(user);
    }
    async signIn(userPayload, req) {
        const user = await this.userService.signIn(userPayload);
        const token = await this.getToken(user);
        req.headers.authorization = `Bearer ${token}`;
        return new user_interceptor_1.UserEntity(user);
    }
    async auth(jwtToken) {
        const user = await this.userService.auth(jwtToken.id);
        return new user_interceptor_1.UserEntity(user);
    }
    async getToken(user) {
        const tokenData = {
            id: user.id,
            name: user.name,
            phoneNumber: user.phoneNumber
        };
        const token = await this.jwtService.signAsync(JSON.stringify(tokenData));
        return `Bearer ${token}`;
    }
};
__decorate([
    (0, common_1.Get)("/user"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UserController.prototype, "user", null);
__decorate([
    (0, common_1.Post)("/signup"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_dto_1.UserDTO, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "signUp", null);
__decorate([
    (0, common_1.Post)("/signin"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_dto_1.LoginDTO, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "signIn", null);
__decorate([
    (0, common_1.Post)("/auth"),
    __param(0, (0, token_param_1.JwtToken)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "auth", null);
UserController = __decorate([
    (0, common_1.Controller)("api"),
    (0, common_1.UseInterceptors)(common_1.ClassSerializerInterceptor),
    __metadata("design:paramtypes", [user_service_1.UserService, jwt_1.JwtService])
], UserController);
exports.UserController = UserController;
//# sourceMappingURL=user.controller.js.map