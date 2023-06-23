import { UserRepository } from '../repositories/userRepository';
import { User, Prisma } from '@prisma/client';

// additional imports
import { EventService  } from './eventService';

export class UserService {
  private userRepository: UserRepository;
  // private eventRepository: EventRepository;
  private eventService: EventService; 

  constructor(userRepository: UserRepository, eventService: EventService) {
    this.userRepository = userRepository;
    this.eventService = eventService;
  }

  createUser = async (data: Prisma.UserCreateInput): Promise<User> => {
    const user = await this.userRepository.createUser(data);
    await this.createEvent(user, 'birthday');

    // if anniversary is true, create anniversary event
    if (user.anniversaryDate) {
      await this.createEvent(user, 'anniversary');
    }

    return user;
  };

  updateUser = async (
    id: string,
    data: Prisma.UserUpdateInput
  ): Promise<User | null> => {
    const user = await this.userRepository.updateUser(id, data);
    await this.updateEvent(user, 'birthday');

    if (user?.anniversaryDate) {
      await this.updateEvent(user, 'anniversary');
    }

    return user;
  };

  deleteUser = async (id: string): Promise<User | null> => {
    const deletedUser = await this.userRepository.deleteUser(id);
    await this.deleteEvent(deletedUser);
    return deletedUser;
  };


  
  // EVENTS
  // Additional methods
  
  createEvent = (user:User, type:string): Promise<any> => {
    return this.eventService.createEvent({
      userId: user.id,
      type: type,
      isDynamicEvent: true,
      message: {
        data: `Hey, ${user.firstName} it's your birthday`,
        email: user.email,
      },
      schedulerId: `${user.id}-birthday`,
      schedulerOptions: {
        repeat: {
          tz: user.timezone,
          cron: `0 9 ${user.birthdate.getDate()} ${user.birthdate.getMonth() + 1} *`,
        },
      },
    });
  }

  updateEvent = async (user:any, type:string): Promise<any> => {
    const event = await this.eventService.getEventBySchedulerId(`${user.id}-birthday`);
    
    return this.eventService.updateEvent(event[0].id, {
      userId: user.id,
      type: type,
      isDynamicEvent: true,
      message: {
        data: `Hey, ${user.firstName} it's your birthday`,
        email: user.email,
      },
      schedulerId: `${user.id}-birthday`,
      schedulerOptions: {
        repeat: {
          tz: user.timezone,
          cron: `0 9 ${user.birthdate.getDate()} ${user.birthdate.getMonth() + 1} *`,
        },
      },
    });
  }

  deleteEvent = async (user:any): Promise<any> => {
    const event = await this.eventService.getEventBySchedulerId(`${user.id}-birthday`);

    return this.eventService.deleteEvent(event[0].id);
  }




}
