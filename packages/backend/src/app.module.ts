import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { EthersModule, GOERLI_NETWORK } from 'nestjs-ethers';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    HttpModule,
    EthersModule.forRoot({
      network: GOERLI_NETWORK,
      alchemy: process.env.ALCHEMY_API_KEY,
      etherscan: process.env.ETHERSCAN_API_KEY,
      // cloudflare: true,
      // infura: {
      //   projectId: 'd71b3d93c2fcfa7cab4924e63298575a',
      //   projectSecret: 'ed6baa9f7a09877998a24394a12bf3dc',
      // },
      // quorum: 1,
      // useDefaultProvider: true,
    }),
    EventsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
