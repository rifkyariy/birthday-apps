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

  private searchTimezoneByLocation = (location: string): string => {
    // Replace spaces with underscores
    location = location.replace(/ /g, '_');

    // Get all timezones
    const timezones = moment.tz.names();
    const timezone = timezones.find((tz) => tz.toLowerCase().includes(location.toLowerCase()));
    
    // If timezone not found, return client timezone
    return timezone || moment.tz.guess();
  };

  createUser = async (req: Request, res: Response): Promise<void> => {
    await this.handleRequest(req, res, async () => {
      let { firstName, lastName, email, birthdate, location } = req.body;

      // convert birthday to Date object
      birthdate = new Date(birthdate);

      // get timezone from location string or client timezone
      const timezone = this.searchTimezoneByLocation(location);

      // adding anniversaryDate to user
      if(req.body.anniversaryDate) {
        let { anniversaryDate } = req.body;
        anniversaryDate = new Date(anniversaryDate);
        return this.service.createUser({
          firstName,
          lastName,
          email,
          birthdate,
          location,
          timezone,
          anniversaryDate,
        });
      }

      // create user
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
      const timezone = this.searchTimezoneByLocation(location);
    
      // adding anniversaryDate to user
      if(req.body.anniversaryDate) {
        let { anniversaryDate } = req.body;
        anniversaryDate = new Date(anniversaryDate);
        return this.service.updateUser(id, {
          firstName,
          lastName,
          email,
          birthdate,
          location,
          timezone,
          anniversaryDate,
        });
      }

      // update user
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
