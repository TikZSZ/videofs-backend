import {
  Module,
  DynamicModule,
  HttpModuleAsyncOptions,
  Provider,
  ModuleMetadata,
} from '@nestjs/common';
import { Options as Web3ModuleOptions, Web3Service } from './ipfs.service';
import { WEB_3_CONFIG } from './web3.service.constant';

export interface Type<T = any> extends Function {
  new (...args: any[]): T;
}

interface Web3ModuleOptionFactory {
  createWeb3Options(): Promise<Web3ModuleOptions> | Web3ModuleOptions;
}

export interface Web3ModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<Web3ModuleOptionFactory>;
  useClass?: Type<Web3ModuleOptionFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<Web3ModuleOptions> | Web3ModuleOptions;
  inject?: any[];
  extraProviders?: Provider[];
}

@Module({
  providers: [Web3Service],
  exports: [Web3Service],
})
export class Web3Module {
  static regitser(options: Web3ModuleOptions) {
    return {
      module: Web3Module,
      providers: {
        provide: WEB_3_CONFIG,
        useValue: options,
      },
    };
  }

  static registerAsync(options: Web3ModuleAsyncOptions): DynamicModule {
    return {
      module: Web3Module,
      imports: options.imports || [],
      providers: this.createWeb3Providers(options),
    };
  }

  static createWeb3Providers(options: Web3ModuleAsyncOptions) {
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

  static createAsyncWeb3Providers(options: Web3ModuleAsyncOptions) {
    if (options.useFactory) {
      return {
        provide: WEB_3_CONFIG,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    return {
      provide: WEB_3_CONFIG,
      useFactory: async (factoryOptions: Web3ModuleOptionFactory) => await factoryOptions.createWeb3Options(),
      inject: [options.useExisting || options.useClass],
    };
  }
}
