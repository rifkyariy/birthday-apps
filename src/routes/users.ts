// libraries
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

// controllers
import { UserController } from '../controllers/userController';

// services
import { UserService } from '../services/userService';
import { EventService } from '../services/eventService';
import { SchedulerService } from '../services/schedulerService';

// repositories
import { UserRepository } from '../repositories/userRepository';
import { EventRepository } from '../repositories/eventRepository';
import { MessageService } from '../services/messageService';


// prerequisites
const prisma = new PrismaClient();
const router = Router();

// repositories
const userRepository = new UserRepository(prisma);
const eventRepository = new EventRepository(prisma);

// services
const messageService = new MessageService();
const schedulerService = new SchedulerService(messageService);
const eventService = new EventService(eventRepository, schedulerService);
const userService = new UserService(userRepository, eventService);

// controllers
const userController = new UserController(userService);

// routes
router.post('/', async (req, res) => {
  await userController.createUser(req, res);
});

router.put('/:id', async (req, res) => {
  await userController.updateUser(req, res);
});

router.delete('/:id', async (req, res) => {
  await userController.deleteUser(req, res);
});

export default router;
