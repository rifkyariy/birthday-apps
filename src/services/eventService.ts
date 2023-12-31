import { EventRepository } from '../repositories/eventRepository';
import { Event, Prisma } from '@prisma/client';

// additional imports
import { SchedulerService  } from './schedulerService';

export class EventService {
  private eventRepository: EventRepository;
  private schedulerService: SchedulerService;

  constructor(eventRepository: EventRepository, schedulerService: SchedulerService) {
    this.eventRepository = eventRepository;
    this.schedulerService = schedulerService;
  }

  getEvents = (): Promise<Event[]> => {
    return this.eventRepository.getEvents();
  }

  getEventById = (id: string): Promise<Event | null> => {
    return this.eventRepository.getEventById(id);
  };

  getEventBySchedulerId = (schedulerId: string): Promise<Event[]> => {
    return this.eventRepository.getEventsBySchedulerId(schedulerId);
  };

  createEvent = async (data: Prisma.EventCreateInput): Promise<Event> => {
    const event = await this.eventRepository.createEvent(data);
    await this.createScheduler(event);
    return event
  };

  updateEvent = async (
    id: string,
    data: Prisma.EventUpdateInput
  ): Promise<Event> => {
    const event = await this.eventRepository.updateEvent(id, data);

    await this.deleteScheduler(event.schedulerId);
    await this.createScheduler(event);

    return event;
  };

  deleteEvent = async (id: string, schedulerId:string): Promise<Event | null> => {
    await this.deleteScheduler(schedulerId);
    return this.eventRepository.deleteEvent(id);
  };


  // SCHDULER
  // the scheduler is gonna trigger whenever the event is created, updated and deleted
  createScheduler = async (event: Event): Promise<void> => {
    const schedule = await this.schedulerService.createScheduler(event);
    return schedule;
  }

  deleteScheduler = async (schedulerId: string): Promise<void> => {
    const schedule = await this.schedulerService.deleteScheduler(schedulerId);
    return schedule;
  }
}
