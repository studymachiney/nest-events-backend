import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendee } from './attendee.entity';
import { EventEntity } from './event.entity';
import { EventsService } from './event.service';
import { EventsController } from './events.controller';

@Module({
  imports: [TypeOrmModule.forFeature([EventEntity, Attendee])],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
