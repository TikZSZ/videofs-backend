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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const bcrypt_1 = require("bcrypt");
let UserService = class UserService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async signUp(userPayload) {
        const { city, state, password } = userPayload, rest = __rest(userPayload, ["city", "state", "password"]);
        const existingCity = await this.prisma.city.findFirst({
            where: {
                name: city,
                state: {
                    name: state
                }
            }
        });
        if (existingCity === undefined || null)
            throw new common_1.BadRequestException();
        const hashedPassword = await this.hashPass(password);
        return this.prisma.user.create({
            data: Object.assign(Object.assign({}, rest), { password: hashedPassword, city: {
                    connect: {
                        id: existingCity.id
                    }
                } })
        });
    }
    async auth(userId) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId
            }
        });
        if (!user)
            throw new common_1.NotFoundException();
        return user;
    }
    async signIn(payload) {
        const user = await this.prisma.user.findUnique({
            where: { phoneNumber: payload.phoneNumber }
        });
        if (!user)
            throw new common_1.NotFoundException();
        const correctPass = await this.compare(payload.password, user.password);
        if (!correctPass)
            throw new common_1.UnauthorizedException();
        return user;
    }
    compare(pswd, hashPswd) {
        return (0, bcrypt_1.compare)(pswd, hashPswd);
    }
    async hashPass(pswd) {
        const salt = await (0, bcrypt_1.genSalt)(10);
        const hashedPassword = await (0, bcrypt_1.hash)(pswd, salt);
        return hashedPassword;
    }
};
UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserService);
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map