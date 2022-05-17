"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.set('trust proxy', true);
    app.enableCors({
        credentials: true,
        methods: ['GET', 'PUT', 'POST', 'PATCH'],
        origin: process.env.NODE_ENV === 'production'
            ? 'https://dmaill.vercel.app'
            : 'https://localhost:3000',
        exposedHeaders: ['SET-COOKIE'],
    });
    await app.listen(5000);
}
bootstrap();
//# sourceMappingURL=main.js.map