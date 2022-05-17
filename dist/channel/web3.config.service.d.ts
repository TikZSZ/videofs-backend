import { ConfigService } from '@nestjs/config';
export declare class Web3ConfigService {
    private configService;
    constructor(configService: ConfigService);
    createWeb3Options(): {
        token: any;
    };
}
