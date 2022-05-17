"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const authMiddleware_1 = require("./global/middlewares/authMiddleware");
const app_controller_1 = require("./app.controller");
const user_module_1 = require("./user/user.module");
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const channel_module_1 = require("./channel/channel.module");
const cookie_session_1 = __importDefault(require("cookie-session"));
const bull_1 = require("@nestjs/bull");
const event_emitter_1 = require("@nestjs/event-emitter");
const ENV = process.env.NODE_ENV;
const isProd = ENV === 'production';
const CookieProdConfig = {
    secure: true,
    httpOnly: true,
    sameSite: 'none',
    signed: false,
    maxAge: 10000000,
};
const CookieDevConfig = {
    secureProxy: true,
    httpOnly: false,
    signed: false,
    sameSite: 'none',
};
const redisOptions = {
    host: "localhost",
    port: 6379
};
let AppModule = class AppModule {
    configure(consumer) {
        consumer
            .apply((0, cookie_session_1.default)(isProd ? CookieProdConfig : CookieDevConfig))
            .forRoutes("*")
            .apply(authMiddleware_1.AuthMiddleWare)
            .forRoutes({ method: common_1.RequestMethod.ALL, path: '*' });
    }
};
AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            user_module_1.UserModule,
            config_1.ConfigModule.forRoot({
                envFilePath: `.env.${ENV ? ENV : 'dev'}`,
                isGlobal: true,
            }),
            channel_module_1.ChannelModule,
            bull_1.BullModule.forRoot({
                redis: redisOptions
            }),
            event_emitter_1.EventEmitterModule.forRoot({})
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            {
                provide: core_1.APP_PIPE,
                useClass: common_1.ValidationPipe,
            },
        ],
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map