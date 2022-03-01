import { Controller, Get } from '@nestjs/common';

@Controller('api')
export class BarberController {
  @Get("/barber")
  get(){
    return {
      name: "Aditya",
      class: "9th",
      type:"Barber"
    }
  }
}
