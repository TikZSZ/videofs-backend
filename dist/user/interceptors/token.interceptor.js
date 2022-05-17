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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthResponseInterceptor = exports.UserResponseInterceptor = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const rxjs_1 = require("rxjs");
let UserResponseInterceptor = class UserResponseInterceptor {
    constructor(jwtService) {
        this.jwtService = jwtService;
    }
    intercept(context, next) {
        return next.handle().pipe((0, rxjs_1.map)(async (data) => {
            const httpHandler = context.switchToHttp();
            const res = httpHandler.getResponse();
            const token = await this.getToken({
                authAccountId: data.authAccountId,
                id: data.id,
                accountId: data.accountId,
            });
            const req = httpHandler.getRequest();
            req.session['user'] = token;
            return data;
        }));
    }
    async getToken(user) {
        let token = await this.jwtService.signAsync(JSON.stringify(user));
        return token;
    }
};
UserResponseInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], UserResponseInterceptor);
exports.UserResponseInterceptor = UserResponseInterceptor;
let AuthResponseInterceptor = class AuthResponseInterceptor {
    intercept(context, next) {
        return next.handle().pipe((0, rxjs_1.map)(async (data) => {
            if (!(data === null) && data) {
                delete data.signature;
            }
            return data;
        }));
    }
};
AuthResponseInterceptor = __decorate([
    (0, common_1.Injectable)()
], AuthResponseInterceptor);
exports.AuthResponseInterceptor = AuthResponseInterceptor;
//# sourceMappingURL=token.interceptor.js.map