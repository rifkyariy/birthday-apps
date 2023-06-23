import { Request, Response } from 'express';
import moment from 'moment-timezone';

import { BaseController } from './baseController';
import { UserService } from '../services/userService';

export class UserController extends BaseController {
  protected service: UserService;

  constructor(userService: UserService) {
    super();
    this.service = userService;
  }

  private searchTimezonByLocation = (location: string): string => {
    // Replace spaces with underscores
    location = location.replace(/ /g, '_');

    // Get all timezones
    const timezones = moment.tz.names();
    const timezone = timezones.find((tz) => tz.toLowerCase().includes(location.toLowerCase()));
    
    // If timezone not found, return client timezone
    return timezone || moment.tz.guess();
  };

  getUsers = async (req: Request, res: Response): Promise<void> => {
    await this.handleRequest(req, res, async () => {
      return this.service.getUsers();
    });
  };

  getUserById = async (req: Request, res: Response): Promise<void> => {
    await this.handleRequest(req, res, async () => {
      const { id } = req.params;
      const user = await this.service.getUserById(id);
      if (!user) {
        this.handleNotFound(req, res, 'User not found');
      }
      return user;
    });
  };

  createUser = async (req: Request, res: Response): Promise<void> => {
    await this.handleRequest(req, res, async () => {
      let { firstName, lastName, email, birthdate, location } = req.body;

      // convert birthday to Date object
      birthdate = new Date(birthdate);

      // get timezone from location string or client timezone
      const timezone = this.searchTimezonByLocation(location);

      return this.service.createUser({
        firstName,
        lastName,
        email,
        birthdate,
        location,
        timezone,
        
      });
    });
  };

  updateUser = async (req: Request, res: Response): Promise<void> => {
    await this.handleRequest(req, res, async () => {
      const { id } = req.params;
      let { firstName, lastName, email, birthdate, location } = req.body;

      // convert birthday to Date object
      birthdate = new Date(birthdate);

      // get timezone from location string or client timezone
      const timezone = this.searchTimezonByLocation(location);

      return this.service.updateUser(id, {
        firstName,
        lastName,
        email,
        birthdate,
        location,
        timezone,
      });
    });
  };

  deleteUser = async (req: Request, res: Response): Promise<void> => {
    await this.handleRequest(req, res, async () => {
      const { id } = req.params;
      return this.service.deleteUser(id);
    });
  };
}
