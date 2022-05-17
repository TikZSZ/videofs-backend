import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';
import { ChannelModule } from './channel.module';
import { ChannelService } from './channel.service';

describe('ChannelService', () => {
  let channelService: ChannelService;
  let userService:UserService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports:[ChannelModule,ConfigModule.forRoot({
        envFilePath: `.env.test`,
        isGlobal: true,
      })],
    }).compile();

    channelService = module.get<ChannelService>(ChannelService);
    userService = module.get<UserService>(UserService)
  });

  it('should be defined', () => {
    expect(channelService).toBeDefined();
    expect(userService).toBeDefined();
  });
});
