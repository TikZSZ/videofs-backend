import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from 'src/prisma.service';
import { ConfigService } from '@nestjs/config';

const phoneNumber = '+910123456789'
const payload = {
  name: 'Aditya',
  phoneNumber,
  password: 'asdfffff',
  state: 'uttarpradesh',
  city: 'obra',
};


describe('User Controller (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let expireTime :number
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    prismaService = await moduleFixture.resolve<PrismaService>(PrismaService);
    await app.init();
  });

  beforeEach(async () => {
    await prismaService.user.deleteMany();
  });

  it('should create user and return its jwt token', async () => {
    // create user
    const { resp, payload } = await createUser();
    expect(resp.body.id).toBeDefined();
    expect(resp.body.password).toBeUndefined();
    const token = resp.headers['authorization'] as string;
    expect(token).toBeDefined();
    expect(token.split(' ')[0]).toEqual('Bearer');
    const { resp: recreatedUser } = await createUser();
    expect(recreatedUser.statusCode).toEqual(403);
  });

  async function createUser() {
    const resp = await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send(payload);
    return { resp, payload };
  }
  
});
