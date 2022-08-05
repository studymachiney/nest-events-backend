import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Logger,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, MoreThan, Repository } from 'typeorm';
import { Attendee } from './attendee.entity';
import { CreateEventDto } from './input/create-event.dto';
import { EventEntity } from './event.entity';
import { EventsService } from './event.service';
import { UpdateEventDto } from './input/update-event.dto';
import { ListEvents } from './input/list.events';

@Controller('/events')
export class EventsController {
  private readonly logger = new Logger(EventsController.name);

  constructor(
    @InjectRepository(EventEntity)
    private readonly repository: Repository<EventEntity>,
    @InjectRepository(Attendee)
    private readonly attendeeRepository: Repository<Attendee>,
    private readonly eventsService: EventsService,
  ) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  async findAll(@Query() filter: ListEvents) {
    const events =
      await this.eventsService.getEventsWithAttendeeCountFilteredPaginated(
        filter,
        {
          total: true,
          currentPage: filter.page,
          limit: 2,
        },
      );
    return events;
  }

  @Get('/practice')
  async practice() {
    return await this.repository.find({
      select: ['id', 'when'],
      where: [
        {
          id: MoreThan(3),
          when: MoreThan(new Date('2021-02-12T13:00:00')),
        },
        {
          description: Like('%meet%'),
        },
      ],
      take: 2,
      order: {
        id: 'DESC',
      },
    });
  }

  @Get('practice2')
  async practice2() {
    // return await this.repository.findOne({
    //   where: { id: 1 },
    //   // loadEagerRelations: false,
    //   // relations: ['attendees'],
    // });
    // const event = await this.repository.findOne({
    //   where: { id: 1 },
    //   relations: ['attendees'],
    // });

    // const attendee = new Attendee();
    // attendee.name = 'Using cascade';
    // // attendee.event = event;

    // event.attendees.push(attendee);

    // await this.repository.save(event);
    // // await this.attendeeRepository.save(attendee);

    // return event;
    return await this.repository
      .createQueryBuilder('e')
      .select(['e.id', 'e.name'])
      .orderBy('e.id', 'DESC')
      .take(3)
      .getMany();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const event = await this.eventsService.getEvent(id);

    if (!event) {
      throw new NotFoundException();
    }
    return event;
  }

  @Post()
  async create(@Body() input: CreateEventDto) {
    return await this.repository.save({
      ...input,
      when: new Date(input.when),
    });
  }

  @Patch(':id')
  async update(@Param('id') id, @Body() input: UpdateEventDto) {
    const event = await this.repository.findOne(id);

    if (!event) {
      throw new NotFoundException();
    }

    return await this.repository.save({
      ...event,
      ...input,
      when: input.when ? new Date(input.when) : event.when,
    });
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id) {
    const event = await this.repository.findOne(id);

    if (!event) {
      throw new NotFoundException();
    }

    await this.repository.remove(event);
  }
}
