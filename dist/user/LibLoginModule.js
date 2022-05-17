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
var LibLoginModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LibLoginModule = exports.LibLoginService = void 0;
const common_1 = require("@nestjs/common");
const liblogin_serv_1 = require("liblogin-serv");
const LIB_LOGIN_CONFIG = "llc";
let LibLoginService = class LibLoginService extends liblogin_serv_1.ServerUtil {
    constructor(options) {
        super(options.domainUrl, options.privateKey, options.mirrorNodeUrl);
        this.options = options;
    }
};
LibLoginService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(LIB_LOGIN_CONFIG)),
    __metadata("design:paramtypes", [Object])
], LibLoginService);
exports.LibLoginService = LibLoginService;
let LibLoginModule = LibLoginModule_1 = class LibLoginModule {
    static register(options) {
        return {
            module: LibLoginModule_1,
            providers: {
                provide: LIB_LOGIN_CONFIG,
                useValue: options,
            },
        };
    }
    static registerAsync(options) {
        return {
            module: LibLoginModule_1,
            imports: options.imports || [],
            providers: this.createWeb3Providers(options),
        };
    }
    static createWeb3Providers(options) {
        if (options.useFactory || options.useExisting) {
            return [this.createAsyncWeb3Providers(options)];
        }
        return [
            this.createAsyncWeb3Providers(options),
            {
                provide: options.useClass,
                useClass: options.useClass,
            },
        ];
    }
    static createAsyncWeb3Providers(options) {
        if (options.useFactory) {
            return {
                provide: LIB_LOGIN_CONFIG,
                useFactory: options.useFactory,
                inject: options.inject || [],
            };
        }
        return {
            provide: LIB_LOGIN_CONFIG,
            useFactory: async (factoryOptions) => await factoryOptions.createWeb3Options(),
            inject: [options.useExisting || options.useClass],
        };
    }
};
LibLoginModule = LibLoginModule_1 = __decorate([
    (0, common_1.Module)({
        providers: [LibLoginService],
        exports: [LibLoginService]
    })
], LibLoginModule);
exports.LibLoginModule = LibLoginModule;
//# sourceMappingURL=LibLoginModule.js.map