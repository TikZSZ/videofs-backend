import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma.service';
import { UserService } from './user.service';



describe('UserService', () => {
  let service: UserService;
  let prismaService: PrismaService;
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports:[JwtModule.register({secret:"asdf"})],
      providers: [UserService, PrismaService],
    }).compile();

    service = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService)
  });

  beforeEach(async ()=>{
    await prismaService.user.deleteMany()
    await prismaService.city.deleteMany()
    await prismaService.state.deleteMany()
  })

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it("should hash and compare", async ()=>{
    const pswd = "HelloWorld"
    const hashPswd = await service.hashPass(pswd)
    const isCorrect = await service.compare(pswd,hashPswd)
    expect(isCorrect).toBe(true)
  })

  it("should create user and login user", async () => {
    const user = await createUser()

    // login user
    const loggedUser = await service.signIn({
      phoneNumber:"9989878891",
      password:"asdf"
    })
    expect(loggedUser.id).toEqual(user.id)
  })

  it("should get user from token", async () => {
    const user = await createUser()
    const userFromToken = await service.auth(user.id)
    console.log(userFromToken);
    
    expect(userFromToken.id).toEqual(user.id)
  })


  async function createUser(){
    const state = "uttarpradesh"
    const city = "obra"
    // create city and state record
    const s = await prismaService.state.create({
      data:{
        name:state,
        cities:{
          create:{
            name:city,
          }
        }
      },
      include:{
        cities:true
      }
    })
    // create user payload 
    const payload = {
      name:"Aditya",
      phoneNumber:"9989878891",
      password:"asdf",
      state:s.name,
      city:s.cities[0].name,
    }
    // create user
    const user = await service.signUp(payload)
    return user
  }
});


