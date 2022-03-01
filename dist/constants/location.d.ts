import { OnModuleInit } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
export declare class Init implements OnModuleInit {
    private prisma;
    constructor(prisma: PrismaService);
    onModuleInit(): Promise<void>;
    initializeLocation(): Promise<import(".prisma/client").State[]>;
}
