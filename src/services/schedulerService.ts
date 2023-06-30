const { Queue } = require('bullmq')
import { Job, Worker, JobsOptions } from 'bullmq';
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
        port: process.env.REDIS_PORT || '6379'
      }
    };
    
    
  }

  // Create Scheduler
  async createScheduler(event:Event): Promise<void> {
    const {schedulerId, schedulerOptions} = event;
    const payload = event.message;
    
    // console.log(payload, schedulerOptions);

    // testing using cron timezone
    const testTZ = { 
      repeat: { 
        tz: 'Asia/Jakarta', 
        cron: '27 12 30 6 *',
        limit: 3,
      },
    };

    const retryOptions: JobsOptions = {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000, // 1, 2, 4,
      },
    };

    // queue scheduler
    const queueScheduler = new Queue('emailQueue', this.connectionOptions);
    queueScheduler.add(event.schedulerId, payload, schedulerOptions);

    // testing with dummy
    // queueScheduler.add(event.schedulerId, payload, { ...testTZ, ...retryOptions });

    // send to message service
    const worker = new Worker('emailQueue', async (job: Job) => {
      // try send message and catch error
      try {
        await this.messageService.sendMail(job.data);
      } catch (error:any) {
        console.error('Error:', error.message);
        throw new Error(error);
      }

      // Test using math random to throw error
      // if (Math.random() < 0.5) {
      //   console.log('failed', job.data);
      //   throw new Error('failed');
      // }
      // console.log('success', job.data);
    });

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