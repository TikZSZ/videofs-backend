"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var Web3Module_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Web3Module = void 0;
const common_1 = require("@nestjs/common");
const ipfs_service_1 = require("./ipfs.service");
const web3_service_constant_1 = require("./web3.service.constant");
let Web3Module = Web3Module_1 = class Web3Module {
    static regitser(options) {
        return {
            module: Web3Module_1,
            providers: {
                provide: web3_service_constant_1.WEB_3_CONFIG,
                useValue: options,
            },
        };
    }
    static registerAsync(options) {
        return {
            module: Web3Module_1,
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
                provide: web3_service_constant_1.WEB_3_CONFIG,
                useFactory: options.useFactory,
                inject: options.inject || [],
            };
        }
        return {
            provide: web3_service_constant_1.WEB_3_CONFIG,
            useFactory: async (factoryOptions) => await factoryOptions.createWeb3Options(),
            inject: [options.useExisting || options.useClass],
        };
    }
};
Web3Module = Web3Module_1 = __decorate([
    (0, common_1.Module)({
        providers: [ipfs_service_1.Web3Service],
        exports: [ipfs_service_1.Web3Service],
    })
], Web3Module);
exports.Web3Module = Web3Module;
//# sourceMappingURL=ipfs.module.js.map