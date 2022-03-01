import { Body, ClassSerializerInterceptor, Controller, Post,Request, UseInterceptors,UsePipes, ValidationPipe } from '@nestjs/common';
import { LoginDTO, UserDTO } from './dtos/user.dto';
import { UserEntity } from './interceptors/sanitizer';
import { UserService } from './user.service';
import { IJwtToken } from 'src/global/types/JwtToken';
import { JwtToken } from 'src/global/decorators/jwt.decorator';
import { AuthResponseInterceptor } from './interceptors/token.interceptor';


@Controller("api")
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor( private userService : UserService ){}
  
  @Post("/signup")
  @UseInterceptors(AuthResponseInterceptor, ClassSerializerInterceptor)
  async signUp(@Body() userPayload:UserDTO){
    const user = await this.userService.signUp(userPayload)
    return new UserEntity(user)
  }

  @Post("/signin")
  @UseInterceptors(AuthResponseInterceptor, ClassSerializerInterceptor)
  async signIn(@Body() userPayload:LoginDTO){
    const user = await this.userService.signIn(userPayload)
    return new UserEntity(user)
  }

  @Post("/auth")
  @UseInterceptors(AuthResponseInterceptor, ClassSerializerInterceptor)
  async auth(@JwtToken("user") jwtToken:IJwtToken){
    const user = await this.userService.auth(jwtToken.id)
    return new UserEntity(user)
  }  
}
