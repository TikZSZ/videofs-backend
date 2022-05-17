import { DynamicModule, Provider, ModuleMetadata } from '@nestjs/common';
import { Options as Web3ModuleOptions } from './ipfs.service';
export interface Type<T = any> extends Function {
    new (...args: any[]): T;
}
interface Web3ModuleOptionFactory {
    createWeb3Options(): Promise<Web3ModuleOptions> | Web3ModuleOptions;
}
export interface Web3ModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
    useExisting?: Type<Web3ModuleOptionFactory>;
    useClass?: Type<Web3ModuleOptionFactory>;
    useFactory?: (...args: any[]) => Promise<Web3ModuleOptions> | Web3ModuleOptions;
    inject?: any[];
    extraProviders?: Provider[];
}
export declare class Web3Module {
    static regitser(options: Web3ModuleOptions): {
        module: typeof Web3Module;
        providers: {
            provide: string;
            useValue: Web3ModuleOptions;
        };
    };
    static registerAsync(options: Web3ModuleAsyncOptions): DynamicModule;
    static createWeb3Providers(options: Web3ModuleAsyncOptions): ({
        provide: string;
        useFactory: (...args: any[]) => Web3ModuleOptions | Promise<Web3ModuleOptions>;
        inject: any[];
    } | {
        provide: Type<Web3ModuleOptionFactory>;
        useClass: Type<Web3ModuleOptionFactory>;
    })[];
    static createAsyncWeb3Providers(options: Web3ModuleAsyncOptions): {
        provide: string;
        useFactory: (...args: any[]) => Web3ModuleOptions | Promise<Web3ModuleOptions>;
        inject: any[];
    };
}
export {};
