"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const location_1 = require("./global/constants/location");
const middleware_1 = require("./global/middlewares/middleware");
const app_controller_1 = require("./app.controller");
const user_controller_1 = require("./user/user.controller");
const user_module_1 = require("./user/user.module");
let AppModule = class AppModule {
    configure(consumer) {
        consumer
            .apply(middleware_1.AuthMiddleWare)
            .forRoutes({ method: common_1.RequestMethod.ALL, path: "*" });
    }
};
AppModule = __decorate([
    (0, common_1.Module)({
        imports: [user_module_1.UserModule],
        controllers: [app_controller_1.AppController, user_controller_1.UserController],
        providers: [location_1.Init]
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map