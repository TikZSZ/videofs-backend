import { DynamicModule, ModuleMetadata, Provider } from '@nestjs/common';
import { ServerUtil } from "liblogin-serv";
declare type token = string;
interface LibLoginModuleOption {
    domainUrl: string;
    privateKey: string;
    mirrorNodeUrl: string;
}
export interface Type<T = any> extends Function {
    new (...args: any[]): T;
}
interface Web3ModuleOptionFactory {
    createWeb3Options(): Promise<LibLoginModuleOption> | LibLoginModuleOption;
}
export interface Web3ModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
    useExisting?: Type<Web3ModuleOptionFactory>;
    useClass?: Type<Web3ModuleOptionFactory>;
    useFactory?: (...args: any[]) => Promise<LibLoginModuleOption> | LibLoginModuleOption;
    inject?: any[];
    extraProviders?: Provider[];
}
export declare class LibLoginService extends ServerUtil<token> {
    private options;
    constructor(options: LibLoginModuleOption);
}
export declare class LibLoginModule {
    static register(options: LibLoginModuleOption): {
        module: typeof LibLoginModule;
        providers: {
            provide: string;
            useValue: LibLoginModuleOption;
        };
    };
    static registerAsync(options: Web3ModuleAsyncOptions): DynamicModule;
    static createWeb3Providers(options: Web3ModuleAsyncOptions): ({
        provide: string;
        useFactory: (...args: any[]) => LibLoginModuleOption | Promise<LibLoginModuleOption>;
        inject: any[];
    } | {
        provide: Type<Web3ModuleOptionFactory>;
        useClass: Type<Web3ModuleOptionFactory>;
    })[];
    static createAsyncWeb3Providers(options: Web3ModuleAsyncOptions): {
        provide: string;
        useFactory: (...args: any[]) => LibLoginModuleOption | Promise<LibLoginModuleOption>;
        inject: any[];
    };
}
export {};
