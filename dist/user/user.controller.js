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
const sanitizer_1 = require("./interceptors/sanitizer");
const user_service_1 = require("./user.service");
const jwt_decorator_1 = require("../global/decorators/jwt.decorator");
const client_1 = require("@prisma/client");
const token_interceptor_1 = require("./interceptors/token.interceptor");
const auth_guard_1 = require("../global/guards/auth.guard");
let UserController = class UserController {
    constructor(userService) {
        this.userService = userService;
    }
    async getSigToken(accountId) {
        return await this.userService.getSigToken(accountId);
    }
    async createToken(accountId) {
        return this.userService.generateToken(accountId);
    }
    async createUser(data, accountId, req) {
        const createdUser = await this.userService.createUser(Object.assign({}, data), accountId);
        return new sanitizer_1.UserEntity(createdUser);
    }
    async loginUser(data, accountId) {
        const user = await this.userService.loginUser(data, accountId);
        return new sanitizer_1.UserEntity(user);
    }
    async getCurrentUser(token) {
        const user = await this.userService.getCurrentUser(token);
        return new sanitizer_1.UserEntity(user);
    }
    async getUser(accountId) {
        const user = await this.userService.getUser(accountId);
        const resp = {};
        if (!user)
            return null;
        user.accountId ? (resp['hasToken'] = true) : false;
        user && user.id ? (resp['isRegistered'] = true) : false;
        return Object.assign(Object.assign({}, user), resp);
    }
    async addDI(accountId, data) {
        const auth = await this.userService.addDI(accountId, data.diCid);
        return { diCid: auth.diCid };
    }
    async addUserCID(accountId, data) {
        const user = await this.userService.updateUser(accountId, data);
        return Object.assign({}, user);
    }
    logOut(req) {
        req.session['user'] = null;
        return;
    }
};
__decorate([
    (0, common_1.Get)('/:accountid/token'),
    __param(0, (0, common_1.Param)('accountid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getSigToken", null);
__decorate([
    (0, common_1.Post)('/:accountid/token'),
    __param(0, (0, common_1.Param)('accountid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "createToken", null);
__decorate([
    (0, common_1.Post)('/:accountid/signup'),
    (0, common_1.UseInterceptors)(token_interceptor_1.UserResponseInterceptor, common_1.ClassSerializerInterceptor),
    __param(0, (0, common_1.Body)('data')),
    __param(1, (0, common_1.Param)('accountid')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "createUser", null);
__decorate([
    (0, common_1.Post)('/:accountid/login'),
    (0, common_1.UseInterceptors)(token_interceptor_1.UserResponseInterceptor, common_1.ClassSerializerInterceptor),
    __param(0, (0, common_1.Body)('data')),
    __param(1, (0, common_1.Param)('accountid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "loginUser", null);
__decorate([
    (0, common_1.Get)('/user'),
    (0, common_1.UseInterceptors)(common_1.ClassSerializerInterceptor),
    __param(0, (0, jwt_decorator_1.GetJwtToken)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getCurrentUser", null);
__decorate([
    (0, common_1.Get)('/:accountid'),
    (0, common_1.UseInterceptors)(common_1.ClassSerializerInterceptor),
    __param(0, (0, common_1.Param)('accountid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getUser", null);
__decorate([
    (0, common_1.Post)('/:accountid/di'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.UseInterceptors)(common_1.ClassSerializerInterceptor),
    __param(0, (0, common_1.Param)('accountid')),
    __param(1, (0, common_1.Body)('data')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "addDI", null);
__decorate([
    (0, common_1.Put)('/:accountid'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.UseInterceptors)(common_1.ClassSerializerInterceptor),
    __param(0, (0, common_1.Param)('accountid')),
    __param(1, (0, common_1.Body)('data')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "addUserCID", null);
__decorate([
    (0, common_1.Post)('/logout'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "logOut", null);
UserController = __decorate([
    (0, common_1.Controller)('/users'),
    (0, common_1.UseInterceptors)(token_interceptor_1.AuthResponseInterceptor),
    __metadata("design:paramtypes", [user_service_1.UserService])
], UserController);
exports.UserController = UserController;
//# sourceMappingURL=user.controller.js.map