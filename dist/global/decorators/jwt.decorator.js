"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetJwtToken = void 0;
const common_1 = require("@nestjs/common");
exports.GetJwtToken = (0, common_1.createParamDecorator)((data = "user", ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return request[data];
});
//# sourceMappingURL=jwt.decorator.js.map