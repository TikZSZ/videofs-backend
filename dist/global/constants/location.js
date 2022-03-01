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
exports.Init = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
const states_1 = require("./states");
let Init = class Init {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async onModuleInit() {
        await this.initializeLocation();
    }
    async initializeLocation() {
        const s = await this.prisma.state.findMany();
        if (s.length > 0) {
            return;
        }
        const statePromises = Object.values(states_1.states).map((state) => {
            return this.prisma.state.create({
                data: {
                    name: state.name,
                    cities: {
                        create: Object.values(state.cities)
                    }
                }
            });
        });
        const settledStates = await Promise.all(statePromises);
        console.log(settledStates);
        return settledStates;
    }
};
Init = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], Init);
exports.Init = Init;
//# sourceMappingURL=location.js.map