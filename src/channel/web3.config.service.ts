import { ConfigService } from '@nestjs/config';
import { Global, Injectable } from "@nestjs/common";


@Injectable()
export class Web3ConfigService {
  constructor(private configService:ConfigService){}

  createWeb3Options(){
    return {
      token:this.configService.get("WEB_3_TOKEN")
    }
  }
}