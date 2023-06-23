import { PrismaClient, Event, Prisma } from '@prisma/client';

export class EventRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  createEvent = (data: Prisma.EventCreateInput): Promise<Event> => {
    return this.prisma.event.create({ data });
  }
  
  updateEvent = (
    id: string,
    data: Prisma.EventUpdateInput
  ): Promise<Event> => {
    return this.prisma.event.update({ where: { id }, data });
  }

  deleteEvent = (id: string): Promise<Event | null> => {
    return this.prisma.event.delete({ where: { id } });
  }

  getEventsByUserId = (userId: string): Promise<Event[]> => {
    return this.prisma.event.findMany({ where: { userId } });
  }

  getEventsBySchedulerId = (schedulerId: string): Promise<Event[]> => {
    return this.prisma.event.findMany({ where: { schedulerId } });
  }
}
