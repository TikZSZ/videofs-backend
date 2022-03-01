import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { states } from 'src/global/constants/states';
import { PrismaService } from 'src/prisma.service';
import {genSalt,hash,compare} from "bcrypt"
import { IJwtToken } from 'src/global/types/JwtToken';



@Injectable()
export class UserService {
  constructor( private prisma : PrismaService ){}

  async signUp(userPayload : Prisma.UserCreateWithoutCityInput & {state:string,city:string}){
    const {city,state,password,...rest} = userPayload
    const existingCity = await this.prisma.city.findFirst({
      where:{
        name:city,
        state:{
          name:state
        }
      }
    })
    if(existingCity === null || undefined) throw new BadRequestException("city or state not found")
    
    const hashedPassword = await this.hashPass(password)

    return this.prisma.user.create({
      data:{
        ...rest,
        password:hashedPassword,
        city:{
          connect:{
            id:existingCity.id
          }
        }
      }
    })
  }

  async auth(userId:IJwtToken['id']){
    const user = await  this.prisma.user.findUnique({
      where:{
        id:userId
      }
    })
    if(!user) throw new NotFoundException()
    return user
  }

  async signIn(payload:{phoneNumber:string,password:string}){
    const user = await this.prisma.user.findUnique({
      where:{phoneNumber:payload.phoneNumber}
    })

    if(!user) throw new NotFoundException()
    const correctPass = await this.compare(payload.password,user.password)

    if(!correctPass) throw new UnauthorizedException()

    return user
  }

  compare(pswd:string,hashPswd:string){
    return compare(pswd,hashPswd)
  }

  async hashPass(pswd:string){
    const salt  = await genSalt(10)
    const hashedPassword = await hash(pswd,salt)
    return hashedPassword
  }
}
