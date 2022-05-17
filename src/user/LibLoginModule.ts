import { DynamicModule, Inject, Injectable, Module, ModuleMetadata, Provider } from '@nestjs/common';
import {ServerUtil} from "liblogin-serv"

type token = string

const LIB_LOGIN_CONFIG = "llc"

interface LibLoginModuleOption{
  domainUrl:string,
  privateKey:string,
  mirrorNodeUrl:string
}

export interface Type<T = any> extends Function {
  new (...args: any[]): T;
}

interface Web3ModuleOptionFactory {
  createWeb3Options(): Promise<LibLoginModuleOption> | LibLoginModuleOption;
}

export interface Web3ModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<Web3ModuleOptionFactory>;
  useClass?: Type<Web3ModuleOptionFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<LibLoginModuleOption> | LibLoginModuleOption;
  inject?: any[];
  extraProviders?: Provider[];
}

@Injectable()
export class LibLoginService extends ServerUtil<token> {
  constructor(@Inject(LIB_LOGIN_CONFIG) private  options:LibLoginModuleOption){
    super(options.domainUrl,options.privateKey,options.mirrorNodeUrl)
  }
}

@Module({
  providers:[LibLoginService],
  exports:[LibLoginService]
})
export class LibLoginModule{
  static register(options: LibLoginModuleOption) {
    return {
      module: LibLoginModule,
      providers: {
        provide: LIB_LOGIN_CONFIG,
        useValue: options,
      },
    };
  }
  
  static registerAsync(options: Web3ModuleAsyncOptions): DynamicModule {
    return {
      module: LibLoginModule,
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
        provide: LIB_LOGIN_CONFIG,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }
  
    return {
      provide: LIB_LOGIN_CONFIG,
      useFactory: async (factoryOptions: Web3ModuleOptionFactory) => await factoryOptions.createWeb3Options(),
      inject: [options.useExisting || options.useClass],
    };
  }
}