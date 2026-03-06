import { Module } from '@nestjs/common';
import { AppGateway } from './events.gateway';

@Module({
  providers: [AppGateway],
  exports: [AppGateway],
})
export class EventsModule {}
