import { Module, ModuleMetadata } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { ChannelController } from './channel.controller';
import { UserModule } from 'src/user/user.module';
import { BullModule, BullModuleOptions } from '@nestjs/bull';
import { FFmpegService } from 'src/FFmpeg.service';
import { VideoConsumer } from './Processor';
import { VIDEO_PROCESSOR_QUEUE } from './video.que.name';
import { FileService } from './file.service';
import { Web3Module } from './IpfsModule/ipfs.module';
import { Web3ConfigService } from './web3.config.service';
import { ConfigService } from '@nestjs/config';

const queOptions: BullModuleOptions = {
  name: VIDEO_PROCESSOR_QUEUE,
};
@Module({
  imports: [
    UserModule,
    BullModule.registerQueue(queOptions),
    Web3Module.registerAsync({
      useClass: Web3ConfigService,
    }),
  ],
  providers: [ChannelService, FFmpegService, VideoConsumer, FileService],
  controllers: [ChannelController],
})
export class ChannelModule {}
