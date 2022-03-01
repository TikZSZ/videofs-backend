import { Controller, Get } from "@nestjs/common";


@Controller()
export class AppController {
  constructor(){}

  @Get("/user")
  user(){
    return "Hello world"
  }
}
