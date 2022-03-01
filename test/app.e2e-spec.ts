import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from 'src/prisma.service';


const payload = {
  name:"Aditya",
  phoneNumber:"0123456789",
  password:"asdfffff",
  state:"uttarpradesh",
  city:"obra"
}
describe('User Controller (e2e)', () => {
  let app: INestApplication;
  let prismaService : PrismaService
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    prismaService = await moduleFixture.resolve<PrismaService>(PrismaService)
    await app.init();
  });

  beforeEach(async ()=>{
    await prismaService.user.deleteMany()
    await prismaService.city.deleteMany()
    await prismaService.state.deleteMany()
  })

  it("shouldn't create user", async () => {
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
    
    let resp=  await request(app.getHttpServer())
      .post('/api/signup')
      .send({...payload,password:"",phoneNumber:" "})
      expect(resp.body.message.length).toEqual(2)
      
    resp = await request(app.getHttpServer())
      .post('/api/signup')
      .send({...payload,city:" "})
    expect(resp.statusCode).toEqual(400)
    
  })

  it("should create user and return its jwt token", async ()=>{
    // create user
    const {resp,payload} = await createUser()
    expect(resp.body.id).toBeDefined()
    expect(resp.body.password).toBeUndefined()
    const token = resp.headers['authorization'] as string
    expect(token).toBeDefined()
    expect(token.split(" ")[0]).toEqual("Bearer")
  })

  it("should return user info from jwt token", async () => {
    // create a user
    const {resp,payload} = await createUser()
    // get the user token
    const token = resp.headers['authorization'] as string
    // request user info from token
    const resp2 = await request(app.getHttpServer())
      .post("/api/auth")
      .set("authorization",token)
    // user info from token should be similar  
    expect(resp2.body).toEqual(resp.body)
    expect(resp2.body.phoneNumber).toBeUndefined()
  })

  it("should login user", async () => {
    const {resp,payload} = await createUser()
    const resp2 = await request(app.getHttpServer())
      .post("/api/signin")
      .send({
        phoneNumber:payload.phoneNumber,
        password:payload.password
      })
      expect(resp2.body.id).toBeDefined()
      expect(resp.body.password).toBeUndefined()
      const token = resp2.headers['authorization'] as string
      expect(token).toBeDefined()
      expect(token.split(" ")[0]).toEqual("Bearer")
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
    const resp=  await request(app.getHttpServer())
      .post('/api/signup')
      .send(payload)
    return {resp,payload}
  }
});
