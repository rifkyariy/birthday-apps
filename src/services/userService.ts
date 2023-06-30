import { UserRepository } from '../repositories/userRepository';
import { User, Prisma } from '@prisma/client';

// additional imports
import { EventService  } from './eventService';

export class UserService {
  private userRepository: UserRepository;
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
    const databefore = await this.userRepository.getUserById(id);
    const user = await this.userRepository.updateUser(id, data);
    await this.updateEvent(user, 'birthday');
    
    // if anniversary is true, create anniversary event or update if exists 
    if (user?.anniversaryDate) {
      if(databefore?.anniversaryDate) {
        await this.updateEvent(user, 'anniversary');
      }else{
        await this.createEvent(user, 'anniversary');
      }
    }else{
      if(databefore?.anniversaryDate) {
        await this.deleteEvent(user, 'anniversary');
      }
    }

    return user;
  };

  deleteUser = async (id: string): Promise<User | null> => {
    const deletedUser = await this.userRepository.deleteUser(id);
    await this.deleteEvent(deletedUser, 'birthday');

    if (deletedUser?.anniversaryDate) {
      await this.deleteEvent(deletedUser, 'anniversary');
    }
    return deletedUser;
  };

  // EVENTS
  // Additional methods
  // hit the function whenever a user is created, updated, or deleted
  createEvent = (user:User, type:string): Promise<any> => {
   const date = type === 'birthday' ? user.birthdate : user.anniversaryDate;
   const eventDate = date?.getDate();
   const eventMonth = date?.getMonth() ?? 0 ;

    return this.eventService.createEvent({
      userId: user.id,
      type: type,
      isDynamicEvent: true,
      message: {
        data: `Hey, ${user.firstName} it's your ${type}`,
        email: user.email,
      },
      schedulerId: `${user.id}-${type}`,
      schedulerOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000, // 1, 2, 4,
        },
        repeat: {
          tz: user.timezone,
          cron: `0 9 ${eventDate} ${eventMonth + 1} *`,
          limit: 3
        },
      },
    });
  }

  updateEvent = async (user:any, type:string): Promise<any> => {
    const date = type === 'birthday' ? user.birthdate : user.anniversaryDate;
    const eventDate = date?.getDate();
    const eventMonth = date?.getMonth() ?? 0 ;

    const event = await this.eventService.getEventBySchedulerId(`${user.id}-${type}`);
    
    return this.eventService.updateEvent(event[0].id, {
      userId: user.id,
      type: type,
      isDynamicEvent: true,
      message: {
        data: `Hey, ${user.firstName} it's your ${type}`,
        email: user.email,
      },
      schedulerId: `${user.id}-${type}`,
      schedulerOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000, // 1, 2, 4,
        },
        repeat: {
          tz: user.timezone,
          cron: `0 9 ${eventDate} ${eventMonth + 1} *`,
          limit: 3
        },
      },
    });
  }

  deleteEvent = async (user:any, type:string): Promise<any> => {
    const schedulerId = `${user.id}-${type}`;
    const event = await this.eventService.getEventBySchedulerId(schedulerId);

    return this.eventService.deleteEvent(event[0].id, schedulerId);
  }




}
