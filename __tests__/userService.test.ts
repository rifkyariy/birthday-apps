import { UserRepository } from '../src/repositories/userRepository';
import { EventRepository } from '../src/repositories/eventRepository';

import { User, Prisma,PrismaClient } from '@prisma/client';
import { EventService } from '../src/services/eventService';
import { UserService } from '../src/services/userService';
import { SchedulerService } from '../src/services/schedulerService';

describe('UserService', () => {
  let userRepository: UserRepository;
  let eventRepository: EventRepository;

  let schedulerService: SchedulerService;
  let eventService: EventService;
  let userService: UserService;
  const prisma = new PrismaClient();

  beforeEach(() => {
    userRepository = new UserRepository(prisma);
    eventService = new EventService(eventRepository, schedulerService);
    userService = new UserService(userRepository, eventService);
  
  });

  describe('createUser', () => {
    it('should create a user and create birthday event', async () => {
      // Mock user data
      const userData: Prisma.UserCreateInput = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@doe.com',
        birthdate: new Date('1990-01-01'),
        anniversaryDate: new Date('2020-01-01'),
        location: 'Jakarta',
        timezone: 'Asia/Jakarta',
      };

      // Mock created user
      const createdUser: User = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@doe.com',
        birthdate: new Date('1990-01-01'),
        anniversaryDate: new Date('2020-01-01'),
        location: 'Jakarta',
        timezone: 'Asia/Jakarta',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock eventService createEvent function
      eventService.createEvent = jest.fn().mockResolvedValue({});

      // Mock userRepository createUser function
      userRepository.createUser = jest.fn().mockResolvedValue(createdUser);

      // Call the createUser method
      const result = await userService.createUser(userData);

      // Assertions
      expect(result).toEqual(createdUser);
      expect(userRepository.createUser).toHaveBeenCalledWith(userData);
      expect(eventService.createEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: createdUser.id,
          type: 'birthday',
          isDynamicEvent: true,
          // Add your expected message and scheduler properties here
        })
      );
    });
  });

});
