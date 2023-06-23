const { Queue } = require('bullmq')
import { Job } from 'bullmq';
import {MessageService} from './messageService';
import { Event } from '@prisma/client';


export class SchedulerService {
  private messageService: MessageService;
  private connectionOptions: { connection: { host: string; port: string; }}

  constructor(messageService: MessageService) {
    this.messageService = messageService;
    
    this.connectionOptions = {
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORt || '6379'
      }
    };
  }

  // Create Scheduler
  async createScheduler(event:Event): Promise<void> {
    const schedulerId = event.schedulerId;
    const payload = event.message;
    const schedulerOptions = event.schedulerOptions;

    console.log(payload, schedulerOptions);

    // testing using cron timezone
    const testTZ = { 
      repeat: { 
        tz: 'Asia/Jakarta', 
        cron: '49 12 23 6 *',
        limit: 5
      }
    };

    // testing using every
    const queueScheduler = new Queue('emailQueue',  this.connectionOptions);
    queueScheduler.add(event.schedulerId, payload, testTZ)
    this.messageService.addMailWorker(schedulerId, payload);

    const jobs: Job[] = await queueScheduler.getRepeatableJobs();

    console.log('scheduler created', schedulerId, payload, schedulerOptions);
  }

  async deleteScheduler(schedulerId:string): Promise<void> {
    const queueScheduler = new Queue('emailQueue',  this.connectionOptions);
    console.log('deleteScheduler', schedulerId);

    const jobs: any = await queueScheduler.getRepeatableJobs();

    // find by key
    for(let i = 0; i < jobs.length; i++) {
      if(jobs[i].name === schedulerId){
        await queueScheduler.removeRepeatableByKey(jobs[i].key);
      }
    }

    console.log('scheduler deleted', schedulerId);
  }

}