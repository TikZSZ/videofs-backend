import { Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { states } from "./states";

@Injectable()
export class Init implements OnModuleInit {
  constructor(private prisma : PrismaService){}
  async onModuleInit() {
    await this.initializeLocation()
  }

  async initializeLocation(){
    const s = await this.prisma.state.findMany()
    if(s.length > 0) {
      return 
    }
    const statePromises = Object.values(states).map((state) => {
      return this.prisma.state.create({
        data:{
          name:state.name,
          cities:{
            create:Object.values(state.cities)
          }
        }
      })
    })
    const settledStates = await  Promise.all(statePromises)
    return settledStates
  }
}
