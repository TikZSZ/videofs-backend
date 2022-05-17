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
const LibLoginModule_1 = require("./LibLoginModule");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const crypto_1 = require("crypto");
let UserService = class UserService {
    constructor(prisma, libLoginService) {
        this.prisma = prisma;
        this.libLoginService = libLoginService;
    }
    async getCurrentUser(token) {
        if (!token || !token.id)
            throw new common_1.BadRequestException();
        let _a = await this.prisma.user.findUnique({
            where: {
                id: token.id,
            },
            include: {
                auth: true,
                channel: {
                    select: {
                        id: true,
                        channelCid: true,
                    },
                },
            },
        }), { auth } = _a, rest = __rest(_a, ["auth"]);
        if (!rest || !auth)
            throw new common_1.NotFoundException();
        return Object.assign(Object.assign({}, auth), rest);
    }
    async createUser(data, accountId) {
        const auth = await this.prisma.auth.findUnique({
            where: { accountId: accountId },
        });
        if (!auth)
            throw new common_1.BadRequestException();
        const hasUserSigend = this.libLoginService.verifyPayloadSig(auth.key, data.signedPayload, data.signature);
        if (!hasUserSigend)
            throw new common_1.UnauthorizedException();
        let createdAt = this.getCurrentTime();
        const _a = await this.prisma.user.create({
            data: {
                name: data.name,
                createdAt,
                auth: {
                    connect: {
                        accountId: accountId,
                    },
                },
            },
            include: {
                auth: true,
                channel: {
                    select: {
                        id: true,
                        channelCid: true,
                    },
                },
            },
        }), { auth: a } = _a, rest = __rest(_a, ["auth"]);
        return Object.assign(Object.assign({}, a), rest);
    }
    async generateToken(accountId) {
        const { key } = await this.libLoginService.validateAccountId(accountId);
        const token = (0, crypto_1.randomBytes)(32).toString('base64');
        const auth = await this.prisma.auth.create({
            data: {
                token: token,
                accountId,
                key: key.key,
                keyType: key.keyType
            },
            select: { token: true, accountId: true },
        });
        return { token: this.libLoginService.getPayloadToSign(token), accountId };
    }
    async getSigToken(accountId) {
        let auth = await this.prisma.auth.findUnique({
            where: {
                accountId,
            },
            select: {
                token: true,
                accountId: true,
            },
        });
        if (!auth.token)
            throw new common_1.NotFoundException();
        const payLoadToSign = this.libLoginService.getPayloadToSign(auth.token);
        return { token: payLoadToSign, accountId };
    }
    async loginUser(data, accountId) {
        const _a = await this.prisma.auth.findUnique({
            where: {
                accountId: accountId,
            },
            include: {
                user: {
                    include: {
                        channel: {
                            select: {
                                id: true,
                                channelCid: true,
                            },
                        },
                    },
                },
            },
        }), { user } = _a, rest = __rest(_a, ["user"]);
        if (!user)
            throw new common_1.NotFoundException();
        const hasUserSigend = this.libLoginService.verifyPayloadSig(rest.key, data.signedPayload, data.signature);
        if (!hasUserSigend)
            throw new common_1.UnauthorizedException();
        return Object.assign(Object.assign({}, user), rest);
    }
    async getUser(accountId) {
        const auth = await this.prisma.auth.findUnique({
            where: {
                accountId,
            },
            include: {
                user: {
                    include: {
                        channel: {
                            select: {
                                id: true,
                                channelCid: true,
                            },
                        },
                    },
                },
            },
        });
        if (!auth)
            throw new common_1.NotFoundException();
        const { user } = auth, rest = __rest(auth, ["user"]);
        return Object.assign(Object.assign({}, user), rest);
    }
    async addDI(accountId, DICid) {
        const auth = await this.prisma.auth.findUnique({
            where: { accountId: accountId },
        });
        if (auth.diCid !== null)
            throw new common_1.BadRequestException('Cannot modify DICid Once it is set');
        return this.prisma.auth.update({
            where: { accountId: accountId },
            data: {
                diCid: DICid,
            },
        });
    }
    async updateUser(accountId, data) {
        const user = await this.prisma.user.findFirst({
            where: { authAccountId: accountId },
            include: { auth: true },
        });
        if (data.topicId && user.topicId)
            throw new common_1.BadRequestException('Cannot modify user topic id Once it is set');
        if (data.diCid && user.auth.diCid === null)
            throw new common_1.BadRequestException('Cannot set user cid without DI');
        if (data.userCid && user.userCid !== null)
            throw new common_1.BadRequestException('Cannot modify UserCId Once it is set');
        return this.prisma.user.update({
            where: { authAccountId: accountId },
            data: Object.assign({}, data),
        });
    }
    getCurrentTime() {
        return new Date().toUTCString();
    }
};
UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, LibLoginModule_1.LibLoginService])
], UserService);
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map