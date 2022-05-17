import { PrivateKey } from '@hashgraph/cryptography';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma.service';
import { UserModule } from './user.module';
import { UserService } from './user.service';


let pubKey: string
let privKey: string
let accId: string

describe('UserService', () => {
  let service: UserService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [UserModule, ConfigModule.forRoot({
        envFilePath: `.env.test`,
        isGlobal: true,
      })],
      providers: [],
    }).compile();
    pubKey = process.env['PUBKEY']
    privKey = process.env['PRIVKEY']
    accId = process.env['ACCID']
    service = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService)
  });

  beforeEach(async () => {
    await prismaService.user.deleteMany()
    await prismaService.auth.deleteMany()
  })

  it('creats a auth record and returns token for user and refetches token', async () => {
    const token = await generateToken()
    const token2 = await service.getSigToken(token.accountId)
    expect(token.token).toEqual(token2.token)
    expect(token).toBeDefined()
  })

  it('creates a user and gets its current data', async () => {
    const { user, signature } = await createUser()
    expect(user.id).toBeDefined()
    const user2 = await service.getCurrentUser(user)
    expect(user.id).toEqual(user2.id)
  })

  it('logs in a user', async () => {
    const { user } = await createUser()
    const token = await service.getSigToken(user.authAccountId)
    const signature = PrivateKey.fromString(privKey).sign(Buffer.from(token.token, 'base64'))
    const user2 = await service.loginUser({  signature: Buffer.from(signature).toString('base64') },user.authAccountId)
    expect(user.id).toEqual(user2.id)
  })

  async function createUser() {
    const token = await generateToken()
    const signature = PrivateKey.fromString(privKey).sign(Buffer.from(token.token, 'base64'))
    const user = await service.createUser({ name: 'Aditya', userCid: "adasdad" }, { accountId: token.accountId, signature: Buffer.from(signature).toString('base64') })
    return { user, signature }
  }

  function generateToken() {
    return service.generateToken({ diCid: "adad", key: pubKey, keyType: "ED25519", }, accId)
  }

});


